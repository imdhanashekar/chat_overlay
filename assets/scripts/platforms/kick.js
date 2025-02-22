class URLParams {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
    }

    getParam(param) {
        return this.urlParams.get(param);
    }
}

class PageSetup {
    constructor(params) {
        this.params = params;
        this.maxMessages = 100;
    }

    applyCustomisation() {
        if (this.params.getParam("external-css")) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = this.params.getParam("external-css");
            document.head.appendChild(link);
        }
    }
}

class Chatroom {
    constructor(
        user,
        maxMessages,
        showBadges,
        hideCommands,
        showBots
    ) {
        this.user = user;
        this.maxMessages = maxMessages || 100;
        this.subBadges = [];
        this.emotes = {};
        this.animate = true;
        this.fade = 30;
        this.showBadges = showBadges !== "true";
        this.hideCommands = hideCommands === "true";
        this.showBots = showBots === "true";

        this.seventvbadges = {};
        this.seventvpaints = {};
        this.userInfoCache = {};
        this.seventvProfileCache = {};
        this.chat = null;
        this.reconnectAttempts = 0;
        this.reconnectInterval = 60000; // 1 minuto
    }

    async fetchData(url) {
        let response;
        while (!response || !response.ok) {
            try {
                response = await fetch(url);
                if (!response.ok) {
                    console.log("Error: " + response.status);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.log("Error: " + error);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        return response;
    }

    async getUserInfo(userToFetch) {
        const response = await this.fetchData(`https://kick.com/api/v2/channels/${userToFetch}`);
        return await response.json();
    }

    async getSubBadgesAndEmotes(userData) {
        if (!userData || !userData.user_id) {
            console.error("Invalid userData provided to getSubBadgesAndEmotes");
            return;
        }

        const response = await this.get7TVProfile(userData.user_id);
        if (response && response.emote_set && response.emote_set.id) {
            this.loadEmotes(response.emote_set.id);
        } else {
            console.log("No valid 7TV emote set found for user " + userData.user_id);
        }
        this.subBadges = userData.subscriber_badges || [];
        this.subBadges.sort((a, b) => a.months - b.months);
    }

    async get7TVProfile(userID) {
        try {
            const response = await fetch(`https://7tv.io/v3/users/kick/${userID}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log("No 7TV profile found for " + userID);
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.log("7TV Error: " + error);
            return null;
        }
    }

    loadEmotes(emoteSetID) {
        const endpoints = ["emote-sets/global", `emote-sets/${encodeURIComponent(emoteSetID)}`];
        endpoints.forEach((endpoint) => {
            fetch(`https://7tv.io/v3/${endpoint}`)
                .then(res => res.json())
                .then(res => {
                    res.emotes.forEach((emote) => {
                        this.emotes[emote.name] = {
                            id: emote.id,
                            image: `https://cdn.7tv.app/emote/${emote.id}/4x.webp`,
                            zeroWidth: emote.flags === 1,
                        };
                    });
                });
        });
    }

    connectToChatroom(chatroomID, channelID) {
        this.chat = new WebSocket(
            `wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false`
        );

        this.chat.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        this.chat.onopen = () => {
            console.log("Connected to Kick chat");
            this.reconnectAttempts = 0; // Resetar tentativas ao conectar
            this.subscribeToChannel(`chatrooms.${chatroomID}.v2`);
            this.subscribeToChannel(`channel.${channelID}`);
            this.startPing();
        };

        this.chat.onmessage = (event) => this.parseMessage(event.data);

        this.chat.onclose = () => {
            console.log("WebSocket connection closed");
            this.handleReconnect(chatroomID, channelID);
        };
    }

    subscribeToChannel(channelName) {
        if (this.chat && this.chat.readyState === WebSocket.OPEN) {
            this.chat.send(JSON.stringify({
                event: "pusher:subscribe",
                data: { auth: null, channel: channelName },
            }));
        }
    }

    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.chat && this.chat.readyState === WebSocket.OPEN) {
                this.chat.send(JSON.stringify({ event: "pusher:ping", data: {} }));
            }
        }, 60000);
    }

    handleReconnect(chatroomID, channelID) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (Attempt ${this.reconnectAttempts})...`);

        // Limpar intervalo de ping anterior
        clearInterval(this.pingInterval);

        setTimeout(() => {
            this.connectToChatroom(chatroomID, channelID);
        }, this.reconnectInterval);
    }

    parseMessage(message) {
        const msg = JSON.parse(message);
        const data = JSON.parse(msg.data.replace(/\\[nrtfbv\\]/g, " ").replace(/\\u00a0/g, " "));

        if (msg.event === "App\\Events\\ChatMessageEvent") {
            this.handleMessage(data);
        } else if (msg.event === "App\\Events\\MessageDeletedEvent") {
            this.handleDelete(data);
        } else if (msg.event === "App\\Events\\ChatroomClearEvent") {
            this.handleClear(data);
        } else if (msg.event === "App\\Events\\UserBannedEvent") {
            this.handleBan(data);
        }
    }

    handleMessage(data) {
        const { id: msgID, content, sender, created_at: msgTimestamp } = data;
        const { identity } = sender;

        if (this.hideCommands && content.startsWith("!")) return;
        if (!this.showBots && ["livebot", "corardbot", "botrix", "mrbeefbot"].includes(sender.username.toLowerCase())) return;

        let parsedContent = this.parseEmotes(content);
        parsedContent = this.parseKickEmojis(parsedContent);
        parsedContent = this.parse7TVEmotes(parsedContent);

        this.createAndAppendMsg({
            msgID,
            msgSender: sender,
            msgIdentity: identity,
            msgTimestamp,
            msgContent: parsedContent,
        });
    }

    parseEmotes(content) {
        const emoteRegex = /\[emote:(\d+):?([\w\s\-~!@#$%^&*()_+=\{}\\|;:'",.<>\/?]+)\]/g;
        return content.replace(emoteRegex, (_, emoteId) =>
            `<img src="https://d2egosedh0nm8l.cloudfront.net/emotes/${emoteId}/fullsize" class="emote">`);
    }

    parseKickEmojis(content) {
        const kickEmojiRegex = /\[emoji:(\w+)\]/g;
        return content.replace(kickEmojiRegex, (_, emojiName) =>
            `<img src="https://dbxmjjzl5pc1g.cloudfront.net/9ad84c86-99f0-4f0a-8e1a-baccf20502b9/images/emojis/${emojiName}.png" class="emote">`);
    }

    parse7TVEmotes(content) {
        return content.split(" ").map(word =>
            this.emotes[word] ? `<img class="emote" src="${this.emotes[word].image}">` : word
        ).join(" ");
    }

    async createAndAppendMsg({ msgID, msgSender, msgIdentity, msgTimestamp, msgContent }) {
        const msg = document.createElement("div");
        msg.classList.add("chat_line");
        msg.setAttribute("data-id", msgID);
        msg.setAttribute("data-sender", msgSender.username);

        const msgInfo = document.createElement("span");
        msgInfo.classList.add("user_info");

        const msgUsernameSpan = document.createElement("span");
        msgUsernameSpan.classList.add("username");
        msgUsernameSpan.style.color = msgIdentity.color || "#fff";
        msgUsernameSpan.textContent = msgSender.username;

        const msgColonSpan = document.createElement("span");
        msgColonSpan.classList.add("username", "colon");
        msgColonSpan.textContent = ": ";

        const msgContentSpan = document.createElement("span");
        msgContentSpan.classList.add("message");
        msgContentSpan.innerHTML = msgContent;

        if (this.showBadges) {
            const badges = await this.badges(msgSender, msgIdentity);
            if (badges.badgesArray) {
                const msgBadgesSpan = document.createElement("span");
                msgBadgesSpan.innerHTML = badges.badgesArray;
                msgInfo.appendChild(msgBadgesSpan);
                msgInfo.appendChild(document.createTextNode(" "));
            }
        } else {
            msgInfo.appendChild(document.createTextNode(" "));
        }

        msgInfo.appendChild(msgUsernameSpan);
        msgInfo.appendChild(msgColonSpan);
        msg.appendChild(msgInfo);
        msg.appendChild(msgContentSpan);

        this.handleAnimationAndFading(msg);
        this.handleMessageLimit();

        document.getElementById("chat").appendChild(msg);
    }

    handleAnimationAndFading(msg) {
        if (this.animate) {
            msg.style.animation = `anim ${this.fade}s`;
            msg.style.animationFillMode = "forwards";
        }
    }

    handleMessageLimit() {
        const messages = document.querySelectorAll(".chat_line");
        if (messages.length > this.maxMessages) {
            messages[0].remove();
        }
    }

    handleDelete(data) {
        const msg = document.querySelector(`[data-id="${data.message.id}"]`);
        if (msg) msg.remove();
    }

    handleBan(data) {
        document.querySelectorAll(`[data-sender="${data.user.username}"]`)
            .forEach(msg => msg.remove());
    }

    handleClear() {
        document.getElementById("chat").innerHTML = "";
    }

    async badges(msgSender, msgIdentity) {
        let badgesArray = "";
        const userBadges = msgIdentity.badges || [];

        for (const badge of userBadges) {
            if (badge.type === "subscriber") {
                const subAge = badge.count;
                const matchingBadge = this.subBadges
                    .filter(b => subAge >= b.months)
                    .sort((a, b) => b.months - a.months)[0];
                if (matchingBadge) {
                    badgesArray += `<img src="${matchingBadge.badge_image.src}" class="badge">`;
                }
            } else {
                badgesArray += `<img src="assets/images/${badge.type}.svg" class="badge">`;
            }
        }

        return { badgesArray };
    }
}

// Inicialização
const urlParams = new URLParams();
const pageSetup = new PageSetup(urlParams);

if (!urlParams.getParam("kick")) {
    console.error("Kick channel parameter not provided");
} else {
    const chatroom = new Chatroom(
        urlParams.getParam("kick"),
        pageSetup.maxMessages,
        urlParams.getParam("hide_badges"),
        urlParams.getParam("hide_commands"),
        urlParams.getParam("bots")
    );

    function initializeChat() {
        chatroom.getUserInfo(urlParams.getParam("kick"))
            .then(userData => {
                chatroom.getSubBadgesAndEmotes(userData);
                chatroom.connectToChatroom(userData.chatroom.id, userData.chatroom.channel_id);
            })
            .catch(error => {
                console.error("Failed to initialize chat:", error);
                setTimeout(initializeChat, 1000);
            });
    }

    initializeChat();
    pageSetup.applyCustomisation();
}