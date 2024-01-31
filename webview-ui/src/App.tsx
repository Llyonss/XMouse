import type { Component } from "solid-js";
import { createSignal, For } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { vscode } from "./utilities/vscode";
import "./App.css";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(vsCodeButton());

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

const App: Component = () => {
  const [getLegos, setLegos] = createSignal({})
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      data: "Hey there partner! 🤠",
    });
  }

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
    event.dataTransfer.setData('text/plain', ' ');
    vscode.postMessage({ command: 'lego.list.dragEnd', data: id });
  }
  return (
    <main>
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

export default App;
