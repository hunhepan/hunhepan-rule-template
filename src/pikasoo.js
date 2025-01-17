import { combineUrlPass } from './utils/disk';

hun.events.onSearch = async (ctx) => {
  const { query, page } = ctx;
  const { base_url } = ctx.settings;
  const { pan = 'all', type = 'all' } = ctx.filters;
  console.log('🚀 ~ hun.events.onSearch= ~ type:', type);
  console.log('🚀 ~ hun.events.onSearch= ~ pan:', pan);

  /* https://www.pikasoo.top/search/?pan=all&type=all&q=%E5%B0%8F%E5%AD%A6&page=2 */

  const resp = await fetch(
    `${base_url}/search/?pan=${pan}&type=${type}&q=${encodeURIComponent(
      query
    )}&page=${page}`
  );

  const textData = await resp.text();
  if (!textData) throw textData;

  const $ = cheerio.load(textData);
  const res = [];

  //.search-item
  const items = $('.search-item');
  items.each((index, item) => {
    const $item = $(item);
    const title = $item.find('.search-title').text();
    const diskType = $item.find('.search-title > img').attr('alt');
    const url = $item.find('a').first().attr('href');
    const info = $item.find('.search-des').text();
    const pass = findPass(info);
    const tags = [
      pass,
      $item.find('.search-file-size').text(),
      $item.find('.search-file-num').text(),
      $item.find('.search-creator').text(),
      diskType,
    ].filter(Boolean);
    res.push({
      title,
      info,
      url: combineUrlPass(url, pass),
      tags,
      copyable: [0, 1],
      payloads: { title, url },
    });
  });

  ctx.res = res.slice(2);
};

hun.events.onInfo = async (ctx) => {
  const { title, url } = ctx.payloads || {};

  if (!url) throw `规则错误，缺少url参数`;

  ctx.res = [
    {
      title,
      url,
    },
  ];
};

const findPass = (text) => {
  /* 提取码：44ec */
  const reg = /提取码[:：]*(\w{4,6})/;
  const match = text.match(reg);
  return match ? match[1] : '';
};
