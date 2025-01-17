
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
//#region src/pikasoo.js
hun.events.onSearch = async (ctx) => {
	const { query, page } = ctx;
	const { base_url } = ctx.settings;
	const { pan = "all", type = "all" } = ctx.filters;
	console.log("🚀 ~ hun.events.onSearch= ~ type:", type);
	console.log("🚀 ~ hun.events.onSearch= ~ pan:", pan);
	const resp = await fetch(`${base_url}/search/?pan=${pan}&type=${type}&q=${encodeURIComponent(query)}&page=${page}`);
	const textData = await resp.text();
	if (!textData) throw textData;
	const $ = cheerio.load(textData);
	const res = [];
	const items = $(".search-item");
	items.each((index, item) => {
		const $item = $(item);
		const title = $item.find(".search-title").text();
		const diskType = $item.find(".search-title > img").attr("alt");
		const url = $item.find("a").first().attr("href");
		const info = $item.find(".search-des").text();
		const pass = findPass(info);
		const tags = [
			pass,
			$item.find(".search-file-size").text(),
			$item.find(".search-file-num").text(),
			$item.find(".search-creator").text(),
			diskType
		].filter(Boolean);
		res.push({
			title,
			info,
			url: combineUrlPass(url, pass),
			tags,
			copyable: [0, 1],
			payloads: {
				title,
				url
			}
		});
	});
	ctx.res = res.slice(2);
};
hun.events.onInfo = async (ctx) => {
	const { title, url } = ctx.payloads || {};
	if (!url) throw `规则错误，缺少url参数`;
	ctx.res = [{
		title,
		url
	}];
};
const findPass = (text) => {
	const reg = /提取码[:：]*(\w{4,6})/;
	const match = text.match(reg);
	return match ? match[1] : "";
};

//#endregion