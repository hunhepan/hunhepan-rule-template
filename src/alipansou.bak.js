hun.events.onSearch = async (ctx) => {
  /* https://alipansou.com/search?k=123&s=1&t=1 */

  const { query, page } = ctx;
  const { sort, type } = ctx.filters;
  const { base_url, cookies } = ctx.settings;
  console.log('🚀 ~ hun.events.onSearch= ~ type:', type);
  console.log('🚀 ~ hun.events.onSearch= ~ sort:', sort);

  const url = `${base_url}/search?k=${query}&s=${page}&t=${type}&sort=${sort}`;
  const response = await fetch(url);
};
