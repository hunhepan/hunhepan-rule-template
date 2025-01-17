import { combineUrlPass, findAllLink } from '../utils/disk';
import { unique } from 'radash';

const flarumOnList = (sliceNum) => {
  return async (ctx) => {
    const { page } = ctx;
    const { base_url } = ctx.settings;
    const { slug, name, id } = ctx.payloads;

    const url = `${base_url}/api/discussions`;
    /* 
    include: user,lastPostedUser,tags,tags.parent,firstPost
  sort: 
  page[offset]: 20
     */
    const size = 20;
    const offset = (page - 1) * size;
    const payloads = {
      include: 'user,lastPostedUser,tags,tags.parent,firstPost',
      sort: '',
      'page[offset]': offset,
    };
    if (slug !== 'latest') {
      payloads['filter[tag]'] = slug;
    }
    const finnalUrl = `${url}?${new URLSearchParams(payloads)}`;
    const resp = await fetch(finnalUrl);

    const jsonData = await resp.json();

    const { data } = jsonData;
    if (!data) {
      return;
    }
    const res = [];

    data.forEach((item) => {
      const { id, attributes } = item;
      const { title, slug, createdAt, lastPostedAt } = attributes;

      res.push({
        title,
        info: slug,
        tags: [createdAt, lastPostedAt].filter(Boolean),
        payloads: {
          id,
          origin_url: `${base_url}/d/${id}`,
        },
      });
    });

    res.splice(0, sliceNum);
    ctx.res = res;
  };
};

const flarumOnInfo = async (ctx) => {
  const { id, title, origin_url } = ctx.payloads;
  const { base_url } = ctx.settings;

  const url = `${base_url}/d/${id}`;

  const resp = await fetch(url);
  const html = await resp.text();

  const $ = cheerio.load(html);
  const text = $('#flarum-content').text();
  const $2 = cheerio.load(text);
  const bodyText = $2.text();
  console.log('🚀 ~ flarumOnInfo ~ bodyText:', bodyText);

  const linkRes = findAllLink(bodyText);
  const res = linkRes.map((item) => {
    return {
      title,
      url: combineUrlPass(item.link, item.pass),
    };
  });

  ctx.origin_url = origin_url;
  ctx.res = unique(res, (f) => f.url);
};

const flarumOnTab = async (ctx) => {
  const { base_url } = ctx.settings;

  const url = `${base_url}/api/tags`;
  const payloads = {
    include: 'children',
    sort: '',
  };

  const resp = await fetch(`${url}?${new URLSearchParams(payloads)}`);
  const jsonData = await resp.json();

  const { data } = jsonData;
  if (!data) return;

  const res = [
    {
      label: '最新',
      payloads: {
        id: 'latest',
        name: '最新',
        slug: 'latest',
      },
    },
  ];
  data.forEach((item) => {
    const { id, attributes } = item;
    const { name, slug } = attributes;
    console.log('🚀 ~ data.forEach ~ name:', name);
    res.push({
      label: name,
      payloads: {
        id,
        name,
        slug,
        origin_url: `${base_url}/d/${id}`,
      },
    });
  });

  ctx.res = res;
};

const flarumOnSearch = async (ctx) => {
  const { query, page } = ctx;
  const { base_url } = ctx.settings;

  const url = `${base_url}/api/discussions`;
  const size = 20;
  const offset = (page - 1) * size;

  const payloads = {
    'filter[q]': query,
    'page[offset]': offset,
    include:
      'user,lastPostedUser,mostRelevantPost,mostRelevantPost.user,tags,tags.parent,firstPost',
  };

  const resp = await fetch(`${url}?${new URLSearchParams(payloads)}`);

  const jsonData = await resp.json();
  const { data } = jsonData;

  if (!data) {
    return;
  }

  const res = [];

  data.forEach((item) => {
    const { id, attributes } = item;
    const { title, slug, createdAt, lastPostedAt } = attributes;

    res.push({
      title,
      info: slug,
      tags: [createdAt, lastPostedAt].filter(Boolean),
      payloads: {
        id,
      },
    });
  });

  ctx.res = res;
};

export { flarumOnList, flarumOnInfo, flarumOnTab, flarumOnSearch };
