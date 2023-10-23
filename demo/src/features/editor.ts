import { IResolvedTextEditorModel, IReference, OpenEditor } from '@codingame/monaco-vscode-views-service-override'
import * as monaco from 'monaco-editor'
import { createConfiguredEditor } from 'vscode/monaco'

/**
 * Represents the currently active editor and its associated model reference.
 */
let currentEditor: ({
  modelRef: IReference<IResolvedTextEditorModel>
  editor: monaco.editor.IStandaloneCodeEditor
} & monaco.IDisposable) | null = null

/**
 * Opens a new code editor overlayed on the current page.
 * If an editor is already open, it will be closed before opening the new one.
 *
 * @param modelRef - The text editor model reference used to configure the editor.
 * @returns The opened Monaco code editor instance.
 */
export const openNewCodeEditor: OpenEditor = async (modelRef) => {
  // Dispose current editor if it exists.
  if (currentEditor != null) {
    currentEditor.dispose()
    currentEditor = null
  }
  // Create an overlay container for the editor.
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  container.style.top = container.style.bottom = container.style.left = container.style.right = '0'
  container.style.cursor = 'pointer'

  // Create an element for the editor.
  const editorElem = document.createElement('div')
  editorElem.style.position = 'absolute'
  editorElem.style.top = editorElem.style.bottom = editorElem.style.left = editorElem.style.right = '0'
  editorElem.style.margin = 'auto'
  editorElem.style.width = '80%'
  editorElem.style.height = '80%'

  container.appendChild(editorElem)

  document.body.appendChild(container)
  try {
    // Configure and instantiate the editor.
    const editor = createConfiguredEditor(
      editorElem,
      {
        model: modelRef.object.textEditorModel,
        readOnly: true,
        automaticLayout: true
      }
    )
    // Save current editor and associated actions.
    currentEditor = {
      dispose: () => {
        editor.dispose()
        modelRef.dispose()
        document.body.removeChild(container)
        currentEditor = null
      },
      modelRef,
      editor
    }

    // Add event listeners to handle editor and overlay interactions.
    editor.onDidBlurEditorWidget(() => {
      currentEditor?.dispose()
    })
    container.addEventListener('mousedown', (event) => {
      if (event.target !== container) {
        return
      }

      currentEditor?.dispose()
    })

    return editor
  } catch (error) {
    document.body.removeChild(container)
    currentEditor = null
    throw error
  }
}
