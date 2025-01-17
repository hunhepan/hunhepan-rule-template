
//#region src/hunhepan.js
hun.events.onSearch = async (ctx) => {
	const { page, query } = ctx;
	const { exact, type = "", time = "" } = ctx.filters || {};
	const resp = await fetch("https://hunhepan.com/open/search/disk", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"user-agent": "okhttp/3.12.1"
		},
		body: JSON.stringify({
			q: query,
			page,
			exact,
			time,
			type,
			size: 20
		})
	});
	const data = await resp.json();
	const { code, msg } = data;
	if (code !== 200) throw msg || "请求失败";
	let res = [];
	if (data.data?.list) res = data.data.list.map((item) => {
		return {
			title: item.disk_name,
			info: item.files,
			url: item.url,
			tags: [item.disk_type, item.share_user],
			copyable: [1],
			payloads: {
				doc_id: item.doc_id,
				link: item.link,
				title: item.disk_name
			}
		};
	});
	ctx.res = res;
};
hun.events.onInfo = async (ctx) => {
	const { link, title } = ctx.payloads || {};
	console.log("🚀 ~ hun.events.onInfo= ~ link:", link);
	let one = {
		title,
		url: link
	};
	ctx.res = new Array(1).fill(one);
};
hun.events.onList = async (ctx) => {
	const { page } = ctx;
	const { id } = ctx.payloads;
	console.log("🚀 ~ hun.events.onList= ~ ctx:", JSON.stringify(ctx.filters));
	console.log("🚀 ~ hun.events.onList= ~ id:", id);
	const resp = await fetch(`https://api.hunhepan.com/v1/extab/raw_disks/${id}?page=${page}&size=10`, { headers: {
		method: "GET",
		"user-agent": "okhttp/3.12.1",
		"content-type": "application/json"
	} });
	const data = await resp.json();
	const { code, msg } = data;
	if (code !== 200) throw msg || "请求失败";
	let res = [];
	if (data.data?.list) res = data.data.list.map((item) => {
		console.log("🚀 ~ res=data.data.list.map ~ item:", JSON.stringify(item));
		return {
			title: item.disk_name,
			info: item.files?.join("\n"),
			url: item.url,
			tags: [item.disk_type, item.share_user],
			copyable: [1],
			payloads: {
				doc_id: item.doc_id,
				link: item.link,
				title: item.disk_name
			}
		};
	});
	ctx.res = res;
};
hun.events.onTab = async (ctx) => {
	let res = [];
	const tabsResp = await fetch("https://api.hunhepan.com/v1/extab/list_all", { headers: {
		"user-agent": "okhttp/3.12.1",
		"content-type": "application/json"
	} });
	const tabsData = await tabsResp.json();
	const { code, msg } = tabsData;
	if (code !== 200) throw msg || "请求失败";
	for (const tab of tabsData.data) res.push({
		label: tab.name,
		payloads: {
			id: tab.id,
			key: tab.key
		}
	});
	console.log("🚀 ~ hun.events.onTab= ~ res:", res);
	ctx.res = res;
};

//#endregion