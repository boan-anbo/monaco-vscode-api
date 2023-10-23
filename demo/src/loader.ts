
/**
 * Extracts the 'locale' parameter from the current window's URL query string.
 * @example
 * // Given the URL: 'https://example.com?locale=es'
 * // `locale` will be 'es'
 */
const locale = new URLSearchParams(window.location.search).get('locale')

/**
 * Represents a mapping between locale strings and their respective loader functions.
 * Each function, when called, dynamically imports a specific Monaco-VSCode language pack module.
 */
const localeLoader: Partial<Record<string, () => Promise<void>>> = {
  cs: async () => { await import('@codingame/monaco-vscode-language-pack-cs') },
  de: async () => { await import('@codingame/monaco-vscode-language-pack-de') },
  es: async () => { await import('@codingame/monaco-vscode-language-pack-es') },
  fr: async () => { await import('@codingame/monaco-vscode-language-pack-fr') },
  it: async () => { await import('@codingame/monaco-vscode-language-pack-it') },
  ja: async () => { await import('@codingame/monaco-vscode-language-pack-ja') },
  ko: async () => { await import('@codingame/monaco-vscode-language-pack-ko') },
  pl: async () => { await import('@codingame/monaco-vscode-language-pack-pl') },
  'pt-br': async () => { await import('@codingame/monaco-vscode-language-pack-pt-br') },
  'qps-ploc': async () => { await import('@codingame/monaco-vscode-language-pack-qps-ploc') },
  ru: async () => { await import('@codingame/monaco-vscode-language-pack-ru') },
  tr: async () => { await import('@codingame/monaco-vscode-language-pack-tr') },
  'zh-hans': async () => { await import('@codingame/monaco-vscode-language-pack-zh-hans') },
  'zh-hant': async () => { await import('@codingame/monaco-vscode-language-pack-zh-hant') }
}

/**
 * If a valid locale exists, it triggers the dynamic loading of the corresponding Monaco-VSCode language pack.
 */
if (locale != null) {
  const loader = localeLoader[locale]
  if (loader != null) {
    await loader()
  } else {
    console.error(`Unknown locale ${locale}`)
  }
}
/**
 * Imports the main module, initiating the core logic or application startup.
 */
import('./main')
// Ensures that the module does not unintentionally expose any values.
export {}
