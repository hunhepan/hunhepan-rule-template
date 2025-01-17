
//#region node_modules/.pnpm/radash@12.1.0/node_modules/radash/dist/esm/array.mjs
const unique = (array, toKey) => {
	const valueMap = array.reduce((acc, item) => {
		const key = toKey ? toKey(item) : item;
		if (acc[key]) return acc;
		acc[key] = item;
		return acc;
	}, {});
	return Object.values(valueMap);
};

//#endregion
//#region src/utils/disk.ts
function findBDLink(str) {
	const bdLinkRE = /(https?:\/\/(?:pan|yun|eyun)\.baidu\.com\/s(?:hare)?\/(?:int\?surl=)?[\w\-_]{8,})(?:\?pwd=(\w{4}))?(?:\W*(?:提取码|密码|授权码)\s*[:：]\s*(\w{4}))?/g;
	const res = [];
	let match;
	while ((match = bdLinkRE.exec(str)) !== null) {
		const link = match[1];
		let pass = match[2] || "";
		res.push({
			link,
			pass
		});
	}
	return res;
}
function findQuarkLink(str) {
	const qkLinkRE = /https:\/\/pan\.quark\.cn\/s\/(\w+)(?:\W*\s*(?:提取码|密码|授权码)[:：]\s*(\w{4}))?/g;
	const res = [];
	let match;
	while ((match = qkLinkRE.exec(str)) !== null) {
		const link = "https://pan.quark.cn/s/" + match[1];
		const pass = match[2] || "";
		res.push({
			link,
			pass
		});
	}
	return res;
}
function findXunLeiLink(str) {
	const xlLinkRE = /(?:https?:\/\/pan\.xunlei\.com\/s\/[\w-]+)(?:\?pwd=(\w{4}))?/g;
	const res = [];
	let match;
	while ((match = xlLinkRE.exec(str)) !== null) {
		const link = match[0];
		let pass = match[1] || "";
		res.push({
			link,
			pass
		});
	}
	return res;
}
function findALYLink(str) {
	const aliyunRE = /https?:\/\/(?:www\.)*(?:aliyundrive|alipan)\.com\/s\/([\w-]{4,24})(?:\?pwd=(\w{4}))?(?:\W*(?:提取码|密码|授权码)\s*[:：]\s*(\w{4}))?/g;
	const res = [];
	let match;
	while ((match = aliyunRE.exec(str)) !== null) {
		const link = match[0];
		const pass = match[2] || match[3] || "";
		res.push({
			link,
			pass
		});
	}
	return res;
}
const findAllLink = (str) => {
	return findBDLink(str).concat(findQuarkLink(str)).concat(findXunLeiLink(str)).concat(findALYLink(str));
};

//#endregion
//#region src/utils/hash.ts
const b64encode = (str) => {
	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
};

//#endregion
//#region src/utils/utils.ts
const replaceToEm = (text) => {
	return text.replace(/<\/?(?!em\b)[a-z0-9]+(?:\s+[^>]*)?>/gi, (match) => {
		const isClosingTag = match.startsWith("</");
		return isClosingTag ? "</em>" : "<em>";
	});
};
function convertHtmlToText(html) {
	let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
	text = text.replace(/<[^>]+>/g, "\n");
	text = text.replace(/\n\s*\n/g, "\n");
	text = text.trim();
	return text;
}

//#endregion
//#region src/buyutu.js
hun.events.onSearch = async (ctx) => {
	const { page, query } = ctx;
	const { base_url } = ctx.settings;
	const { disk_type, type } = ctx.filters;
	const b64Q = encodeURIComponent(b64encode(query));
	const url = `${base_url}/s/${b64Q}?p=${page}&disktype=${disk_type}&type=${type}`;
	const resp = await fetch(url);
	const text = await resp.text();
	const $ = cheerio.load(text);
	const items = $("#list");
	const res = [];
	items.each((i, el) => {
		const $el = $(el);
		const aEl = $el.find(".card-body a").first();
		console.log("🚀 ~ items.each ~ aEl:", aEl.html());
		const title = replaceToEm(aEl.html());
		const url$1 = base_url + aEl.attr("href")?.replace("..", "");
		const body = $el.find("#body > .card-body").html();
		const tags = convertHtmlToText(body).split("\n").map((t) => t.trim()).filter((t) => t.length > 0);
		res.push({
			title,
			url: url$1,
			tags,
			payloads: {
				url: url$1,
				title
			}
		});
	});
	ctx.res = res;
};
hun.events.onInfo = async (ctx) => {
	const { title, url } = ctx.payloads;
	const resp = await fetch(url);
	const text = await resp.text();
	let links = findAllLink(text);
	links = unique(links, (f) => f.link);
	ctx.res = links.map((item) => ({
		url: item.link,
		title
	}));
};

//#endregion