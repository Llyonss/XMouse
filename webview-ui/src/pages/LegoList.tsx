import type { Component } from "solid-js";
import { createSignal, For, Match, Switch } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../utilities/vscode";
import "./App.css";
import LegoListDirTree from './LegoListDirTree';
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());


const LegoList: Component = () => {
  vscode.postMessage({ command: 'lego.list.init'});
  const [getDir, setDir] = createSignal({})
  const [getLegos, setLegos] = createSignal([])
  vscode.listenMessage('lego.list.updateLegos', (data: any) => {
    const tree = data.reduce((dirTree: any, item: any, index: number) => {
      const dirList = item.relativePath.split('\\')
      const cursor = dirList.reduce((dir: any, item: any) => {
        if (!dir.dirMap[item]) {
          dir.dirMap[item] = { dirMap: {}, type: "dir" };
        }

        return dir.dirMap[item]
      }, dirTree)
      cursor.name = item.relativePath
      if (!cursor.dirMap[item.name]) {
        cursor.dirMap[item.name] = { name: item.name, dirMap: {}, type: "file", id: index };
      }
      cursor.dirMap[item.name].dirMap = item?.exports?.reduce((result, item) => {
        result[item.name] = { name: item.name, type: "export", id: index }
        return result
      }, {}) || {}
      return dirTree;
    }, { dirMap: {}, name: 'root' })

    setDir(tree)
  })
  const dragEnd = (event, id, item) => {
    if (!id) {
      return;
    }
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.dragEnd', data: { id, item } });
  }
  return (
    <div style="display:flex;flex-flow:row nowrap;">
      {/* <div style="flex:1;padding:8px;max-height:90vh;overflow-y:auto;"> */}
      <LegoListDirTree
        data={getDir()}
        onActive={(files: any) => { setLegos(files); console.log('xxxxxx', files) }}
        node={(data) => (

          <Switch fallback={""}>
            <Match when={data.type === 'export'}><div draggable={true} onDragEnd={(event) => { dragEnd(event, data.id, data?.name) }}>#{data?.name}</div></Match>
            <Match when={data.type === 'dir'}><div class="codicon-tree-item-expanded">={data?.name}</div></Match>
            <Match when={data.type === 'file'}><div >{data?.name}</div></Match>
          </Switch>

        )} />
    </div>
  );
};

export default LegoList;
