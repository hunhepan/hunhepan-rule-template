/* 
https://www.niceso.net/code/
*/

import { combineUrlPass } from './utils/disk';
import { convertHtmlToText } from './utils/utils';

hun.events.onSearch = async (ctx) => {
  const { page, query } = ctx;
  const { code } = ctx.settings || {};
  const { pan = 'all', type = 'all' } = ctx.filters || {};
  console.log('🚀 ~ hun.events.onSearch= ~ type:', type);
  console.log('🚀 ~ hun.events.onSearch= ~ pan:', pan);
  console.log('🚀 ~ hun.events.onSearch= ~ cookies:', cookies);
  console.log('🚀 ~ hun.events.onSearch= ~ query:', query);
  console.log('🚀 ~ hun.events.onSearch= ~ page:', page);

  if (!code) throw '请先在设置中填写code';
  const base_url = `https://www.niceso.net`;

  /* https://www.niceso.net/search/?pan=all&type=all&q=%E9%AB%98%E4%B8%AD&page=2 */
  const url = `${base_url}/search/?pan=${pan}&type=${type}&q=${encodeURIComponent(
    query
  )}&page=${page}`;

  const data = await fetch(url, {
    headers: {
      Cookie: `code=${code}`,
    },
  });
  const html = await data.text();

  if (html.includes('请输入激活码"')) {
    throw '激活码错误';
  }

  const $ = cheerio.load(html);
  const items = $('.search-item');
  const res = [];

  items.each((index, element) => {
    const $element = $(element);
    const title = $element.find('.search-title').text();
    const des = $element.find('.search-des').html();
    const size = $element.find('.search-file-size').text();
    const num = $element.find('.search-file-num').text();
    const creator = $element.find('.search-creator').text();
    const href = $element.find('a').attr('href');
    console.log('🚀 ~ items.each ~ href:', href);
    const alt = $element.find('img').attr('alt');

    const item = {
      title,
      info: convertHtmlToText(des),
      tags: [size, num, creator, alt].filter(Boolean),
      url: `${base_url}${href}`,
      payloads: {
        url: `${base_url}${href}`,
        title: title,
      },
    };
    res.push(item);
  });

  ctx.res = res;
};

hun.events.onInfo = async (ctx) => {
  const { url, title } = ctx.payloads;
  const { code } = ctx.settings || {};

  const data = await fetch(url, {
    headers: {
      Cookie: `code=${code}`,
    },
  });

  const html = await data.text();
  const $ = cheerio.load(html);

  const item = $('.pan-url').first();
  if (!item) throw '未找到资源';

  // data-pwd
  const pwd = $('[data-pwd]').attr('data-pwd');

  const dataUrl = item.attr('data-url');
  const dataID = item.attr('id');

  let diskUrl = loadUrl(dataUrl, dataID.split(''));
  console.log('🚀 ~ hun.events.onInfo= ~ diskUrl:', diskUrl);

  ctx.res = [
    {
      title,
      url: combineUrlPass(diskUrl, pwd),
    },
  ];
};

function loadUrl(str, arr) {
  arr.forEach((item) => {
    if (isNaN(parseInt(item))) {
      const position = parseInt(item, 16);
      str =
        str.substring(0, position) +
        str.substring(position + 1, position + 10000);
    }
  });

  const wordArray = CryptoJS.enc.Base64.parse(str);

  const decodedStr = CryptoJS.enc.Utf8.stringify(wordArray);

  return decodedStr;
}
