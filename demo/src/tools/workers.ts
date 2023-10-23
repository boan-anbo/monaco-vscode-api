import type {WorkerConfig} from '@codingame/monaco-vscode-extensions-service-override'

/**
 * * A worker class to handle cross-origin scripts.
 *  * Cross-origin workers don't work by default in browsers.
 *  * The workaround employed by vscode is to initiate a worker on a blob URL containing
 *  * a concise script calling 'importScripts', as `importScripts` can load the code inside a blob worker.
 */
class CrossOriginWorker extends Worker {
    /**
     * Creates a new instance of the `CrossOriginWorker` class.
     * @param url - The URL of the worker script.
     * @param options - An optional object containing configuration properties for the worker.
     */
    constructor(url: string | URL, options: WorkerOptions = {}) {
        const fullUrl = new URL(url, window.location.href).href
        const js = options.type === 'module' ? `import '${fullUrl}';` : `importScripts('${fullUrl}');`
        const blob = new Blob([js], {type: 'application/javascript'})
        super(URL.createObjectURL(blob), options)
    }
}

/**
 * A mock worker class used to extract URL and options from a Vite worker.
 */
class FakeWorker {
    constructor(public url: string | URL, public options?: WorkerOptions) {
    }
}

/**
 * The only way to load workers in vite is using the `?worker` import which return a worker constructor
 * We need to hack it to get the generated code and either transform it to a CrossOrigin worker for regular workers
 * or extract the url and options for the extensionHost workerA
 *
 *
 *  @param viteWorker - The Vite worker to be transformed.
 * @returns A new worker instance that supports cross-origin functionality.
 */
export function toCrossOriginWorker(viteWorker: new () => Worker): new () => Worker {
    // eslint-disable-next-line no-new-func
    return new Function('Worker', `return ${viteWorker.toString()}`)(CrossOriginWorker)
}

/**
 * Transforms a Vite worker to a worker configuration object.
 * This configuration can then be used to start the worker.
 *
 * @param viteWorker - The Vite worker to be transformed.
 * @returns The worker configuration.
 */
export function toWorkerConfig(viteWorker: new () => Worker): WorkerConfig {
    // eslint-disable-next-line no-new-func
    const fakeWorker: FakeWorker = new Function('Worker', `return ${viteWorker.toString()}`)(FakeWorker)()
    return {
        url: fakeWorker.url.toString(),
        options: fakeWorker.options
    }
}
