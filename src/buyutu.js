import { unique } from 'radash';
import { findAllLink } from './utils/disk';
import { b64encode } from './utils/hash';
import { convertHtmlToText, replaceToEm } from './utils/utils';

hun.events.onSearch = async (ctx) => {
  const { page, query } = ctx;
  const { base_url } = ctx.settings;
  const { disk_type, type } = ctx.filters;

  /* https://www.buyutu.com/s/MzQzNA%3D%3D?p=2&disktype=quark */
  /* https://www.buyutu.com/s/MzQzNA%3D%3D?disktype=quark&type=0 */

  const b64Q = encodeURIComponent(b64encode(query));

  const url = `${base_url}/s/${b64Q}?p=${page}&disktype=${disk_type}&type=${type}`;

  const resp = await fetch(url);
  const text = await resp.text();

  const $ = cheerio.load(text);
  const items = $('#list');
  const res = [];

  items.each((i, el) => {
    // need: info, title,url ,tags,
    const $el = $(el);
    const aEl = $el.find('.card-body a').first();
    console.log('🚀 ~ items.each ~ aEl:', aEl.html());
    const title = replaceToEm(aEl.html());
    const url = base_url + aEl.attr('href')?.replace('..', '');

    const body = $el.find('#body > .card-body').html();

    const tags = convertHtmlToText(body)
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    res.push({
      title,
      url,
      tags,
      payloads: {
        url,
        title,
      },
    });
  });

  ctx.res = res;
};

hun.events.onInfo = async (ctx) => {
  const { title, url } = ctx.payloads;
  const resp = await fetch(url);
  const text = await resp.text();

  let links = findAllLink(text);

  links = unique(links, (f) => f.link);

  ctx.res = links.map((item) => ({
    url: item.link,
    title,
  }));
};
