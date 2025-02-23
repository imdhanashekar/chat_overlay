(function ($) {
    $.QueryString = (function (paramsArray) {
        let params = {};
        for (let i = 0; i < paramsArray.length; ++i) {
            let param = paramsArray[i].split('=', 2);
            if (param.length !== 2) continue;
            params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
        }
        return params;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

// Função para escapar caracteres especiais em expressões regulares
function escapeRegExp(string) { // Thanks to coolaj86 and Darren Cook (https://stackoverflow.com/a/6969486)
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Função para escapar caracteres HTML
function escapeHtml(message) {
    return message
        .replace(/&/g, "&amp;")
        .replace(/(<)(?!3)/g, "&lt;")
        .replace(/(>)(?!\()/g, "&gt;");
}

// Função para fazer requisições à API da Twitch
function TwitchAPI(endpoint) {
    // Se pelo menos o token estiver na URL, usar a API direta da Twitch
    if (Chat.info.token) {
        const clientId = Chat.info.clientId || 'gp762nuuoqcoxypju8c569th9wz7q5'; // Fallback para clientId padrão
        return $.ajax({
            url: `https://api.twitch.tv/helix/${endpoint}`,
            method: 'GET',
            headers: {
                'Client-ID': clientId,
                'Authorization': 'Bearer ' + Chat.info.token
            }
        });
    } else {
        // Caso contrário, usar o proxy do servidor
        return $.ajax({
            url: `/twitch-api/${endpoint}`,
            method: 'GET'
        });
    }
}

Chat = {
    info: {
        channel: null,
        token: $.QueryString.token || null, // Token da URL como fallback
        clientId: $.QueryString.clientId || 'gp762nuuoqcoxypju8c569th9wz7q5', // Client ID da URL ou padrão
        animate: ('animate' in $.QueryString ? ($.QueryString.animate.toLowerCase() === 'true') : false),
        showBots: ('bots' in $.QueryString ? ($.QueryString.bots.toLowerCase() === 'true') : false),
        hideCommands: ('hide_commands' in $.QueryString ? ($.QueryString.hide_commands.toLowerCase() === 'true') : false),
        hideBadges: ('hide_badges' in $.QueryString ? ($.QueryString.hide_badges.toLowerCase() === 'true') : false),
        fade: ('fade' in $.QueryString ? parseInt($.QueryString.fade) : false),
        emotes: {},
        badges: {},
        userBadges: {},
        ffzapBadges: null,
        bttvBadges: null,
        chatterinoBadges: null,
        cheers: {},
        lines: [],
        blockedUsers: ('block' in $.QueryString ? $.QueryString.block.toLowerCase().split(',') : false),
        bots: ['streamelements', 'streamlabs', 'nightbot', 'moobot', 'fossabot']
    },

    loadEmotes: function (channelID) {
        Chat.info.emotes = {};
        // Load BTTV, FFZ emotes
        ['emotes/global', 'users/twitch/' + encodeURIComponent(channelID)].forEach(endpoint => {
            $.getJSON('https://api.betterttv.net/3/cached/frankerfacez/' + endpoint).done(function (res) {
                res.forEach(emote => {
                    if (emote.images['4x']) {
                        var imageUrl = emote.images['4x'];
                        var upscale = false;
                    } else {
                        var imageUrl = emote.images['2x'] || emote.images['1x'];
                        var upscale = true;
                    }
                    Chat.info.emotes[emote.code] = {
                        id: emote.id,
                        image: imageUrl,
                        upscale: upscale
                    };
                });
            });
        });

        ['emotes/global', 'users/twitch/' + encodeURIComponent(channelID)].forEach(endpoint => {
            $.getJSON('https://api.betterttv.net/3/cached/' + endpoint).done(function (res) {
                if (!Array.isArray(res)) {
                    res = res.channelEmotes.concat(res.sharedEmotes);
                }
                res.forEach(emote => {
                    Chat.info.emotes[emote.code] = {
                        id: emote.id,
                        image: 'https://cdn.betterttv.net/emote/' + emote.id + '/3x',
                        zeroWidth: ["5e76d338d6581c3724c0f0b2", "5e76d399d6581c3724c0f0b8", "567b5b520e984428652809b6", "5849c9a4f52be01a7ee5f79d", "567b5c080e984428652809ba", "567b5dc00e984428652809bd", "58487cc6f52be01a7ee5f205", "5849c9c8f52be01a7ee5f79e"].includes(emote.id)
                    };
                });
            });
        });

        // Novo endpoint 7TV (v3)
        ['emote-sets/global', 'users/twitch/' + encodeURIComponent(channelID)].forEach(endpoint => {
            $.getJSON('https://7tv.io/v3/' + endpoint).done(function (res) {
                let emotes = [];
                if (endpoint === 'emote-sets/global') {
                    emotes = res.emotes || [];
                } else {
                    emotes = (res.emote_set && res.emote_set.emotes) ? res.emote_set.emotes : [];
                }

                emotes.forEach(emote => {
                    if (!emote.data || !emote.data.host || !emote.data.host.files) return; // Ignorar emotes mal formados

                    // Selecionar o maior tamanho disponível (4x se existir)
                    const files = emote.data.host.files;
                    const largestFile = files.find(file => file.name === '4x.webp') || files[files.length - 1];
                    const imageUrl = 'https:' + emote.data.host.url + '/' + largestFile.name;

                    Chat.info.emotes[emote.name] = {
                        id: emote.id,
                        image: imageUrl,
                        zeroWidth: emote.flags === 1 // Usar flags do nível superior para zero-width
                    };
                });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error('Erro ao carregar emotes do 7TV para ' + endpoint + ':', textStatus, errorThrown);
            });
        });
    },

    load: function (callback) {
        const loadChannel = () => {
            TwitchAPI('users?login=' + Chat.info.channel).done(function (res) {
                if (res.data.length === 0) {
                    console.error('Canal não encontrado');
                    setTimeout(loadChannel, 60000);
                    return;
                }
                Chat.info.channelID = res.data[0].id;
                Chat.loadEmotes(Chat.info.channelID);

                TwitchAPI('chat/badges/global').done(function (global) {
                    global.data.forEach(badgeSet => {
                        badgeSet.versions.forEach(version => {
                            Chat.info.badges[badgeSet.set_id + ':' + version.id] = version.image_url_4x;
                        });
                    });
                    TwitchAPI('chat/badges?broadcaster_id=' + encodeURIComponent(Chat.info.channelID)).done(function (channel) {
                        channel.data.forEach(badgeSet => {
                            badgeSet.versions.forEach(version => {
                                Chat.info.badges[badgeSet.set_id + ':' + version.id] = version.image_url_4x;
                            });
                        });
                        $.getJSON('https://api.frankerfacez.com/v1/_room/id/' + encodeURIComponent(Chat.info.channelID)).done(function (res) {
                            if (res.room.moderator_badge) {
                                Chat.info.badges['moderator:1'] = 'https://cdn.frankerfacez.com/room-badge/mod/' + Chat.info.channel + '/4/rounded';
                            }
                            if (res.room.vip_badge) {
                                Chat.info.badges['vip:1'] = 'https://cdn.frankerfacez.com/room-badge/vip/' + Chat.info.channel + '/4';
                            }
                        });
                    });
                });

                if (!Chat.info.hideBadges) {
                    $.getJSON('https://api.ffzap.com/v1/supporters')
                        .done(function (res) { Chat.info.ffzapBadges = res; })
                        .fail(function () { Chat.info.ffzapBadges = []; });
                    $.getJSON('https://api.betterttv.net/3/cached/badges')
                        .done(function (res) { Chat.info.bttvBadges = res; })
                        .fail(function () { Chat.info.bttvBadges = []; });
                    $.getJSON('https://api.chatterino.com/badges')
                        .done(function (res) { Chat.info.chatterinoBadges = res.badges; })
                        .fail(function () { Chat.info.chatterinoBadges = []; });
                }

                TwitchAPI('bits/cheermotes?broadcaster_id=' + Chat.info.channelID).done(function (res) {
                    res.data.forEach(cheer => {
                        Chat.info.cheers[cheer.prefix] = {};
                        cheer.tiers.forEach(tier => {
                            Chat.info.cheers[cheer.prefix][tier.min_bits] = {
                                image: tier.images.dark.animated['4'],
                                color: tier.color
                            };
                        });
                    });
                });

                callback(true);
            }).fail(function () {
                console.error('Erro ao carregar canal');
                setTimeout(loadChannel, 60000);
            });
        };

        loadChannel();
    },

    update: setInterval(function () {
        if (Chat.info.lines.length > 0) {
            var lines = Chat.info.lines.join('');

            if (Chat.info.animate) {
                var $auxDiv = $('<div></div>', { class: "hidden" }).appendTo("#chat");
                $auxDiv.append(lines);
                var auxHeight = $auxDiv.height();
                $auxDiv.remove();

                var $animDiv = $('<div></div>');
                $('#chat').append($animDiv);
                $animDiv.animate({ "height": auxHeight }, 150, function () {
                    $(this).remove();
                    $('#chat').append(lines);
                });
            } else {
                $('#chat').append(lines);
            }
            Chat.info.lines = [];
            var linesToDelete = $('.chat_line').length - 100;
            while (linesToDelete > 0) {
                $('.chat_line').eq(0).remove();
                linesToDelete--;
            }
        } else if (Chat.info.fade) {
            var messageTime = $('.chat_line').eq(0).data('time');
            if ((Date.now() - messageTime) / 1000 >= Chat.info.fade) {
                $('.chat_line').eq(0).fadeOut(function () {
                    $(this).remove();
                });
            }
        }
    }, 200),

    loadUserBadges: function (nick, userId) {
        Chat.info.userBadges[nick] = [];
        $.getJSON('https://api.frankerfacez.com/v1/user/' + nick).always(function (res) {
            if (res.badges) {
                Object.entries(res.badges).forEach(badge => {
                    var userBadge = {
                        description: badge[1].title,
                        url: 'https:' + badge[1].urls['4'],
                        color: badge[1].color
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                });
            }
            Chat.info.ffzapBadges.forEach(user => {
                if (user.id.toString() === userId) {
                    var color = '#755000';
                    if (user.tier == 2) color = (user.badge_color || '#755000');
                    else if (user.tier == 3) {
                        if (user.badge_is_colored == 0) color = (user.badge_color || '#755000');
                        else color = false;
                    }
                    var userBadge = {
                        description: 'FFZ:AP Badge',
                        url: 'https://api.ffzap.com/v1/user/badge/' + userId + '/3',
                        color: color
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });
            Chat.info.bttvBadges.forEach(user => {
                if (user.name === nick) {
                    var userBadge = {
                        description: user.badge.description,
                        url: user.badge.svg
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });
            Chat.info.chatterinoBadges.forEach(badge => {
                badge.users.forEach(user => {
                    if (user === userId) {
                        var userBadge = {
                            description: badge.tooltip,
                            url: badge.image3 || badge.image2 || badge.image1
                        };
                        if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                    }
                });
            });
        });
    },

    write: function (nick, info, message) {
        if (info) {
            // Criar o container principal do chat
            var $chatLine = $('<div></div>');
            $chatLine.addClass('chat_line');
            $chatLine.attr('data-nick', nick);
            $chatLine.attr('data-time', Date.now());
            $chatLine.attr('data-id', info.id);

            // Adicionar badges, se existirem e não estiverem escondidos
            if (!Chat.info.hideBadges && typeof (info.badges) === 'string') {
                info.badges.split(',').forEach(badge => {
                    var badgeParts = badge.split('/');
                    var badgeKey = badgeParts[0] + ':' + badgeParts[1];
                    if (Chat.info.badges[badgeKey]) {
                        var $badge = $('<img/>');
                        $badge.addClass('badge');
                        $badge.attr('src', Chat.info.badges[badgeKey]);
                        $chatLine.append($badge);
                    }
                });
            }

            // Adicionar o username com cor e 1 espaço antes
            var $username = $('<span></span>');
            $username.addClass('username');
            var color = info.color;
            if (typeof (info.color) === 'string') {
                if (tinycolor(info.color).getBrightness() <= 50) {
                    color = tinycolor(info.color).lighten(30).toString();
                }
            } else {
                const twitchColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
                color = twitchColors[nick.charCodeAt(0) % 15];
            }
            $username.css('color', color);
            $username.html(' ' + (info['display-name'] || nick)); // Adicionar 1 espaço antes do nome
            $chatLine.append($username);

            // Adicionar o dois-pontos (colon)
            var $colon = $('<span></span>');
            $colon.addClass('username colon');
            $colon.css('margin-left', '4px');
            $colon.text(': ');
            $chatLine.append($colon);

            // Processar a mensagem (emotes, cheers, etc.)
            var $message = $('<span></span>');
            $message.addClass('message');

            if (/^\x01ACTION.*\x01$/.test(message)) {
                $message.css('color', color);
                message = message.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
            }

            var replacements = {};
            if (typeof (info.emotes) === 'string') {
                info.emotes.split('/').forEach(emoteData => {
                    var twitchEmote = emoteData.split(':');
                    var indexes = twitchEmote[1].split(',')[0].split('-');
                    var emojis = new RegExp('[\u1000-\uFFFF]+', 'g');
                    var aux = message.replace(emojis, ' ');
                    var emoteCode = aux.substr(indexes[0], indexes[1] - indexes[0] + 1);
                    replacements[emoteCode] = '<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v2/' + twitchEmote[0] + '/default/dark/3.0" />';
                });
            }

            Object.entries(Chat.info.emotes).forEach(emote => {
                if (message.search(escapeRegExp(emote[0])) > -1) {
                    if (emote[1].upscale) replacements[emote[0]] = '<img class="emote upscale" src="' + emote[1].image + '" />';
                    else if (emote[1].zeroWidth) replacements[emote[0]] = '<img class="emote" data-zw="true" src="' + emote[1].image + '" />';
                    else replacements[emote[0]] = '<img class="emote" src="' + emote[1].image + '" />';
                }
            });

            message = escapeHtml(message);

            if (info.bits && parseInt(info.bits) > 0) {
                var bits = parseInt(info.bits);
                var parsed = false;
                for (cheerType of Object.entries(Chat.info.cheers)) {
                    var regex = new RegExp(cheerType[0] + "\\d+\\s*", 'ig');
                    if (message.search(regex) > -1) {
                        message = message.replace(regex, '');
                        if (!parsed) {
                            var closest = 1;
                            for (cheerTier of Object.keys(cheerType[1]).map(Number).sort((a, b) => a - b)) {
                                if (bits >= cheerTier) closest = cheerTier;
                                else break;
                            }
                            message = '<img class="cheer_emote" src="' + cheerType[1][closest].image + '" /><span class="cheer_bits" style="color: ' + cheerType[1][closest].color + ';">' + bits + '</span> ' + message;
                            parsed = true;
                        }
                    }
                }
            }

            var replacementKeys = Object.keys(replacements);
            replacementKeys.sort((a, b) => b.length - a.length);

            replacementKeys.forEach(replacementKey => {
                var regex = new RegExp("(?<!\\S)(" + escapeRegExp(replacementKey) + ")(?!\\S)", 'g');
                message = message.replace(regex, replacements[replacementKey]);
            });

            message = twemoji.parse(message);
            $message.html(message);

            // Adicionar zero-width emotes
            var messageNodes = $message.children();
            messageNodes.each(function (i) {
                if (i != 0 && $(this).data('zw') && ($(messageNodes[i - 1]).hasClass('emote') || $(messageNodes[i - 1]).hasClass('emoji')) && !$(messageNodes[i - 1]).data('zw')) {
                    var $container = $('<span></span>');
                    $container.addClass('zero-width_container');
                    $(this).addClass('zero-width');
                    $(this).before($container);
                    $container.append(messageNodes[i - 1], this);
                }
            });

            $message.html($message.html().trim());
            $chatLine.append($message);

            // Adicionar a linha ao array de linhas para renderização
            Chat.info.lines.push($chatLine.wrap('<div>').parent().html());
        }
    },

    clearChat: function () {
        document.getElementById("chat").innerHTML = "";
    },

    clearMessage: function (id) {
        setTimeout(function () {
            $('.chat_line[data-id=' + id + ']').remove();
        }, 200);
    },

    connect: function (channel) {
        Chat.info.channel = channel;

        Chat.load(function () {
            console.log('jChat: Connecting to IRC server...');
            var socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 2000 });

            socket.onopen = function () {
                console.log('jChat: Connected');
                socket.send('PASS blah\r\n');
                socket.send('NICK justinfan' + Math.floor(Math.random() * 99999) + '\r\n');
                socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
                socket.send('JOIN #' + Chat.info.channel + '\r\n');
            };

            socket.onclose = function () {
                console.log('jChat: Disconnected');
            };

            socket.onmessage = function (data) {
                data.data.split('\r\n').forEach(line => {
                    if (!line) return;
                    var message = window.parseIRC(line);
                    if (!message.command) return;

                    switch (message.command) {
                        case "PING":
                            socket.send('PONG ' + message.params[0]);
                            return;
                        case "JOIN":
                            console.log('jChat: Joined channel #' + Chat.info.channel);
                            return;
                        case "CLEARMSG":
                            if (message.tags) Chat.clearMessage(message.tags['target-msg-id']);
                            return;
                        case "CLEARCHAT":
                            Chat.clearChat();
                            return;
                        case "PRIVMSG":
                            if (message.params[0] !== '#' + channel || !message.params[1]) return;
                            var nick = message.prefix.split('@')[0].split('!')[0];

                            if (message.params[1].toLowerCase() === "!refreshoverlay" && typeof (message.tags.badges) === 'string') {
                                var flag = false;
                                message.tags.badges.split(',').forEach(badge => {
                                    badge = badge.split('/');
                                    if (badge[0] === "moderator" || badge[0] === "broadcaster") {
                                        flag = true;
                                        return;
                                    }
                                });
                                if (flag) {
                                    Chat.loadEmotes(Chat.info.channelID);
                                    console.log('jChat: Refreshing emotes...');
                                    return;
                                }
                            }

                            if (Chat.info.hideCommands) {
                                if (/^!.+/.test(message.params[1])) return;
                            }

                            if (!Chat.info.showBots) {
                                if (Chat.info.bots.includes(nick)) return;
                            }

                            if (Chat.info.blockedUsers) {
                                if (Chat.info.blockedUsers.includes(nick)) return;
                            }

                            if (!Chat.info.hideBadges) {
                                if (Chat.info.bttvBadges && Chat.info.chatterinoBadges && Chat.info.ffzapBadges && !Chat.info.userBadges[nick]) Chat.loadUserBadges(nick, message.tags['user-id']);
                            }

                            Chat.write(nick, message.tags, message.params[1]);
                            return;
                    }
                });
            };
        });
    }
};

$(document).ready(function () {
    const channelParam = $.QueryString.twitch || $.QueryString.channel;
    if (channelParam) {
        Chat.connect(channelParam.toLowerCase());
    } else {
        console.log('Nenhum canal fornecido na URL (?twitch ou ?channel)');
    }
});