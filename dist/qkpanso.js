
//#region src/qkpanso.js
hun.events.onSearch = async (ctx) => {
	const { page, query } = ctx;
	const { exact, type = "", time = "" } = ctx.filters || {};
	const { user_agent } = ctx.settings || {};
	var encrypted = CryptoJS.TripleDES.encrypt("Message", "Secret Passphrase");
	console.log("🚀 ~ hun.events.onSearch= ~ encrypted:", encrypted);
	const html = `
  <div class="container">
    <h1 id="title">Hello World</h1>
    <p class="content">This is a <span>test</span> paragraph</p>
    <ul class="list">
        <li>Item 1</li>
        <li>Item 2</li>
    </ul>
</div>
  `;
	const $ = cheerio.load(html);
	const title = $(".container li").text();
	console.log("🚀 ~ hun.events.onSearch= ~ title:", title);
	let payload = {
		page,
		q: query,
		user: "",
		exact: false,
		format: [],
		share_time: "",
		size: 15,
		type: "",
		exclude_user: [],
		adv_params: {
			wechat_pwd: "",
			platform: "pc"
		}
	};
	let resp = await fetch("https://qkpanso.com/v1/search/disk", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"user-agent": user_agent
		},
		body: JSON.stringify(payload)
	});
	let data = await resp.json();
	console.log("🚀 ~ hun.events.onSearch= ~ data:", JSON.stringify(data));
	let res = [];
	const { code, msg } = data;
	if (code !== 200) throw msg || "请求失败";
	if (data.data?.list) res = data.data.list.map((item) => {
		return {
			title: item.disk_name,
			info: item.files,
			url: item.url,
			tags: [
				item.disk_type,
				item.share_user,
				item.share_user_id,
				item.disk_pass
			],
			copyable: [
				1,
				2,
				3
			],
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
	await new Promise((resolve) => setTimeout(resolve, 500));
	let one = {
		title,
		url: link
	};
	ctx.res = new Array(1).fill(one);
};

//#endregion