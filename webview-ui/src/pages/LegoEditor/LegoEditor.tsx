import type { Component } from "solid-js";
import { createSignal, For, Switch, Match } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../utilities/vscode";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());


const LegoEditor: Component = () => {
  const [getLego, setLego] = createSignal({})
  vscode.listenMessage('lego.editor.updateLego', (data: any) => {
    console.log('datadatadata', data)
    setLego(data)
  })

  const handleChange = (name, value, event) => {
    console.log(name, value, event)
    vscode.postMessage({
      command: 'lego.editor.propChange',
      data: {
        name, value
      }
    });
  }
  return (
    <main style="display:flex;flex-flow:column;align-items: stretch;">
      {getLego().name}

      
      <For each={getLego()?.attr}>{(prop: any) => (
        <Switch fallback={<p>is between 5 and 10</p>}>
          <Match when={prop.type === 'number'}>
            <vscode-text-field
              placeholder="Placeholder Text"
              onChange={(event) => handleChange(prop.name, event.target.value)}
            >
              {prop.name}
            </vscode-text-field>
          </Match>
          <Match when={prop.type === 'string'}>
            <vscode-text-area
              value={prop.value}
              resize="vertical"
              style="width:100%;"
              onChange={(event) => handleChange(prop.name, event.target.value)}
            >
              {prop.name}
            </vscode-text-area>
          </Match>
          <Match when={prop.type === 'boolean'}>
            <vscode-radio
              checked={prop.value}
              onChange={(event) => handleChange(prop.name, event.target.checked)}
            > {prop.name}</vscode-radio>
          </Match>
          <Match when={prop.type === 'enum '}>
            <p>enum {prop.type}</p>
          </Match>
        </Switch>
      )}</For>
    </main>
  )
}

export default LegoEditor;
