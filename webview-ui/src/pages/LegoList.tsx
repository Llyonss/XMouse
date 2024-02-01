import type { Component } from "solid-js";
import { createSignal, For } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../utilities/vscode";
import "./App.css";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());


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

export default LegoList;
