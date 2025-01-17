export const PCUA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';



// replaceToEm 将其它标签替换为 em 标签
const replaceToEm = (text: string): string => {
  // Match any HTML tag (opening or closing) that isn't already an em tag
  return text.replace(/<\/?(?!em\b)[a-z0-9]+(?:\s+[^>]*)?>/gi, (match) => {
    // Check if it's a closing tag by looking for '/'
    const isClosingTag = match.startsWith('</');

    // Return appropriate em tag
    return isClosingTag ? '</em>' : '<em>';
  });
};

function convertHtmlToText(html: string) {
  // 先移除所有的 script 和 style 标签及其内容
  let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  text = text.replace(/<[^>]+>/g, '\n');
  text = text.replace(/\n\s*\n/g, '\n');

  // 去除开头和结尾的空白字符
  text = text.trim();

  return text;
}

const isJson = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
};
export {  replaceToEm, convertHtmlToText, isJson };
