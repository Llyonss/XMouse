import type { Component } from "solid-js";
import { createSignal, For, Match, Switch } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../utilities/vscode";
import LegoListDirTree from './LegoListDirTree';
import { TreeView } from '@ark-ui/solid'
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());


const LegoList: Component = () => {
  vscode.postMessage({ command: 'lego.list.init' });
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

  const dragEnd = (event, data) => {
    if (!data?.id) {
      return;
    }
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.dragEnd', data });
  }
  return (
    <div >
      <LegoListDirTree
        data={getDir()}
        onActive={(files: any) => { setLegos(files); console.log('xxxxxx', files) }}
        node={(data) => (
          <span
            draggable={true}
            onDragEnd={(event) => { dragEnd(event, data) }}
          >
            {data.type === 'export' ? '⚛' : ""}
            {data.type === 'dir' ? '📂' : ""}
            {data.type === 'file' ? '📄' : ""}
            {data?.name}
          </span>
        )} />
    </div>
  );
};

export default LegoList;
