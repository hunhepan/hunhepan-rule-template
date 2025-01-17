const extractHash = (text: string) => {
  // bt hash
  const re = /([a-zA-Z0-9]{40})/i;
  const found = text.match(re);
  if (found) {
    return found[0];
  }
  return null;
};

const completeHash = (hash: string) => {
  if (!hash.startsWith('magnet:?xt=urn:btih:')) {
    return 'magnet:?xt=urn:btih:' + hash;
  }

  return hash;
};

export { extractHash, completeHash };
