import type { Component } from "solid-js";
import { createSignal, For, Switch, Match } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "./utilities/vscode";
import "./App.css";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeCheckbox()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
// provideVSCodeDesignSystem().register(allComponents);

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

const LegoList: Component = () => {
  const [getLegos, setLegos] = createSignal({})
  vscode.listenMessage('lego.list.updateLegos', (data: any) => {
    setLegos(
      data.reduce((result: any, item: any, index: number) => {
        if (!result[item.dir]) {
          result[item.dir] = []
        }
        result[item.dir].push({ ...item, id: index })
        return result
      }, {})
    )
  })
  const dragEnd = (event, id) => {
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.dragEnd', data: id });
  }
  return (
    <main>
      <div></div>

      <For each={Object.keys(getLegos())}>{(key) => (
        <div>
          <h3>{key}</h3>
          <section>
            <For each={getLegos()?.[key]}>{(item: any) => (
              <div
                draggable={true}
                onDragEnd={(event) => dragEnd(event, item.id)}
              >{item.name}</div>
            )}</For>
          </section>
        </div>
      )}</For>
    </main>
  );
};

export default LegoEditor;
