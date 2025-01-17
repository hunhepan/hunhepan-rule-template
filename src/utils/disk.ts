export interface LinkType {
  link: string;
  pass?: string;
}

function findBDLink(str: string) {
  const bdLinkRE =
    /(https?:\/\/(?:pan|yun|eyun)\.baidu\.com\/s(?:hare)?\/(?:int\?surl=)?[\w\-_]{8,})(?:\?pwd=(\w{4}))?(?:\W*(?:提取码|密码|授权码)\s*[:：]\s*(\w{4}))?/g;
  const res: LinkType[] = [];
  let match;
  while ((match = bdLinkRE.exec(str)) !== null) {
    const link = match[1];
    let pass = match[2] || '';
    res.push({ link: link, pass: pass });
  }
  return res;
}

function findQuarkLink(str: string) {
  const qkLinkRE =
    /https:\/\/pan\.quark\.cn\/s\/(\w+)(?:\W*\s*(?:提取码|密码|授权码)[:：]\s*(\w{4}))?/g;
  const res: LinkType[] = [];
  let match;
  while ((match = qkLinkRE.exec(str)) !== null) {
    const link = 'https://pan.quark.cn/s/' + match[1];
    const pass = match[2] || '';
    res.push({ link: link, pass: pass });
  }
  return res;
}

function findXunLeiLink(str: string) {
  const xlLinkRE =
    /(?:https?:\/\/pan\.xunlei\.com\/s\/[\w-]+)(?:\?pwd=(\w{4}))?/g;
  const res: LinkType[] = [];
  let match;
  while ((match = xlLinkRE.exec(str)) !== null) {
    const link = match[0];
    let pass = match[1] || '';
    res.push({ link: link, pass: pass });
  }
  return res;
}

function findALYLink(str: string) {
  const aliyunRE =
    /https?:\/\/(?:www\.)*(?:aliyundrive|alipan)\.com\/s\/([\w-]{4,24})(?:\?pwd=(\w{4}))?(?:\W*(?:提取码|密码|授权码)\s*[:：]\s*(\w{4}))?/g;
  const res: LinkType[] = [];
  let match;
  while ((match = aliyunRE.exec(str)) !== null) {
    const link = match[0];
    const pass = match[2] || match[3] || '';
    res.push({ link, pass });
  }
  return res;
}

const findAllLink = (str: string) => {
  return findBDLink(str)
    .concat(findQuarkLink(str))
    .concat(findXunLeiLink(str))
    .concat(findALYLink(str));
};

const enumKey = {
  KeyBDY: 'BDY',
  KeyLZY: 'LZY',
  KeyALY: 'ALY',
  KeyQuark: 'QUARK',
  KeyXunlei: 'XUNLEI',
  Key115: '115',
};

const getDiskIDAndType = (
  url: string
): { diskType: string; diskID: string } | null => {
  let diskType = '';
  let diskID = '';

  if (url.includes('baidu') && url.includes('init')) {
    const re =
      /https?:\/\/(?:pan|eyun)\.baidu\.com\/share\/init\?surl=([a-zA-Z0-9_-]{5,25})/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyBDY;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('baidu')) {
    const re =
      /https?:\/\/(?:pan|eyun)\.baidu\.com\/s\/[\d]([a-zA-Z0-9_-]{5,25})/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyBDY;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('lanzou')) {
    const re = /https?:\/\/(?:\w+)?\.?lanzou.?\.com\/([\w-_]{6,13})/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyLZY;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('alywp')) {
    const re = /https?:\/\/(?:www\.)*alywp\.net\/([\w_]{4,20})/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyALY;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('aliyundrive') || url.includes('alipan')) {
    const re =
      /https?:\/\/(?:www\.)*(?:aliyundrive|alipan)\.com\/s\/([\w_]{4,20})/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyALY;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('quark')) {
    const re = /https?:\/\/pan\.quark\.cn\/s\/(\w+)/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyQuark;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('xunlei')) {
    const re = /https?:\/\/pan\.xunlei\.com\/s\/([\w-]+)/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.KeyXunlei;
      diskID = res[1];
      return { diskType, diskID };
    }
  } else if (url.includes('115')) {
    const re = /https?:\/\/115\.com\/s\/([\w]+)/;
    const res = url.match(re);
    if (res && res.length === 2) {
      diskType = enumKey.Key115;
      diskID = res[1];
      return { diskType, diskID };
    }
  }

  return null;
};

const getDiskIDAndTypeAndPass = (
  url: string
): { diskType: string; diskID: string; diskPass?: string } | null => {
  let diskPass = '';

  const passMatch = url.match(/pwd=([a-zA-Z0-9]+)/);
  if (passMatch && passMatch.length === 2) {
    diskPass = passMatch[1];
  }

  const result = getDiskIDAndType(url);
  if (result) {
    return { ...result, diskPass };
  }

  return null;
};

const isDiskUrl = (url: string): boolean => {
  const diskPatterns = [
    /https?:\/\/(?:pan|eyun)\.baidu\.com\/share\/init\?surl=([a-zA-Z0-9_-]{5,25})/,
    /https?:\/\/(?:pan|eyun)\.baidu\.com\/s\/[\d]([a-zA-Z0-9_-]{5,25})/,
    /https?:\/\/(?:\w+)?\.?lanzou.?\.com\/([\w-_]{6,13})/,
    /https?:\/\/(?:www\.)*alywp\.net\/([\w_]{4,20})/,
    /https?:\/\/(?:www\.)*aliyundrive\.com\/s\/([\w_]{4,20})/,
    /https?:\/\/(?:www\.)*alipan\.com\/s\/([\w_]{4,20})/,
    /https?:\/\/pan\.quark\.cn\/s\/(\w+)/,
    /https?:\/\/pan\.xunlei\.com\/s\/([\w-]+)/,
    /https?:\/\/115\.com\/s\/([\w]+)/,
  ];

  return diskPatterns.some((pattern) => pattern.test(url));
};

function generateDiskLink(
  diskID: string,
  diskType: string,
  diskPass?: string
): string {
  let link: string;

  switch (diskType) {
    case enumKey.KeyBDY:
      link = `https://pan.baidu.com/s/1${diskID}?pwd=${diskPass || ''}`;
      break;
    case enumKey.KeyQuark:
      link = `https://pan.quark.cn/s/${diskID}`;
      break;
    case enumKey.KeyXunlei:
      link = `https://pan.xunlei.com/s/${diskID}?pwd=${diskPass || ''}`;
      break;
    case enumKey.KeyALY:
      link = `https://www.alipan.com/s/${diskID}?pwd=${diskPass || ''}`;
      break;
    default:
      return '';
  }

  // remove ?=pwd if diskPass is empty
  return diskPass ? link : link.replace(/\?pwd=$/, '');
}

const combineUrlPass = (url: string, pwd: string) => {
  const data = getDiskIDAndTypeAndPass(url);
  if (!data) return url;
  const { diskID, diskType, diskPass } = data;
  const diskUrl = generateDiskLink(diskID, diskType, diskPass || pwd || '');
  return diskUrl;
};

export {
  getDiskIDAndTypeAndPass,
  getDiskIDAndType,
  findBDLink,
  findQuarkLink,
  findXunLeiLink,
  findALYLink,
  findAllLink,
  generateDiskLink,
  combineUrlPass,
};
