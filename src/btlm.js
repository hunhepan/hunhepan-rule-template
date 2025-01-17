const { extractHash, completeHash } = require('./utils/magent');
const { replaceToEm, convertHtmlToText } = require('./utils/utils');

hun.events.onSearch = async (ctx) => {
  /* https://cdn.btlm.top:65533/s?word=%E7%94%B5%E8%AF%9D&sort=date */
  const { query, page } = ctx;
  const { sort } = ctx.filters;
  const { base_url } = ctx.settings;

  const url = `${base_url}/s?word=${encodeURIComponent(
    query
  )}&sort=${sort}&page=${page}`;
  console.log('🚀 ~ hun.events.onSearch= ~ url:', url);

  const response = await fetch(url, {
    headers: {
      referer: 'https://btlm.top/',
    },
  });
  const html = await response.text();
  console.log('🚀 ~ hun.events.onSearch= ~ html:', html);

  const $ = cheerio.load(html);

  const items = $('.list-unstyled');
  const res = [];
  console.log('🚀 ~ hun.events.onSearch= ~ items:', items.length);

  items.each((index, element) => {
    const item = $(element);

    //.list-title
    const aEl = item.find('.list-title > a');
    const title = replaceToEm(aEl.html());
    const hash = extractHash(aEl.attr('href'));

    if (!hash) return;

    // result-resource-meta-info
    const metaEl = item.find('.result-resource-meta-info');
    const info = metaEl.text();

    res.push({
      title,
      info: info.replaceAll('nbsp;\n*', ' '),
      url: hash,
      payloads: {
        title,
        url: hash,
      },
    });
  });

  ctx.res = res;
};

hun.events.onInfo = async (ctx) => {
  const { url, title } = ctx.payloads;

  ctx.res = [
    {
      url: completeHash(url),
      title,
    },
  ];
};
