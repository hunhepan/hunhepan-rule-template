
//#region src/utils/utils.ts
const replaceToEm = (text) => {
	return text.replace(/<\/?(?!em\b)[a-z0-9]+(?:\s+[^>]*)?>/gi, (match) => {
		const isClosingTag = match.startsWith("</");
		return isClosingTag ? "</em>" : "<em>";
	});
};

//#endregion
//#region src/templates/quarkso.js
const quarkSoSearch = async (ctx) => {
	const { query, page } = ctx || {};
	const { base_url } = ctx.settings;
	let siteUrl = base_url;
	const resp = await fetch(`${siteUrl}/s?query=${encodeURIComponent(query)}&type=1&category=%E5%85%A8%E9%83%A8&p=${page}`);
	const html = await resp.text();
	const $ = cheerio.load(html);
	const items = $("a");
	let res = [];
	items.each((index, item) => {
		const $item = $(item);
		const h2 = $item.find("h2");
		if (!h2.length) return;
		const url = siteUrl + $item.attr("href");
		const title = replaceToEm(h2.html());
		const desc = $item.find(".yp-search-result-item-text-desc").text();
		const tags = [$item.find(".yp-search-result-item-other-category").text()].filter(Boolean);
		res.push({
			title,
			url,
			tags,
			info: desc,
			copyable: [0],
			payloads: {
				title,
				url
			}
		});
	});
	ctx.res = res;
};
const quarkSoInfo = async (ctx) => {
	const { url, title } = ctx.payloads || {};
	if (!url) throw `规则错误，缺少url参数`;
	const resp = await fetch(url);
	const html = await resp.text();
	const $ = cheerio.load(html);
	const nuxtData = $("#__NUXT_DATA__").html();
	const linkRE = /.*\"(https?:\/\/.*?\/s\/[A-Za-z0-9_-]+)\"\s*,\s*{\"total\"/i;
	const match = nuxtData.match(linkRE);
	if (!match) throw "解析失败";
	const link = match[1];
	ctx.res = [{
		title,
		url: link
	}];
};

//#endregion
//#region src/quarkso.js
hun.events.onSearch = quarkSoSearch;
hun.events.onInfo = quarkSoInfo;

//#endregion