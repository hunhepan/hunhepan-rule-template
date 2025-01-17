import {
  combineUrlPass
} from '../utils/disk';
import { convertHtmlToText, replaceToEm } from '../utils/utils';

const dalipanOnSearch = async (ctx) => {
  const { page, query } = ctx;
  let { base_url } = ctx.settings || {};
  let { time } = ctx.filters || {};
  // https://aliso.cc/s/%E5%B0%8F%E5%AD%A6%E8%AF%AD%E6%96%87-2-0.html

  const resp = await fetch(
    `${base_url}/s/${encodeURIComponent(query)}-${page}-${time || 0}.html`
  );

  const html = await resp.text();
  const $ = cheerio.load(html);
  const items = $('.resource-item');
  console.log('🚀 ~ hun.events.onSearch= ~ items:', items.length);
  let res = [];
  items.each((index, item) => {
    const $item = $(item);
    const title = replaceToEm($item.find('.resource-title > a').html());
    const url = base_url + $item.find('.resource-title > a').attr('href');
    const info = $item.find('.detail-wrap').html();
    const tags = [
      $item.find('.meta-item').text(),
      $item.find('.other-info').text(),
    ].filter(Boolean);
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

const getPass = async (url) => {
  const resp = await fetch(url);
  const html = await resp.text();

  const $ = cheerio.load(html);
  const pwd = $('#pwd').text();

  return pwd;
};

const dalipanOnInfo = function (skey) {
  return async (ctx) => {
    const { url, title } = ctx.payloads || {};
    if (!url) throw `规则错误，缺少url参数`;

    const pwd = await getPass(url);
    console.log('🚀 ~ return ~ pwd:', pwd);

    console.log('🚀 ~ hun.events.onInfo= ~ url:', url);
    // https://aliso.cc/file/be255df90fb927932bf797e3b7cbf9c8.html
    const finnalUrl = url.replace('file', 'goto').replace('info', 'goto');
    const resp = await fetch(finnalUrl);
    const html = await resp.text();
    if (!html?.includes('var base64 = "')) throw '未找到base64';

    const base64 = html.match(/var base64 = "(.*?)";/)[1];
    let key = CryptoJS.enc.Latin1.parse(skey);
    let iv = CryptoJS.enc.Latin1.parse(skey);
    let decrypted = CryptoJS.AES.decrypt(base64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
    });
    let result = decrypted.toString(CryptoJS.enc.Utf8);

    ctx.res = [
      {
        title,
        url: combineUrlPass(result, pwd),
      },
    ];
  };
};
export { dalipanOnInfo, dalipanOnSearch };

