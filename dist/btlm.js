
//#region rolldown:runtime
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

//#endregion
//#region src/utils/magent.ts
var magent_exports = {};
__export(magent_exports, {
	completeHash: () => completeHash$1,
	extractHash: () => extractHash$1
});
var extractHash$1, completeHash$1;
var init_magent = __esm({ "src/utils/magent.ts"() {
	extractHash$1 = (text) => {
		const re = /([a-zA-Z0-9]{40})/i;
		const found = text.match(re);
		if (found) return found[0];
		return null;
	};
	completeHash$1 = (hash) => {
		if (!hash.startsWith("magnet:?xt=urn:btih:")) return "magnet:?xt=urn:btih:" + hash;
		return hash;
	};
} });

//#endregion
//#region src/utils/utils.ts
var utils_exports = {};
__export(utils_exports, {
	PCUA: () => PCUA,
	convertHtmlToText: () => convertHtmlToText$1,
	isJson: () => isJson,
	replaceToEm: () => replaceToEm$1
});
function convertHtmlToText$1(html) {
	let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
	text = text.replace(/<[^>]+>/g, "\n");
	text = text.replace(/\n\s*\n/g, "\n");
	text = text.trim();
	return text;
}
var PCUA, replaceToEm$1, isJson;
var init_utils = __esm({ "src/utils/utils.ts"() {
	PCUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
	replaceToEm$1 = (text) => {
		return text.replace(/<\/?(?!em\b)[a-z0-9]+(?:\s+[^>]*)?>/gi, (match) => {
			const isClosingTag = match.startsWith("</");
			return isClosingTag ? "</em>" : "<em>";
		});
	};
	isJson = (text) => {
		try {
			JSON.parse(text);
			return true;
		} catch (e) {
			return false;
		}
	};
} });

//#endregion
//#region src/btlm.js
const { extractHash, completeHash } = (init_magent(), __toCommonJS(magent_exports));
const { replaceToEm, convertHtmlToText } = (init_utils(), __toCommonJS(utils_exports));
hun.events.onSearch = async (ctx) => {
	const { query, page } = ctx;
	const { sort } = ctx.filters;
	const { base_url } = ctx.settings;
	const url = `${base_url}/s?word=${encodeURIComponent(query)}&sort=${sort}&page=${page}`;
	console.log("🚀 ~ hun.events.onSearch= ~ url:", url);
	const response = await fetch(url, { headers: { referer: "https://btlm.top/" } });
	const html = await response.text();
	console.log("🚀 ~ hun.events.onSearch= ~ html:", html);
	const $ = cheerio.load(html);
	const items = $(".list-unstyled");
	const res = [];
	console.log("🚀 ~ hun.events.onSearch= ~ items:", items.length);
	items.each((index, element) => {
		const item = $(element);
		const aEl = item.find(".list-title > a");
		const title = replaceToEm(aEl.html());
		const hash = extractHash(aEl.attr("href"));
		if (!hash) return;
		const metaEl = item.find(".result-resource-meta-info");
		const info = metaEl.text();
		res.push({
			title,
			info: info.replaceAll("nbsp;\n*", " "),
			url: hash,
			payloads: {
				title,
				url: hash
			}
		});
	});
	ctx.res = res;
};
hun.events.onInfo = async (ctx) => {
	const { url, title } = ctx.payloads;
	ctx.res = [{
		url: completeHash(url),
		title
	}];
};

//#endregion