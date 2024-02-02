import type { Component } from "solid-js";
import { createSignal, For } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../utilities/vscode";
import "./App.css";
import LegoListDirTree from './LegoListDirTree';
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());


const LegoList: Component = () => {
  const [getDir, setDir] = createSignal({})
  const [getLegos, setLegos] = createSignal([])
  vscode.listenMessage('lego.list.updateLegos', (data: any) => {
    // setLegos(
    //   data.reduce((result: any, item: any, index: number) => {
    //     if (!result[item.relativePath]) {
    //       result[item.relativePath] = []
    //     }
    //     result[item.relativePath].push({ ...item, id: index })
    //     return result
    //   }, {})
    // )
    setDir(
      data.reduce((dirTree: any, item: any, index: number) => {
        const dirList = item.relativePath.split('\\')
        const cursor = dirList.reduce((dir: any, item: any) => {
          if (!dir.dirMap[item]) {
            dir.dirMap[item] = { dirMap: {}, xmfiles: [] };
          }

          return dir.dirMap[item]
        }, dirTree)
        cursor.name = item.relativePath
        cursor.xmfiles.push(item)
        return dirTree;
      }, { dirMap: {}, xmfiles: [], name: 'root' })
    )
    console.log('teetstssts', getDir())
  })
  const dragEnd = (event, id) => {
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.dragEnd', data: id });
  }
  return (
    <div style="display:flex;flex-flow:row nowrap;">
      <div style="flex:1;padding:8px;max-height:90vh;overflow-y:auto;">
        <LegoListDirTree data={getDir()} onActive={(files: any) => { setLegos(files); console.log('xxxxxx', files) }}></LegoListDirTree>
      </div>
      <div style="flex:1;padding:8px;max-height:90vh;overflow-y:auto;">
        <For each={getLegos()}>{(item: any) => (
          <div
            draggable={true}
            onDragEnd={(event) => dragEnd(event, item.id)}
          >{item.name}</div>
        )}</For>
      </div>

      {/* <For each={Object.keys(getLegos())}>{(key) => (
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
      )}</For> */}
    </div>
  );
};

export default LegoList;
