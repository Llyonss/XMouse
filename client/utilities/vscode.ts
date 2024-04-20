import type { WebviewApi } from 'vscode-webview'

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */
class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined
  private callbacks: any = {}
  private callbackId = 0

  constructor() {
    // Check if the acquireVsCodeApi function exists in the current development
    // context (i.e. VS Code development window or web browser)
    if (typeof acquireVsCodeApi === 'function')
      this.vsCodeApi = acquireVsCodeApi()

    window.addEventListener('message', (event) => {
      const { command, data } = event.data
      const callbacks = Object.values(this.callbacks?.[command] || {})
      callbacks.forEach((callback: any) => callback(data))
    })
  }

  public listenMessage(command: string, callback: Function) {
    if (!this.callbacks[command])
      this.callbacks[command] = {}

    const id = this.callbackId++
    this.callbacks[command][id] = callback

    return () => {
      delete this.callbacks[command][id]
    }
  }

  /**
   * Post a message (i.e. send arbitrary data) to the owner of the webview.
   *
   * @remarks When running webview code inside a web browser, postMessage will instead
   * log the given message to the console.
   *
   * @param message Abitrary data (must be JSON serializable) to send to the extension context.
   */
  public postMessage(message: unknown) {
    if (this.vsCodeApi)
      this.vsCodeApi.postMessage({ command: message.command, data: message.data })
    else
      console.log(message)
  }

  public call(command: string, data: any) {
    return new Promise((resolve, reject) => {
      const eventId = setTimeout(() => { })

      const handler = (event: any) => {
        const response = event.data
        if (response.id === eventId) {
          window.removeEventListener('message', handler)
          response.body.code === 0 ? resolve(response.body.data) : reject(response.body.msg)
        }
      }
      window.addEventListener('message', handler)

      this.vsCodeApi?.postMessage({ id: eventId, command, data })
    })
  }

  /**
   * Get the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, getState will retrieve state
   * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @return The current state or `undefined` if no state has been set.
   */
  public getState(): unknown | undefined {
    if (this.vsCodeApi) {
      return this.vsCodeApi.getState()
    }
    else {
      const state = localStorage.getItem('vscodeState')
      return state ? JSON.parse(state) : undefined
    }
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, setState will set the given
   * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   *
   * @return The new state.
   */
  public setState<T extends unknown | undefined>(newState: T): T {
    if (this.vsCodeApi) {
      return this.vsCodeApi.setState(newState)
    }
    else {
      localStorage.setItem('vscodeState', JSON.stringify(newState))
      return newState
    }
  }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper()
