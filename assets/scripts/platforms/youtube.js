// IIFE para suporte a modulepreload
(function initializeModulePreload() {
	const linkSupport = document.createElement("link").relList;
	if (linkSupport && linkSupport.supports && linkSupport.supports("modulepreload")) return;
	document.querySelectorAll('link[rel="modulepreload"]').forEach(link => preloadLink(link));

	new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if (mutation.type === "childList") {
				mutation.addedNodes.forEach(node => {
					if (node.tagName === "LINK" && node.rel === "modulepreload") preloadLink(node);
				});
			}
		});
	}).observe(document, {
		childList: true,
		subtree: true
	});

	function getFetchOptions(link) {
		const options = {};
		if (link.integrity) options.integrity = link.integrity;
		if (link.referrerPolicy) options.referrerPolicy = link.referrerPolicy;
		switch (link.crossOrigin) {
			case "use-credentials":
				options.credentials = "include";
				break;
			case "anonymous":
				options.credentials = "omit";
				break;
			default:
				options.credentials = "same-origin";
		}
		return options;
	}

	function preloadLink(link) {
		if (link.ep) return;
		link.ep = true;
		const options = getFetchOptions(link);
		fetch(link.href, options);
	}
})();

// Twemoji Module (mantido sem alterações)
const twemojiModule = (function initializeTwemoji() {
	const config = {
		base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/",
		ext: ".png",
		size: "72x72",
		className: "emoji",
		convert: {
			fromCodePoint: codeToChar,
			toCodePoint: charToCode
		},
		onerror: handleError,
		parse: parseEmoji,
		replace: replaceEmoji,
		test: testEmoji
	};

	const htmlEntities = {
		"&": "&",
		"<": "<",
		">": ">",
		"'": "'",
		'"': ""
	};
	const emojiRegex = /(?:\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d\udc8f\ud83c[\udffb-\udfff]|\ud83d\udc91\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d\udc8f\udc91])|(?:\ud83d[\udc68\udc69]|\ud83e\uddd1)(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf7c\udf84\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc70\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd4\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83d\ude36\u200d\ud83c\udf2b\ufe0f|\u2764\ufe0f\u200d\ud83d\udd25|\u2764\ufe0f\u200d\ud83e\ude79|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc3b\u200d\u2744\ufe0f|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83d\ude2e\u200d\ud83d\udca8|\ud83d\ude35\u200d\ud83d\udcab|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f|\ud83d\udc08\u200d\u2b1b)|[#*0-9]\ufe0f?\u20e3|(?:[Â©Â®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0c\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\udd77\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udc8e\udc90\udc92-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5-\uded7\udeeb\udeec\udef4-\udefc\udfe0-\udfeb]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd1d\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd76\udd78\udd7a-\uddb4\uddb7\uddba\uddbc-\uddcb\uddd0\uddde-\uddff\ude70-\ude74\ude78-\ude7a\ude80-\ude86\ude90-\udea8\udeb0-\udeb6\udec0-\udec2\uded0-\uded6]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g;
	const variationSelector = /\uFE0F/g;

	function handleError() {
		if (this.parentNode) this.parentNode.replaceChild(createTextNode(this.alt, false), this);
	}

	function createTextNode(text, removeVariation) {
		return document.createTextNode(removeVariation ? text.replace(variationSelector, "") : text);
	}

	function escapeHTML(text) {
		return text.replace(/[&<>'"]/g, match => htmlEntities[match]);
	}

	function buildEmojiUrl(code, cfg) {
		return `${cfg.base}${cfg.size}/${code}${cfg.ext}`;
	}

	function collectTextNodes(element, nodes = []) {
		const childNodes = element.childNodes;
		for (let i = childNodes.length - 1; i >= 0; i--) {
			const node = childNodes[i];
			if (node.nodeType === 3) nodes.push(node);
			else if (node.nodeType === 1 && !("ownerSVGElement" in node) && !/^(?:iframe|noframes|noscript|script|select|style|textarea)$/i.test(node.nodeName)) {
				collectTextNodes(node, nodes);
			}
		}
		return nodes;
	}

	function getCodePoint(text) {
		return charToCode(text.replace(variationSelector, ""));
	}

	function processElement(element, cfg) {
		const textNodes = collectTextNodes(element);
		for (let i = textNodes.length - 1; i >= 0; i--) {
			const node = textNodes[i];
			const text = node.nodeValue;
			let fragment = document.createDocumentFragment();
			let lastIndex = 0;
			let hasChanges = false;

			let match;
			while ((match = emojiRegex.exec(text))) {
				const start = match.index;
				if (start !== lastIndex) fragment.appendChild(createTextNode(text.slice(lastIndex, start), true));
				const emoji = match[0];
				const code = getCodePoint(emoji);
				const url = cfg.callback(code, cfg);

				if (code && url) {
					const img = new Image();
					img.onerror = cfg.onerror;
					img.setAttribute("draggable", "false");
					const attrs = cfg.attributes(emoji, code);
					for (const [key, value] of Object.entries(attrs)) {
						if (key.indexOf("on") !== 0 && !img.hasAttribute(key)) img.setAttribute(key, value);
					}
					img.className = cfg.className;
					img.alt = emoji;
					img.src = url;
					fragment.appendChild(img);
					hasChanges = true;
				} else {
					fragment.appendChild(createTextNode(emoji, false));
				}
				lastIndex = start + emoji.length;
			}

			if (hasChanges) {
				if (lastIndex < text.length) fragment.appendChild(createTextNode(text.slice(lastIndex), true));
				node.parentNode.replaceChild(fragment, node);
			}
		}
		return element;
	}

	function processString(text, cfg) {
		return replaceEmoji(text, emoji => {
			const code = getCodePoint(emoji);
			const url = cfg.callback(code, cfg);
			if (!code || !url) return emoji;

			let imgTag = `<img class="${cfg.className}" draggable="false" alt="${emoji}" src="${url}"`;
			const attrs = cfg.attributes(emoji, code);
			for (const [key, value] of Object.entries(attrs)) {
				if (key.indexOf("on") !== 0 && imgTag.indexOf(` ${key}=`) === -1) imgTag += ` ${key}="${escapeHTML(value)}"`;
			}
			return imgTag + "/>";
		});
	}

	function defaultAttributes() {
		return {};
	}

	function normalizeSize(size) {
		return typeof size === "number" ? `${size}x${size}` : size;
	}

	function codeToChar(code) {
		const value = typeof code === "string" ? parseInt(code, 16) : code;
		if (value < 65536) return String.fromCharCode(value);
		const adjusted = value - 65536;
		return String.fromCharCode(55296 + (adjusted >> 10), 56320 + (adjusted & 1023));
	}

	function parseEmoji(content, options = {}) {
		if (!options || typeof options === "function") options = {
			callback: options
		};
		const cfg = {
			callback: options.callback || buildEmojiUrl,
			attributes: typeof options.attributes === "function" ? options.attributes : defaultAttributes,
			base: typeof options.base === "string" ? options.base : config.base,
			ext: options.ext || config.ext,
			size: options.folder || normalizeSize(options.size || config.size),
			className: options.className || config.className,
			onerror: options.onerror || config.onerror
		};
		return typeof content === "string" ? processString(content, cfg) : processElement(content, cfg);
	}

	function replaceEmoji(text, replacer) {
		return String(text).replace(emojiRegex, replacer);
	}

	function testEmoji(text) {
		emojiRegex.lastIndex = 0;
		const result = emojiRegex.test(text);
		emojiRegex.lastIndex = 0;
		return result;
	}

	function charToCode(text, separator = "-") {
		const codes = [];
		let highSurrogate = 0;
		for (let i = 0; i < text.length; i++) {
			const charCode = text.charCodeAt(i);
			if (highSurrogate) {
				codes.push((65536 + ((highSurrogate - 55296) << 10) + (charCode - 56320)).toString(16));
				highSurrogate = 0;
			} else if (55296 <= charCode && charCode <= 56319) {
				highSurrogate = charCode;
			} else {
				codes.push(charCode.toString(16));
			}
		}
		return codes.join(separator);
	}

	return {
		parse: parseEmoji,
		replace: replaceEmoji,
		test: testEmoji,
		config: config
	};
})();

window.twemoji = twemojiModule;

// Funções de Fetch para APIs externas (mantidas sem alterações)
async function fetchBTTVUser(channelId) {
	try {
		const response = await fetch(`https://api.betterttv.net/3/cached/users/youtube/${channelId}`, {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetchBTTVGlobal() {
	try {
		const response = await fetch("https://api.betterttv.net/3/cached/emotes/global", {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetchTruffleEmotes(channelId) {
	try {
		const response = await fetch(`https://v2.truffle.vip/gateway/emotes/c/${channelId}`, {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetchFFZUser(channelId) {
	try {
		const response = await fetch(`https://api.betterttv.net/3/cached/frankerfacez/users/youtube/${channelId}`, {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetchFFZGlobal() {
	try {
		const response = await fetch("https://api.betterttv.net/3/cached/frankerfacez/emotes/global", {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetch7TVUser(channelId) {
	try {
		const response = await fetch(`https://7tv.io/v3/users/youtube/${channelId}`, {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetch7TVGlobal() {
	try {
		const response = await fetch("https://7tv.io/v3/emote-sets/global", {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		});
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
}

// Configurações fixas com parâmetros da URL
const params = new URLSearchParams(window.location.search);
const SETTINGS = {
	globalEmotes: params.get("globalEmotes") !== "false", // Padrão true, exceto se explicitamente false
	progressive: params.get("progressive") !== "false", // Padrão true
	showSuperChats: params.get("showSuperChats") !== "false", // Padrão true
	showMemberships: params.get("showMemberships") !== "false", // Padrão true
	showEngagements: params.get("showEngagements") !== "false" // Padrão true
};

// Chat Functionality
(async function initializeChat() {
	const apiRequestDelay = 200;
	const messageRenderDelay = 200;
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
	const params = new URLSearchParams(window.location.search);
	const pathParts = window.location.pathname.split('/').filter(Boolean); // Captura partes do caminho
	const initialChatParams = {};

	function detectPattern(value) {
		if (typeof value !== "string" || value === null || value === undefined) {
			return null;
		}
		if (value.startsWith("UC") && value.length === 24) {
			return "channelId";
		} else if (value.length === 11 && /^[A-Za-z0-9\-_]+$/.test(value)) {
			return "id";
		} else if (/^[A-Za-z0-9_]+$/.test(value) || value.startsWith("@")) { // Aceita handles sem "@"
			return "handle";
		}
		return null;
	}

	// Simplificar usando window.youtubeChannelId se disponível
	if (window.youtubeChannelId) {
		const type = detectPattern(window.youtubeChannelId);
		if (type) {
			initialChatParams[type] = window.youtubeChannelId;
		}
	} else {
		// Fallback: verifica query string
		const possibleQueryParams = ["handle", "id", "channelId", "value"];
		for (const paramName of possibleQueryParams) {
			const rawParam = params.get(paramName);
			if (rawParam) {
				const type = detectPattern(rawParam);
				if (type) {
					initialChatParams[type] = rawParam;
					break;
				}
			}
		}

		// Se nada na query, verifica o caminho
		if (!initialChatParams.handle && !initialChatParams.id && !initialChatParams.channelId) {
			for (const part of pathParts) {
				const type = detectPattern(part);
				if (type) {
					initialChatParams[type] = part;
					break;
				}
			}
		}
	}

	const browserLanguage = navigator.language || "en-US";

	if (!initialChatParams.handle && !initialChatParams.id && !initialChatParams.channelId) {
		console.log("No chat parameters provided in URL (query or path)");
		return;
	}

	async function startChat() {
		const userColors = {};
		const userHighlights = {};
		const userAvatars = {};
		const userEmotes = {};
		const abortControllerInitial = new AbortController();
		let continuationAbortController = null;

		async function fetchTruffleUsers(channelId) {
			try {
				const response = await fetch(`https://v2.truffle.vip/gateway/users/v2/c/${channelId}`, {
					method: "GET",
					headers: {
						Accept: "application/json"
					}
				});
				if (!response.ok) return;
				const data = await response.json();
				for (const entry of data) {
					const userId = entry[0];
					const userData = entry[1];
					if (userData.a) userAvatars[userId] = userData.a;
					if (userData.c) userColors[userId] = userData.c;
					if (userData.e) userEmotes[userId] = userData.e;
					if (userData.h) userHighlights[userId] = userData.h;
				}
			} catch (error) {
				console.error("Error fetching Truffle users:", error);
			}
		}

		async function fetchTruffleBadges() {
			try {
				const response = await fetch("https://v2.truffle.vip/gateway/badges", {
					method: "GET",
					headers: {
						Accept: "application/json"
					}
				});
				if (!response.ok) return null;
				return await response.json();
			} catch (error) {
				console.error("Error fetching Truffle badges:", error);
				return null;
			}
		}

		async function fetchChat(params, isContinuation = false) {
			try {
				// Capturar os parâmetros "server" e "protocol" da URL
				const urlParams = new URLSearchParams(window.location.search);
				const serverParam = urlParams.get("server") || "localhost:3000/chat";
				const protocolParam = urlParams.get("protocol") || "http"; // Padrão é "http" se não especificado

				// Validar o protocolo
				const protocol = ["http", "https"].includes(protocolParam.toLowerCase())
					? protocolParam.toLowerCase()
					: "http"; // Se o protocolo for inválido, usa "http" como padrão

				// Determinar a URL base
				let baseUrl;
				if (serverParam.startsWith("http://") || serverParam.startsWith("https://")) {
					// Se o parâmetro já contém o protocolo, usa ele diretamente
					baseUrl = serverParam;
				} else {
					// Se é apenas o domínio ou caminho, adiciona o protocolo especificado e o caminho padrão /chat
					baseUrl = serverParam.includes("/")
						? `${protocol}://${serverParam}`
						: `${protocol}://${serverParam}/chat`;
				}

				// Construir a URL com os parâmetros adicionais
				const queryParams = new URLSearchParams();
				queryParams.set("lang", browserLanguage); // Adicionar o idioma do navegador

				if (params.continuation) {
					queryParams.set("continuation", params.continuation);
				} else if (params.handle) {
					queryParams.set("handle", params.handle);
				} else if (params.id) {
					queryParams.set("id", params.id);
				} else if (params.channelId) {
					queryParams.set("channelId", params.channelId);
				} else {
					throw new Error("No valid parameters provided");
				}

				const url = `${baseUrl}?${queryParams.toString()}`;

				const controller = isContinuation ? (continuationAbortController = new AbortController()) : abortControllerInitial;
				const timeoutId = isContinuation ? setTimeout(() => controller.abort(), 5000) : null;

				const response = await fetch(url, {
					signal: controller.signal
				});
				if (!response.ok) throw new Error(`Failed to fetch chat: ${response.status}`);
				const data = await response.json();
				if (timeoutId) clearTimeout(timeoutId);
				return data;
			} catch (error) {
				console.error("Error fetching chat:", error);
				throw error;
			}
		}

		function parseChatAction(action) {
			const actionType = Object.keys(action)[1] || Object.keys(action)[0];
			const item = action[actionType]?.item;

			switch (actionType) {
				case "addChatItemAction":
					if (!item) return null;
					const rendererType = Object.keys(item)[0];
					switch (rendererType) {
						case "liveChatTextMessageRenderer": {
							const renderer = item[rendererType];
							if (!renderer.message) return null;
							return {
								type: actionType,
								data: {
									message: formatMessage(renderer.message),
									id: renderer.id,
									author: {
										id: renderer.authorExternalChannelId || "",
										name: formatMessage(renderer.authorName),
										badges: renderer.authorBadges?.map(badge => {
											const r = badge.liveChatAuthorBadgeRenderer;
											return {
												tooltip: r.tooltip,
												type: r.icon ? "icon" : "custom",
												badge: r.icon ? r.icon.iconType : r.customThumbnail?.thumbnails[0]?.url ?? ""
											};
										}) ?? [],
										avatar: renderer.authorPhoto?.thumbnails[1]?.url ?? ""
									},
									unix: Math.round(Number(renderer.timestampUsec) / 1000)
								}
							};
						}
						case "liveChatPaidMessageRenderer": {
							const renderer = item[rendererType];
							const amount = renderer.purchaseAmountText?.simpleText || "";
							const messageText = formatMessage(renderer.message || {
								simpleText: ""
							});
							const fullMessage = amount ? `${amount} ${messageText}` : messageText;
							return {
								type: actionType,
								data: {
									message: fullMessage,
									id: renderer.id,
									author: {
										id: renderer.authorExternalChannelId || "",
										name: formatMessage(renderer.authorName),
										badges: renderer.authorBadges?.map(badge => {
											const r = badge.liveChatAuthorBadgeRenderer;
											return {
												tooltip: r.tooltip,
												type: r.icon ? "icon" : "custom",
												badge: r.icon ? r.icon.iconType : r.customThumbnail?.thumbnails[0]?.url ?? ""
											};
										}) ?? [],
										avatar: renderer.authorPhoto?.thumbnails[1]?.url ?? ""
									},
									unix: Math.round(Number(renderer.timestampUsec) / 1000),
									isSuperChat: true
								}
							};
						}
						case "liveChatMembershipItemRenderer": {
							const renderer = item[rendererType];
							const headerText = formatMessage(renderer.headerSubText || {
								simpleText: ""
							});
							const messageText = formatMessage(renderer.message || {
								simpleText: ""
							});
							const fullMessage = headerText ? `${headerText} ${messageText}` : `Welcome! ${messageText}`;
							return {
								type: actionType,
								data: {
									message: fullMessage,
									id: renderer.id,
									author: {
										id: renderer.authorExternalChannelId || "",
										name: formatMessage(renderer.authorName),
										badges: renderer.authorBadges?.map(badge => {
											const r = badge.liveChatAuthorBadgeRenderer;
											return {
												tooltip: r.tooltip,
												type: r.icon ? "icon" : "custom",
												badge: r.icon ? r.icon.iconType : r.customThumbnail?.thumbnails[0]?.url ?? ""
											};
										}) ?? [],
										avatar: renderer.authorPhoto?.thumbnails[1]?.url ?? ""
									},
									unix: Math.round(Number(renderer.timestampUsec) / 1000),
									isMembership: true
								}
							};
						}
						case "liveChatViewerEngagementMessageRenderer": {
							const renderer = item[rendererType];
							if (!renderer.message) return null;
							return {
								type: actionType,
								data: {
									message: formatMessage(renderer.message),
									id: renderer.id,
									isEngagement: true,
									unix: Math.round(Number(renderer.timestampUsec) / 1000)
								}
							};
						}
						default:
							return null;
					}
				case "removeChatItemAction":
					return {
						type: actionType,
						data: {
							targetId: action[actionType].targetItemId
						}
					};
				case "removeChatItemByAuthorAction":
					return {
						type: actionType,
						data: {
							externalChannelId: action[actionType].externalChannelId
						}
					};
				default:
					return null;
			}
		}

		function formatMessage(message) {
			if (!message) return "";
			if (message.simpleText) return message.simpleText;
			if (message.runs) {
				return message.runs.map(run => {
					if (run.text) return run.text;
					if (run.emoji?.isCustomEmoji) return ` <img src="${run.emoji.image.thumbnails[1]?.url}" class="emote"> `;
					return run.emoji?.emojiId || "";
				}).join("").trim();
			}
			return "";
		}

		let chatData;
		try {
			chatData = await fetchChat(initialChatParams);
		} catch (error) {
			console.log("Initial fetch failed, retrying in 5 seconds...");
			await delay(5000);
			return startChat();
		}

		const isChannelIdProvided = !!initialChatParams.channelId;
		const initialContinuation = chatData.initialPayload?.continuation || "";
		const channelId = isChannelIdProvided ?
			initialChatParams.channelId :
			chatData.chatData?.participantsList?.liveChatParticipantsListRenderer?.participants[0]?.liveChatParticipantRenderer?.authorExternalChannelId || "";

		const truffleData = isChannelIdProvided && channelId ? await fetchTruffleEmotes(channelId) : null;
		const bttvUserData = isChannelIdProvided && channelId ? await fetchBTTVUser(channelId) : null;
		const ffzUserData = isChannelIdProvided && channelId ? await fetchFFZUser(channelId) : null;
		const sevenTVUserData = isChannelIdProvided && channelId ? await fetch7TVUser(channelId) : null;

		let bttvGlobalData = null;
		let ffzGlobalData = null;
		let sevenTVGlobalData = null;
		if (SETTINGS.globalEmotes) {
			bttvGlobalData = await fetchBTTVGlobal();
			ffzGlobalData = await fetchFFZGlobal();
			sevenTVGlobalData = await fetch7TVGlobal();
		}

		let badgesData = await fetchTruffleBadges();

		if (isChannelIdProvided && channelId) setInterval(() => fetchTruffleUsers(channelId), 5000);

		const maxMessages = 100;
		const messageQueue = [];
		const colorPalette = [
			"#FF0000", "#008000", "#B22222", "#FF7F50", "#FF4500",
			"#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF",
			"#FF69B4", "#8A2BE2", "#00FF7F"
		];

		function generateUserColor(text) {
			const validText = typeof text === "string" && text.length > 0 ? text : "anonymous";
			const sum = [...validText].reduce((acc, char) => acc + char.charCodeAt(0), 0);
			return colorPalette[sum % colorPalette.length];
		}

		function replaceEmotes(emotes, message) {
			let result = window.twemoji.parse(message);
			for (const emote of emotes) {
				const pattern = new RegExp(`\\b${emote.name}\\b`, "g");
				result = result.replace(pattern, `<img src="${emote.url}" alt="${emote.name}" class="emote" />`);
			}
			return result;
		}

		function renderBadges(badges) {
			let html = "";
			for (const badge of badges) {
				if (badge.type === "icon") {
					if (badge.badge === "MODERATOR") html += '<img src="../assets/images/TMODERATOR.png" class="badge" />';
					else if (badge.badge === "VERIFIED") html += '<img src="../assets/images/YT_VERIFIED.png" class="badge" />';
					else if (badge.badge === "OWNER") html += '<img src="../assets/images/OWNER.png" class="badge" />';
				} else if (badge.type === "custom") {
					html += `<img src="${badge.badge.replace("=s16", "=s64")}" class="badge" />`;
				}
			}
			return html;
		}

		async function processChatActions(chat, continuation) {
			const actions = chat.continuationContents?.liveChatContinuation?.actions ||
				chat.chatData?.actions || [];

			const chatDiv = document.getElementById("chat");

			function createMessageElement(parsed) {
				const data = parsed.data;

				// Filtrar mensagens com base nas configurações
				if (data.isSuperChat && !SETTINGS.showSuperChats) return null;
				if (data.isMembership && !SETTINGS.showMemberships) return null;
				if (data.isEngagement && !SETTINGS.showEngagements) return null;

				let message = data.message;
				const author = data.author || {};
				let badges = author.badges || [];

				if (badgesData && userEmotes[author.id]) {
					badgesData.forEach(badge => {
						if (userEmotes[author.id]?.includes(badge.slug) &&
							!badges.some(b => b.tooltip === badge.slug)) {
							badges.push({
								tooltip: badge.slug,
								type: "custom",
								badge: badge.url
							});
						}
					});
				}

				let emotes = [];
				if (isChannelIdProvided && channelId) {
					if (truffleData) {
						truffleData.filter(e => message.includes(e.name)).forEach(e => {
							if (!emotes.some(existing => existing.name === e.name)) {
								switch (e.provider) {
									case 0:
										emotes.push({
											name: e.name,
											url: `https://static-cdn.jtvnw.net/emoticons/v2/${e.id}/static/dark/2.0`
										});
										break;
									case 1:
										emotes.push({
											name: e.name,
											url: `https://cdn.frankerfacez.com/emote/${e.id}/2`
										});
										break;
									case 2:
										emotes.push({
											name: e.name,
											url: `https://cdn.betterttv.net/emote/${e.id}/2x`
										});
										break;
									case 3:
										emotes.push({
											name: e.name,
											url: `https://v2.truffle.vip/emotes/${e.id}`
										});
										break;
									case 4:
										emotes.push({
											name: e.name,
											url: `https://cdn.bio/ugc/collectible/${e.id}.small.${e.ext}`
										});
										break;
								}
							}
						});
					}

					if (bttvUserData) {
						if (bttvUserData.channelEmotes) {
							bttvUserData.channelEmotes.filter(e => message.includes(e.code)).forEach(e => {
								if (!emotes.some(existing => existing.name === e.code)) {
									emotes.push({
										name: e.code,
										url: `https://cdn.betterttv.net/emote/${e.id}/2x`
									});
								}
							});
						}
						if (bttvUserData.sharedEmotes) {
							bttvUserData.sharedEmotes.filter(e => message.includes(e.code)).forEach(e => {
								if (!emotes.some(existing => existing.name === e.code)) {
									emotes.push({
										name: e.code,
										url: `https://cdn.betterttv.net/emote/${e.id}/2x`
									});
								}
							});
						}
					}

					if (ffzUserData) {
						ffzUserData.filter(e => message.includes(e.code)).forEach(e => {
							if (!emotes.some(existing => existing.name === e.code)) {
								emotes.push({
									name: e.code,
									url: e.images["2x"]
								});
							}
						});
					}

					if (sevenTVUserData) {
						sevenTVUserData.emote_set.emotes.filter(e => message.includes(e.name)).forEach(e => {
							if (!emotes.some(existing => existing.name === e.name)) {
								emotes.push({
									name: e.name,
									url: `https://cdn.7tv.app/emote/${e.id}/3x.webp`
								});
							}
						});
					}
				}

				if (SETTINGS.globalEmotes) {
					if (bttvGlobalData) {
						bttvGlobalData.filter(e => message.includes(e.code)).forEach(e => {
							if (!emotes.some(existing => existing.name === e.code)) {
								emotes.push({
									name: e.code,
									url: `https://cdn.betterttv.net/emote/${e.id}/2x`
								});
							}
						});
					}
					if (ffzGlobalData) {
						ffzGlobalData.filter(e => message.includes(e.code)).forEach(e => {
							if (!emotes.some(existing => existing.name === e.code)) {
								emotes.push({
									name: e.code,
									url: e.images["2x"]
								});
							}
						});
					}
					if (sevenTVGlobalData) {
						sevenTVGlobalData.emotes.filter(e => message.includes(e.name)).forEach(e => {
							if (!emotes.some(existing => existing.name === e.name)) {
								emotes.push({
									name: e.name,
									url: `https://cdn.7tv.app/emote/${e.id}/3x.webp`
								});
							}
						});
					}
				}

				const messageDiv = document.createElement("div");
				messageDiv.id = data.id;
				messageDiv.classList.add("chat_line");
				if (author.id) messageDiv.setAttribute("data-author-id", author.id);

				if (!data.isEngagement && author.id && !userColors[author.id]) {
					userColors[author.id] = generateUserColor(author.id);
				}
				if (!data.isEngagement && !userAvatars[author.id]) {
					userAvatars[author.id] = author.name.trim(); // Garante que o nome não tenha espaços extras
				}

				const badgeHTML = renderBadges(badges.reverse()).trim(); // Remove espaços extras do resultado das badges
				const messageHTML = replaceEmotes(emotes, message);

				if (data.isEngagement) {
					messageDiv.innerHTML = `<span class="message"> ${messageHTML}</span>`;
				} else if (author.id) {
					// Construção do HTML com espaçamento controlado
					const usernameHTML = userHighlights[author.id]
						? `<span style="background: ${userHighlights[author.id]}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; color:${userColors[author.id]};" class="username">${userAvatars[author.id]}</span>`
						: `<span style="color:${userColors[author.id]};" class="username">${userAvatars[author.id]}</span>`;

					// Montagem sem espaços implícitos
					messageDiv.innerHTML = `${badgeHTML} ${usernameHTML}<span class="colon">:</span><span class="message"> ${messageHTML}</span>`;
				} else {
					messageDiv.innerHTML = `<span class="message"> ${messageHTML}</span>`;
				}

				return messageDiv;
			}

			if (actions && actions.length > 0) {
				let renderDelay = 0;
				for (let i = 0; i < actions.length; i++) {
					const action = actions[i];
					const parsed = parseChatAction(action);
					if (!parsed) continue;

					if (parsed.type === "addChatItemAction") {
						const messageDiv = createMessageElement(parsed);
						if (!messageDiv) continue;

						if (SETTINGS.progressive) {
							setTimeout(() => {
								chatDiv.appendChild(messageDiv);
								messageQueue.push(messageDiv);
								if (messageQueue.length > maxMessages) {
									const oldest = messageQueue.shift();
									if (oldest && oldest.parentNode === chatDiv) chatDiv.removeChild(oldest);
								}
							}, renderDelay);
							renderDelay += messageRenderDelay;
						} else {
							chatDiv.appendChild(messageDiv);
							messageQueue.push(messageDiv);
							if (messageQueue.length > maxMessages) {
								const oldest = messageQueue.shift();
								if (oldest && oldest.parentNode === chatDiv) chatDiv.removeChild(oldest);
							}
						}
					} else if (parsed.type === "removeChatItemAction") {
						const targetId = parsed.data.targetId;
						const messageElement = document.getElementById(targetId);
						if (messageElement && messageElement.parentNode === chatDiv) {
							chatDiv.removeChild(messageElement);
							const index = messageQueue.findIndex(msg => msg.id === targetId);
							if (index !== -1) messageQueue.splice(index, 1);
						}
					} else if (parsed.type === "removeChatItemByAuthorAction") {
						const externalChannelId = parsed.data.externalChannelId;
						const messagesToRemove = chatDiv.querySelectorAll(`div[data-author-id="${externalChannelId}"]`);
						messagesToRemove.forEach(messageElement => {
							if (messageElement.parentNode === chatDiv) {
								chatDiv.removeChild(messageElement);
								const index = messageQueue.findIndex(msg => msg.id === messageElement.id);
								if (index !== -1) messageQueue.splice(index, 1);
							}
						});
					}
				}
			}

			let nextContinuation = null;
			if (chat.continuationContents?.liveChatContinuation?.continuations?.[0]?.timedContinuationData?.continuation) {
				nextContinuation = chat.continuationContents.liveChatContinuation.continuations[0].timedContinuationData.continuation;
			} else if (chat.chatData?.continuations?.[0]?.timedContinuationData?.continuation) {
				nextContinuation = chat.chatData.continuations[0].timedContinuationData.continuation;
			} else if (chat.chatData?.continuations?.[0]?.invalidationContinuationData?.continuation) {
				nextContinuation = chat.chatData.continuations[0].invalidationContinuationData.continuation;
			} else if (chat.continuationContents?.liveChatContinuation?.continuations?.[0]?.invalidationContinuationData?.continuation) {
				nextContinuation = chat.continuationContents.liveChatContinuation.continuations[0].invalidationContinuationData.continuation;
			}

			if (nextContinuation) {
				try {
					await delay(apiRequestDelay);
					const nextChat = await fetchChat({
						continuation: nextContinuation
					}, true);
					await processChatActions(nextChat, nextContinuation);
				} catch (error) {
					console.log("Continuation failed, restarting chat in 5 seconds...");
					if (continuationAbortController) continuationAbortController.abort();
					await delay(5000);
					return startChat();
				}
			} else {
				console.log("No continuation found, restarting chat in 5 seconds...");
				await delay(5000);
				return startChat();
			}
		}

		await processChatActions(chatData, initialContinuation);
	}

	startChat();
})();