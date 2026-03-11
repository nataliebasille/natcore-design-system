import prettier from 'prettier/standalone'
import parserHtml from 'prettier/plugins/html'
import parserBabel from 'prettier/plugins/babel'
import parserEstree from 'prettier/plugins/estree'

const parsersConfig = {
  html: {
    parser: 'html',
    plugins: [parserHtml],
  },

  tsx: {
    parser: 'babel-ts',
    plugins: [parserBabel, parserEstree],
  },

  ts: {
    parser: 'babel-ts',
    plugins: [parserBabel, parserEstree],
  },

  jsx: {
    parser: 'babel',
    plugins: [parserBabel, parserEstree],
  },

  js: {
    parser: 'babel',
    plugins: [parserBabel, parserEstree],
  },

  json: {
    parser: 'json',
    plugins: [parserBabel, parserEstree],
  },
} satisfies Record<string, { parser: string; plugins: unknown[] }>

export type SupportedLanguages = keyof typeof parsersConfig

export async function formatCode(code: string, language: SupportedLanguages) {
  try {
    return language in parsersConfig ? await prettier.format(code, parsersConfig[language]) : code
  } catch {
    return code
  }
}
