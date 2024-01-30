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

  vscode.listenMessage('lego.list.update', (data: any) => {
    setLegos(
      data.reduce((result: any, item: any) => {
        if (!result[item.dir]) {
          result[item.dir] = []
        }
        result[item.dir].push(item)
        return result
      }, {})
    )
  })

  return (
    <main>
      <h1>Hello world!</h1>
      <For each={Object.keys(getLegos())}>{(key) => (
        <div>
          <h3>{key}</h3>
          <section>
            <For each={getLegos()?.[key]}>{(item: any) => (
              <div>{item.name}</div>
            )}</For>
          </section>
        </div>
      )}</For>
      <vscode-button onClick={handleHowdyClick}>Howdy!</vscode-button>
    </main>
  );
};

export default App;
