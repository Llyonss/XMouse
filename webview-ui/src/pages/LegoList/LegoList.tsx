import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import { createSignal, For, Match, Switch, } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../utilities/vscode";
import { DAccordion, DToast, DContextMenu } from '../../components'
import AddLegoDialog from "./AddLegoDialog";
import DeleteDialog from "./DeleteDialog";
import ExportDialog from "./ExportDialog";
import ImportDialog from "./ImportDialog";
import Test from './lego.svg'
import MultiDeleteDialog from "./MultiDeleteDialog";
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());
/**
 * 1，处理出Lego(通过File和Client和Server)
 * 2，渲染出Lego
 * 3，拖拽Lego生成Code
 * 4，编辑新增Lego
 */
type LegoMeta = {
  name: string,
  icon: string,
  group: string,
  tab: string, // UI | 
  path: string, // npm@xxx | code@xxx
  origin: string,
  code: string,
}
type LegoGroup = {
  name: string,
  legos: LegoMeta[]
}

const LegoList: Component = () => {
  const [getState, setState] = createSignal('loading')
  const [legoGroupsStore, setLegoGroups] = createStore<any[]>([])
  let addLegoDialog: any = {};
  let deleteLegoDialog: any = {};
  let importDialog: any = {};
  let exportDialog: any = {};
  let toastRef: any = {};
  let multiDeleteDialog: any = {};
  const addLego = (lego?: any) => {
    addLegoDialog?.open?.().then((item: any) => {
      vscode.postMessage({ command: 'lego.list.add', data: JSON.parse(JSON.stringify(item)) });
    })
  }
  const updateLego = (lego?: any) => {
    addLegoDialog?.open?.(lego, 'update').then((item: any) => {
      vscode.postMessage({ command: 'lego.list.update', data: { old: JSON.parse(JSON.stringify(lego)), new: JSON.parse(JSON.stringify(item)) } });
    })
  }
  const deleteLego = (lego: any) => {
    deleteLegoDialog.open(lego).then(() => {
      vscode.postMessage({ command: 'lego.list.delete', data: JSON.parse(JSON.stringify(lego)) });
    })
  }

  const handleDragStart = (event: any, data: any) => {
    console.log('data.code',data.code)
    event.dataTransfer.setData('text/plain', data.code);
    vscode.postMessage({ command: 'lego.list.drag.start', data: JSON.parse(JSON.stringify(data)) });
  }
  const handleDragEnd = (event: any, data: any) => {
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.drag.end', data: JSON.parse(JSON.stringify(data)) });
  }

  vscode.postMessage({ command: 'lego.list.init' });
  vscode.listenMessage('lego.list.updateLegos', (data: any) => {
    setLegoGroups(Object.values(
      [
        ...data.map((item: any) => ({
          group: item.group,
          name: item.name,
          source: item.source,
          code: item.code,
        }))
      ].reduce((result: any, current: LegoMeta) => {
        if (!result[current.group]) {
          result[current.group] = {
            name: current.group,
            legos: []
          }
        }
        result[current.group].legos.push(current)
        return result;
      }, {})
    ))
    if (legoGroupsStore.length) {
      setState('data')
    } else {
      setState('empty')
    }
  })

  vscode.listenMessage('lego.list.add', (data: any) => {
    addLego()
  })
  vscode.listenMessage('lego.list.import', (data: any) => {
    importDialog.open().then((list: any[]) => {
      vscode.postMessage({ command: 'lego.list.updateList', data: list });
    })
  })
  vscode.listenMessage('lego.list.export', (data: any) => {
    exportDialog.open(legoGroupsStore).then((list: any[]) => {
      navigator.clipboard.writeText(JSON.stringify(list)).then(() => {
        toastRef.open({
          title: '导出成功！',
          description: '导出内容已经复制到剪贴板啦，去粘贴吧!',
          duration: 20000,
        })
      })
    })
  })
  vscode.listenMessage('lego.list.multi-delete', (data: any) => {
    multiDeleteDialog.open(legoGroupsStore).then((deleteList: any[]) => {
      vscode.postMessage({ command: 'lego.list.deleteList', data: JSON.parse(JSON.stringify(deleteList)) });
    })
  })

  return (
    <div style="color:var(--vscode-sideBarSectionHeader-foreground)">
      <DToast ref={toastRef}></DToast>
      <AddLegoDialog ref={addLegoDialog}></AddLegoDialog >
      <DeleteDialog ref={deleteLegoDialog}></DeleteDialog>
      <ImportDialog ref={importDialog}></ImportDialog>
      <ExportDialog ref={exportDialog}></ExportDialog>
      <MultiDeleteDialog ref={multiDeleteDialog}></MultiDeleteDialog>
      <Switch
        fallback={<div></div>}
      >
        <Match when={getState() === 'empty'}>
          <div style="padding:12px 24px">
            <p>感谢你这么好看还订阅咱这插件！</p>
            <p>1. 点击【下方按钮】或【右上方加号】，都可添加组件。</p>
            <p>2. 添加组件后，右键组件，可编辑或删除。</p>
            <p>3. 添加组件后，拖拽组件，可以拖拽到代码中。</p>
            <button data-type="primary" onClick={() => { updateLego() }}>添加组件</button>
          </div>
        </Match>
        <Match when={getState() === 'data'}>
          <DAccordion items={legoGroupsStore}>{(legoGroup: any) => (
            <div style="display:flex;flex-flow:row wrap;gap:16px;padding:16px;background: var(--vscode-dropdown-listBackground);align-items: flex-start;">
              <For each={legoGroup.legos}>{(lego: any) => (
                <DContextMenu items={[
                  { id: 'edit', label: '编辑', onClick: () => { updateLego(lego) } },
                  { id: 'delete', label: '删除', onClick: () => { deleteLego(lego) } },
                ]}>
                  <div
                    draggable={true}
                    onDragStart={(event) => { handleDragStart(event, lego) }}
                    onDragEnd={(event) => { handleDragEnd(event, lego) }}
                  >

                    <div style="cursor: grab;width:48px;height:48px; padding:4px; border: solid 1px var(--vscode-badge-background);background:var(--vscode-badge-background);border-radius: 8px; ">
                      <img src={Test} style="pointer-events: none;background:white;border-radius: 8px;"></img>
                    </div>
                    <div style="width:48px;display:flex;justify-content:center;word-break: break-all;">
                      {lego.name}
                    </div>
                  </div>
                </DContextMenu>
              )}</For>
            </div>
          )}</DAccordion>
        </Match>
      </Switch>
    </div>
  );
};

export default LegoList;
