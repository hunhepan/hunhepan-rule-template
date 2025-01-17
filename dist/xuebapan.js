
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
//#region src/templates/dalipan.js
const dalipanOnSearch = async (ctx) => {
	const { page, query } = ctx;
	let { base_url } = ctx.settings || {};
	let { time } = ctx.filters || {};
	const resp = await fetch(`${base_url}/s/${encodeURIComponent(query)}-${page}-${time || 0}.html`);
	const html = await resp.text();
	const $ = cheerio.load(html);
	const items = $(".resource-item");
	console.log("🚀 ~ hun.events.onSearch= ~ items:", items.length);
	let res = [];
	items.each((index, item) => {
		const $item = $(item);
		const title = replaceToEm($item.find(".resource-title > a").html());
		const url = base_url + $item.find(".resource-title > a").attr("href");
		const info = $item.find(".detail-wrap").html();
		const tags = [$item.find(".meta-item").text(), $item.find(".other-info").text()].filter(Boolean);
		res.push({
			title,
			info: convertHtmlToText(info),
			url,
			tags,
			copyable: [1],
			payloads: {
				title,
				url
			}
		});
	});
	ctx.res = res;
};
const getPass = async (url) => {
	const resp = await fetch(url);
	const html = await resp.text();
	const $ = cheerio.load(html);
	const pwd = $("#pwd").text();
	return pwd;
};
const dalipanOnInfo = function(skey) {
	return async (ctx) => {
		const { url, title } = ctx.payloads || {};
		if (!url) throw `规则错误，缺少url参数`;
		const pwd = await getPass(url);
		console.log("🚀 ~ return ~ pwd:", pwd);
		console.log("🚀 ~ hun.events.onInfo= ~ url:", url);
		const finnalUrl = url.replace("file", "goto").replace("info", "goto");
		const resp = await fetch(finnalUrl);
		const html = await resp.text();
		if (!html?.includes("var base64 = \"")) throw "未找到base64";
		const base64 = html.match(/var base64 = "(.*?)";/)[1];
		let key = CryptoJS.enc.Latin1.parse(skey);
		let iv = CryptoJS.enc.Latin1.parse(skey);
		let decrypted = CryptoJS.AES.decrypt(base64, key, {
			iv,
			mode: CryptoJS.mode.CBC
		});
		let result = decrypted.toString(CryptoJS.enc.Utf8);
		ctx.res = [{
			title,
			url: combineUrlPass(result, pwd)
		}];
	};
};

//#endregion
//#region src/xuebapan.js
hun.events.onSearch = dalipanOnSearch;
hun.events.onInfo = dalipanOnInfo("9EB20DDFD6AFBD68");

//#endregion