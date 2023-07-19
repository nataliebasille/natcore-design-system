import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash";
import tsLang from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("native", xml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("typescript", tsLang);

export type SupportedLanguages = "native" | "bash" | "typescript";
export const highlight = (code: string, opts: { lang: SupportedLanguages }) => {
  return hljs.highlight(code, { language: opts.lang }).value;
};
