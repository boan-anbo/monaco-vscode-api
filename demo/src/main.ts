import './style.css'
import * as monaco from 'monaco-editor'
import { createConfiguredEditor, createModelReference } from 'vscode/monaco'
import { registerFileSystemOverlay, HTMLFileSystemProvider } from '@codingame/monaco-vscode-files-service-override'
import * as vscode from 'vscode'
import { ILogService, StandaloneServices, IPreferencesService, IEditorService, IDialogService, getService } from 'vscode/services'
import { ConfirmResult, Parts, isPartVisibile, setPartVisibility } from '@codingame/monaco-vscode-views-service-override'
import { clearStorage, remoteAuthority } from './setup'
import { CustomEditorInput } from './features/customView'
import './features/debugger'
import './features/search'
import { anotherFakeOutputChannel } from './features/output'
import './features/filesystem'
import './features/intellisense'
import './features/notifications'
import './features/terminal'
import '@codingame/monaco-vscode-clojure-default-extension'
import '@codingame/monaco-vscode-coffeescript-default-extension'
import '@codingame/monaco-vscode-cpp-default-extension'
import '@codingame/monaco-vscode-csharp-default-extension'
import '@codingame/monaco-vscode-css-default-extension'
import '@codingame/monaco-vscode-diff-default-extension'
import '@codingame/monaco-vscode-fsharp-default-extension'
import '@codingame/monaco-vscode-go-default-extension'
import '@codingame/monaco-vscode-groovy-default-extension'
import '@codingame/monaco-vscode-html-default-extension'
import '@codingame/monaco-vscode-java-default-extension'
import '@codingame/monaco-vscode-javascript-default-extension'
import '@codingame/monaco-vscode-json-default-extension'
import '@codingame/monaco-vscode-julia-default-extension'
import '@codingame/monaco-vscode-lua-default-extension'
import '@codingame/monaco-vscode-markdown-basics-default-extension'
import '@codingame/monaco-vscode-objective-c-default-extension'
import '@codingame/monaco-vscode-perl-default-extension'
import '@codingame/monaco-vscode-php-default-extension'
import '@codingame/monaco-vscode-powershell-default-extension'
import '@codingame/monaco-vscode-python-default-extension'
import '@codingame/monaco-vscode-r-default-extension'
import '@codingame/monaco-vscode-ruby-default-extension'
import '@codingame/monaco-vscode-rust-default-extension'
import '@codingame/monaco-vscode-scss-default-extension'
import '@codingame/monaco-vscode-shellscript-default-extension'
import '@codingame/monaco-vscode-sql-default-extension'
import '@codingame/monaco-vscode-swift-default-extension'
import '@codingame/monaco-vscode-typescript-basics-default-extension'
import '@codingame/monaco-vscode-vb-default-extension'
import '@codingame/monaco-vscode-xml-default-extension'
import '@codingame/monaco-vscode-yaml-default-extension'

import '@codingame/monaco-vscode-theme-defaults-default-extension'
import '@codingame/monaco-vscode-theme-seti-default-extension'
import '@codingame/monaco-vscode-references-view-default-extension'
import '@codingame/monaco-vscode-search-result-default-extension'
import '@codingame/monaco-vscode-configuration-editing-default-extension'
import '@codingame/monaco-vscode-markdown-math-default-extension'
import '@codingame/monaco-vscode-npm-default-extension'
import '@codingame/monaco-vscode-media-preview-default-extension'
// If there's a remote authority, it imports the features for remote extensions.
if (remoteAuthority != null) {
  import('./features/remoteExtension')
}
// It creates a model reference, which is a representation of an open file.
const modelRef = await createModelReference(monaco.Uri.file('/tmp/test.js'), `// import anotherfile
let variable = 1
function inc () {
  variable++
}

while (variable < 5000) {
  inc()
  console.log('Hello world', variable);
}`)


// It opens two text documents: one for the main document and another in a readonly state.
const [mainDocument] = await Promise.all([
  vscode.workspace.openTextDocument(modelRef.object.textEditorModel!.uri),
  vscode.workspace.openTextDocument(monaco.Uri.file('/tmp/test_readonly.js')) // open the file so vscode sees it's locked
])
await vscode.window.showTextDocument(mainDocument, {
  preview: false
})

// Any change in the main document's content is reflected in the fake output channel.
anotherFakeOutputChannel.replace(mainDocument.getText())
vscode.workspace.onDidChangeTextDocument((e) => {
  if (e.document === mainDocument && e.contentChanges.length > 0) {
    anotherFakeOutputChannel.replace(e.document.getText())
  }
})
// It sets a mock diagnostic error on the model's content.
const diagnostics = vscode.languages.createDiagnosticCollection('demo')
diagnostics.set(modelRef.object.textEditorModel!.uri, [{
  range: new vscode.Range(2, 9, 2, 12),
  severity: vscode.DiagnosticSeverity.Error,
  message: 'This is not a real error, just a demo, don\'t worry',
  source: 'Demo',
  code: 42
}])


// Creates a model reference for user settings and sets up an editor for the same.
const settingsModelReference = await createModelReference(monaco.Uri.from({ scheme: 'user', path: '/settings.json' }), `{
  "workbench.colorTheme": "Default Dark+",
  "workbench.iconTheme": "vs-seti",
  "editor.autoClosingBrackets": "languageDefined",
  "editor.autoClosingQuotes": "languageDefined",
  "editor.scrollBeyondLastLine": true,
  "editor.mouseWheelZoom": true,
  "editor.wordBasedSuggestions": false,
  "editor.acceptSuggestionOnEnter": "on",
  "editor.foldingHighlight": false,
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": false,
  "editor.fontSize": 12,
  "audioCues.lineHasError": "on",
  "audioCues.onDebugBreak": "on",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "debug.toolBarLocation": "docked",
  "editor.experimental.asyncTokenization": true,
  "terminal.integrated.tabs.title": "\${sequence}",
  "typescript.tsserver.log": "normal"
}`)
const settingEditor = createConfiguredEditor(document.getElementById('settings-editor')!, {
  model: settingsModelReference.object.textEditorModel,
  automaticLayout: true
})

// Adds a custom action to the settings editor which pops up an info dialog when executed.
settingEditor.addAction({
  id: 'custom-action',
  async run () {
    void (await getService(IDialogService)).info('Custom action executed!')
  },
  label: 'Custom action visible in the command palette',
  keybindings: [
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK
  ],
  contextMenuGroupId: 'custom'
})

// Creates a model reference for user keybindings and sets up an editor for the same.
const keybindingsModelReference = await createModelReference(monaco.Uri.from({ scheme: 'user', path: '/keybindings.json' }), `[
  {
    "key": "ctrl+d",
    "command": "editor.action.deleteLines",
    "when": "editorTextFocus"
  }
]`)
createConfiguredEditor(document.getElementById('keybindings-editor')!, {
  model: keybindingsModelReference.object.textEditorModel,
  automaticLayout: true
})


// Listens for a click event to select a directory using the native file picker.
document.querySelector('#filesystem')!.addEventListener('click', async () => {
  const dirHandle = await window.showDirectoryPicker()

  const htmlFileSystemProvider = new HTMLFileSystemProvider(undefined, 'unused', StandaloneServices.get(ILogService))
  await htmlFileSystemProvider.registerDirectoryHandle(dirHandle)
  registerFileSystemOverlay(1, htmlFileSystemProvider)

  vscode.workspace.updateWorkspaceFolders(0, 0, {
    uri: vscode.Uri.file(dirHandle.name)
  })
})

// Initiates a debugging session on a button click.
document.querySelector('#run')!.addEventListener('click', () => {
  void vscode.debug.startDebugging(undefined, {
    name: 'Test',
    request: 'attach',
    type: 'javascript'
  })
})

// Opens the user settings UI on a button click and scrolls to the top of the window.
document.querySelector('#settingsui')!.addEventListener('click', async () => {
  await StandaloneServices.get(IPreferencesService).openUserSettings()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})


// Opens the keybindings settings UI on a button click and scrolls to the top of the window.

document.querySelector('#keybindingsui')!.addEventListener('click', async () => {
  await StandaloneServices.get(IPreferencesService).openGlobalKeybindingSettings(false)
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Demonstrates a custom editor panel. The title of this editor pane toggles between two strings at a regular interval.

document.querySelector('#customEditorPanel')!.addEventListener('click', async () => {
  const input = new CustomEditorInput({
    async confirm () {
      const { confirmed } = await StandaloneServices.get(IDialogService).confirm({
        message: 'Are you sure you want to close this INCREDIBLE editor pane?'
      })
      return confirmed ? ConfirmResult.DONT_SAVE : ConfirmResult.CANCEL
    },
    showConfirm () {
      return true
    }
  })
  let toggle = false
  const interval = window.setInterval(() => {
    const title = toggle ? 'Awesome editor pane' : 'Incredible editor pane'
    input.setTitle(title)
    input.setName(title)
    input.setDescription(title)
    toggle = !toggle
  }, 1000)
  input.onWillDispose(() => {
    window.clearInterval(interval)
  })

  await StandaloneServices.get(IEditorService).openEditor(input, {
    pinned: true
  })
})

// Clears the browser's storage when a button is clicked.

document.querySelector('#clearStorage')!.addEventListener('click', async () => {
  await clearStorage()
})


// Toggles the visibility of the panel part on a button click.
document.querySelector('#togglePanel')!.addEventListener('click', async () => {
  setPartVisibility(Parts.PANEL_PART, !isPartVisibile(Parts.PANEL_PART))
})


// Toggles the visibility of the auxiliary bar on a button click.
document.querySelector('#toggleAuxiliary')!.addEventListener('click', async () => {
  setPartVisibility(Parts.AUXILIARYBAR_PART, !isPartVisibile(Parts.AUXILIARYBAR_PART))
})

// Retrieves the locale from the URL and sets it in a select dropdown. Changes in the dropdown will update the URL's locale parameter.
const locale = new URLSearchParams(window.location.search).get('locale') ?? ''
const select: HTMLSelectElement = document.querySelector('#localeSelect')!
select.value = locale
select.addEventListener('change', () => {
  const url = new URL(window.location.href)
  if (select.value !== '') {
    url.searchParams.set('locale', select.value)
  } else {
    url.searchParams.delete('locale')
  }
  window.location.href = url.toString()
})
