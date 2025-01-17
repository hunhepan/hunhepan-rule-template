const b64decode = (str: string): string => {
  // use cryptojs
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(str));
};

const b64encode = (str: string): string => {
  // use cryptojs
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
};

const md5 = (str: string): string => {
  return CryptoJS.MD5(str).toString();
};

export { b64decode, b64encode, md5 };
