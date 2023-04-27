import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('native', xml);

export const highlight = (code: string, opts: { lang: 'native' }) => {
  return hljs.highlight(code, { language: opts.lang }).value;
};
