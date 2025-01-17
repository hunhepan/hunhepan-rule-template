
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
//#region src/templates/flarum.js
const flarumOnList = (sliceNum) => {
	return async (ctx) => {
		const { page } = ctx;
		const { base_url } = ctx.settings;
		const { slug, name, id } = ctx.payloads;
		const url = `${base_url}/api/discussions`;
		const size = 20;
		const offset = (page - 1) * size;
		const payloads = {
			include: "user,lastPostedUser,tags,tags.parent,firstPost",
			sort: "",
			"page[offset]": offset
		};
		if (slug !== "latest") payloads["filter[tag]"] = slug;
		const finnalUrl = `${url}?${new URLSearchParams(payloads)}`;
		const resp = await fetch(finnalUrl);
		const jsonData = await resp.json();
		const { data } = jsonData;
		if (!data) return;
		const res = [];
		data.forEach((item) => {
			const { id: id$1, attributes } = item;
			const { title, slug: slug$1, createdAt, lastPostedAt } = attributes;
			res.push({
				title,
				info: slug$1,
				tags: [createdAt, lastPostedAt].filter(Boolean),
				payloads: {
					id: id$1,
					origin_url: `${base_url}/d/${id$1}`
				}
			});
		});
		res.splice(0, sliceNum);
		ctx.res = res;
	};
};
const flarumOnInfo = async (ctx) => {
	const { id, title, origin_url } = ctx.payloads;
	const { base_url } = ctx.settings;
	const url = `${base_url}/d/${id}`;
	const resp = await fetch(url);
	const html = await resp.text();
	const $ = cheerio.load(html);
	const text = $("#flarum-content").text();
	const $2 = cheerio.load(text);
	const bodyText = $2.text();
	console.log("🚀 ~ flarumOnInfo ~ bodyText:", bodyText);
	const linkRes = findAllLink(bodyText);
	const res = linkRes.map((item) => {
		return {
			title,
			url: combineUrlPass(item.link, item.pass)
		};
	});
	ctx.origin_url = origin_url;
	ctx.res = unique(res, (f) => f.url);
};
const flarumOnTab = async (ctx) => {
	const { base_url } = ctx.settings;
	const url = `${base_url}/api/tags`;
	const payloads = {
		include: "children",
		sort: ""
	};
	const resp = await fetch(`${url}?${new URLSearchParams(payloads)}`);
	const jsonData = await resp.json();
	const { data } = jsonData;
	if (!data) return;
	const res = [{
		label: "最新",
		payloads: {
			id: "latest",
			name: "最新",
			slug: "latest"
		}
	}];
	data.forEach((item) => {
		const { id, attributes } = item;
		const { name, slug } = attributes;
		console.log("🚀 ~ data.forEach ~ name:", name);
		res.push({
			label: name,
			payloads: {
				id,
				name,
				slug,
				origin_url: `${base_url}/d/${id}`
			}
		});
	});
	ctx.res = res;
};
const flarumOnSearch = async (ctx) => {
	const { query, page } = ctx;
	const { base_url } = ctx.settings;
	const url = `${base_url}/api/discussions`;
	const size = 20;
	const offset = (page - 1) * size;
	const payloads = {
		"filter[q]": query,
		"page[offset]": offset,
		include: "user,lastPostedUser,mostRelevantPost,mostRelevantPost.user,tags,tags.parent,firstPost"
	};
	const resp = await fetch(`${url}?${new URLSearchParams(payloads)}`);
	const jsonData = await resp.json();
	const { data } = jsonData;
	if (!data) return;
	const res = [];
	data.forEach((item) => {
		const { id, attributes } = item;
		const { title, slug, createdAt, lastPostedAt } = attributes;
		res.push({
			title,
			info: slug,
			tags: [createdAt, lastPostedAt].filter(Boolean),
			payloads: { id }
		});
	});
	ctx.res = res;
};

//#endregion
//#region src/yyurl.js
hun.events.onList = flarumOnList(3);
hun.events.onInfo = flarumOnInfo;
hun.events.onTab = flarumOnTab;
hun.events.onSearch = flarumOnSearch;

//#endregion