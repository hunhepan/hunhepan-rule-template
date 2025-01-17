
//#region src/utils/disk.ts
const enumKey = {
	KeyBDY: "BDY",
	KeyLZY: "LZY",
	KeyALY: "ALY",
	KeyQuark: "QUARK",
	KeyXunlei: "XUNLEI",
	Key115: "115"
};
const getDiskIDAndType = (url) => {
	let diskType = "";
	let diskID = "";
	if (url.includes("baidu") && url.includes("init")) {
		const re = /https?:\/\/(?:pan|eyun)\.baidu\.com\/share\/init\?surl=([a-zA-Z0-9_-]{5,25})/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyBDY;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("baidu")) {
		const re = /https?:\/\/(?:pan|eyun)\.baidu\.com\/s\/[\d]([a-zA-Z0-9_-]{5,25})/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyBDY;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("lanzou")) {
		const re = /https?:\/\/(?:\w+)?\.?lanzou.?\.com\/([\w-_]{6,13})/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyLZY;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("alywp")) {
		const re = /https?:\/\/(?:www\.)*alywp\.net\/([\w_]{4,20})/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyALY;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("aliyundrive") || url.includes("alipan")) {
		const re = /https?:\/\/(?:www\.)*(?:aliyundrive|alipan)\.com\/s\/([\w_]{4,20})/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyALY;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("quark")) {
		const re = /https?:\/\/pan\.quark\.cn\/s\/(\w+)/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyQuark;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("xunlei")) {
		const re = /https?:\/\/pan\.xunlei\.com\/s\/([\w-]+)/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.KeyXunlei;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	} else if (url.includes("115")) {
		const re = /https?:\/\/115\.com\/s\/([\w]+)/;
		const res = url.match(re);
		if (res && res.length === 2) {
			diskType = enumKey.Key115;
			diskID = res[1];
			return {
				diskType,
				diskID
			};
		}
	}
	return null;
};
const getDiskIDAndTypeAndPass = (url) => {
	let diskPass = "";
	const passMatch = url.match(/pwd=([a-zA-Z0-9]+)/);
	if (passMatch && passMatch.length === 2) diskPass = passMatch[1];
	const result = getDiskIDAndType(url);
	if (result) return {
		...result,
		diskPass
	};
	return null;
};
function generateDiskLink(diskID, diskType, diskPass) {
	let link;
	switch (diskType) {
		case enumKey.KeyBDY:
			link = `https://pan.baidu.com/s/1${diskID}?pwd=${diskPass || ""}`;
			break;
		case enumKey.KeyQuark:
			link = `https://pan.quark.cn/s/${diskID}`;
			break;
		case enumKey.KeyXunlei:
			link = `https://pan.xunlei.com/s/${diskID}?pwd=${diskPass || ""}`;
			break;
		case enumKey.KeyALY:
			link = `https://www.alipan.com/s/${diskID}?pwd=${diskPass || ""}`;
			break;
		default: return "";
	}
	return diskPass ? link : link.replace(/\?pwd=$/, "");
}
const combineUrlPass = (url, pwd) => {
	const data = getDiskIDAndTypeAndPass(url);
	if (!data) return url;
	const { diskID, diskType, diskPass } = data;
	const diskUrl = generateDiskLink(diskID, diskType, diskPass || pwd || "");
	return diskUrl;
};

//#endregion
//#region src/utils/utils.ts
function convertHtmlToText(html) {
	let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
	text = text.replace(/<[^>]+>/g, "\n");
	text = text.replace(/\n\s*\n/g, "\n");
	text = text.trim();
	return text;
}

//#endregion
//#region src/qianfan.js
hun.events.onSearch = async (ctx) => {
	const { page, query } = ctx;
	const { code } = ctx.settings || {};
	const { pan = "all", type = "all" } = ctx.filters || {};
	console.log("🚀 ~ hun.events.onSearch= ~ type:", type);
	console.log("🚀 ~ hun.events.onSearch= ~ pan:", pan);
	console.log("🚀 ~ hun.events.onSearch= ~ cookies:", cookies);
	console.log("🚀 ~ hun.events.onSearch= ~ query:", query);
	console.log("🚀 ~ hun.events.onSearch= ~ page:", page);
	if (!code) throw "请先在设置中填写code";
	const base_url = `https://www.niceso.net`;
	const url = `${base_url}/search/?pan=${pan}&type=${type}&q=${encodeURIComponent(query)}&page=${page}`;
	const data = await fetch(url, { headers: { Cookie: `code=${code}` } });
	const html = await data.text();
	if (html.includes("请输入激活码\"")) throw "激活码错误";
	const $ = cheerio.load(html);
	const items = $(".search-item");
	const res = [];
	items.each((index, element) => {
		const $element = $(element);
		const title = $element.find(".search-title").text();
		const des = $element.find(".search-des").html();
		const size = $element.find(".search-file-size").text();
		const num = $element.find(".search-file-num").text();
		const creator = $element.find(".search-creator").text();
		const href = $element.find("a").attr("href");
		console.log("🚀 ~ items.each ~ href:", href);
		const alt = $element.find("img").attr("alt");
		const item = {
			title,
			info: convertHtmlToText(des),
			tags: [
				size,
				num,
				creator,
				alt
			].filter(Boolean),
			url: `${base_url}${href}`,
			payloads: {
				url: `${base_url}${href}`,
				title
			}
		};
		res.push(item);
	});
	ctx.res = res;
};
hun.events.onInfo = async (ctx) => {
	const { url, title } = ctx.payloads;
	const { code } = ctx.settings || {};
	const data = await fetch(url, { headers: { Cookie: `code=${code}` } });
	const html = await data.text();
	const $ = cheerio.load(html);
	const item = $(".pan-url").first();
	if (!item) throw "未找到资源";
	const pwd = $("[data-pwd]").attr("data-pwd");
	const dataUrl = item.attr("data-url");
	const dataID = item.attr("id");
	let diskUrl = loadUrl(dataUrl, dataID.split(""));
	console.log("🚀 ~ hun.events.onInfo= ~ diskUrl:", diskUrl);
	ctx.res = [{
		title,
		url: combineUrlPass(diskUrl, pwd)
	}];
};
function loadUrl(str, arr) {
	arr.forEach((item) => {
		if (isNaN(parseInt(item))) {
			const position = parseInt(item, 16);
			str = str.substring(0, position) + str.substring(position + 1, position + 1e4);
		}
	});
	const wordArray = CryptoJS.enc.Base64.parse(str);
	const decodedStr = CryptoJS.enc.Utf8.stringify(wordArray);
	return decodedStr;
}

//#endregion