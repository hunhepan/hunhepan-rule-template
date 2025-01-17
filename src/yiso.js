import { convertHtmlToText, replaceToEm } from './utils/utils';

hun.events.onSearch = async (ctx) => {
  const { page, query } = ctx;
  const { cookies, base_url } = ctx.settings || {};
  const { type } = ctx.filters || {};
  console.log('🚀 ~ hun.events.onSearch= ~ type:', type);

  /* 
https://yiso.fun/api/search?name=%E5%A4%A7%E5%A5%89%E6%89%93%E6%9B%B4%E4%BA%BA&pageNo=3
//  */

  if (!cookies) throw '请先在设置里添加Cookies';
  const resp = await fetch(
    `${base_url}/api/search?name=${encodeURIComponent(
      query
    )}&pageNo=${page}&type=${type || ''}`,
    {
      headers: {
        cookie: cookies,
      },
    }
  );

  const textData = await resp.text();
  if (!textData) throw textData;

  const { code, data, msg } = JSON.parse(textData);

  if (code !== 200) {
    throw msg || '请求失败';
  }

  const items = data.list;
  console.log('🚀 ~ hun.events.onSearch= ~ items:', JSON.stringify(items));

  if (!items) {
    ctx.res = [];
    return;
  }
  const res = [];
  items.forEach((item) => {
    const title = replaceToEm(item.name);
    const url = decrypt(item.url);
    const info = (item.fileInfos || []).map((f) => f.fileName).join('\n');
    const tags = [item.from, item.gmtShare].filter(Boolean);
    res.push({
      title,
      info: convertHtmlToText(info),
      url,
      tags,
      copyable: [1],
      payloads: { title, url },
    });
  });

  ctx.res = res;
};

hun.events.onInfo = async (ctx) => {
  const { url, title } = ctx.payloads || {};

  if (!url) throw `规则错误，缺少url参数`;

  ctx.res = [
    {
      title: title,
      url: url,
    },
  ];
};

const decrypt = (url) => {
  const key = '4OToScUFOaeVTrHE';
  const iv = '9CLGao1vHKqm17Oz';

  const a = CryptoJS.enc.Utf8.parse(key);
  const e = CryptoJS.enc.Utf8.parse(iv);
  return CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(url),
    },
    a,
    {
      iv: e,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString(CryptoJS.enc.Utf8);
};
