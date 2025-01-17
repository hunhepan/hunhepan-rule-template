
//#region src/cuppaso.js
hun.events.onSearch = async (ctx) => {
	const { query, page } = ctx;
	const { base_url } = ctx.settings;
	const { type = "0" } = ctx.filters;
	if (!base_url) throw new Error("base_url not defined");
	const searchUrl = `${base_url}/search?type=${type}&keyword=${encodeURIComponent(query)}&searchType=0&page=${page}`;
	const response = await fetch(searchUrl);
	const body = await response.text();
	const $ = cheerio.load(body);
	const items = $(".card");
	const res = [];
	items.each((index, element) => {
		const item = $(element);
		const title = item.find(".card-title").text().trim();
		const url = item.find("a").attr("href");
		const time = item.find(".fs-4").text().trim();
		const shareUser = item.find(".card-actions > a").text().trim();
		if (!url) return;
		res.push({
			title,
			url: `${base_url}/${url}`,
			tags: [time, shareUser].filter(Boolean),
			payloads: {
				url: `${base_url}/${url}`,
				title
			}
		});
	});
	ctx.res = res.filter((item) => item.url && item.title);
};
hun.events.onInfo = async (ctx) => {
	const { url, title } = ctx.payloads;
	const resp = await fetch(url);
	const body = await resp.text();
	const $ = cheerio.load(body);
	const downloadUrl = $(".btn-green").attr("href");
	ctx.res = [{
		title,
		url: downloadUrl
	}];
};

//#endregion