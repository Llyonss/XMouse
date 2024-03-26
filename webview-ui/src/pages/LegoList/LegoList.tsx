import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import { createSignal, For, Match, Index, Switch, createEffect } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../utilities/vscode";
import LegoListDirTree from './LegoListDirTree';
import { TreeView, Accordion, SegmentGroup, Layout, Dialog } from '../../components'
import AddLegoDialog from "./AddLegoDialog";
import DeleteDialog from "./DeleteDialog";
import Test from './lego.svg'
import ContextMenu from './ContextMenu'
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
const legoGroupTransfer = (legoList: LegoMeta[]): LegoGroup[] => {
  return Object.values(legoList.reduce((result: any, current: LegoMeta) => {
    if (!result[current.group]) {
      result[current.group] = {
        name: current.group,
        legos: []
      }
    }
    result[current.group].legos.push(current)
    return result;
  }, {}))
}

const legoTransfer = (xmfiles: any[]) => {
  xmfiles.reduce(() => {

  })
}

const LegoList: Component = () => {
  vscode.postMessage({ command: 'lego.list.init' });
  const [getState, setState] = createSignal('loading')
  const [getDir, setDir] = createSignal({})
  const [getLegos, setLegos] = createSignal([])
  const [getLegoGroups, setLegoGroups] = createStore<any[]>([])
  let addLegoDialog: any = {};
  let deleteLegoDialog: any = {};
  vscode.listenMessage('lego.list.updateLegos', (data: any) => {
    // const tree = data.reduce((dirTree: any, item: any, index: number) => {
    //   const dirList = item.relativePath.split('\\')
    //   const cursor = dirList.reduce((dir: any, item: any) => {
    //     if (!dir.dirMap[item]) {
    //       dir.dirMap[item] = { dirMap: {}, type: "dir" };
    //     }

    //     return dir.dirMap[item]
    //   }, dirTree)
    //   cursor.name = item.relativePath
    //   if (!cursor.dirMap[item.name]) {
    //     cursor.dirMap[item.name] = { name: item.name, dirMap: {}, type: "file", id: index };
    //   }
    //   cursor.dirMap[item.name].dirMap = item?.exports?.reduce((result, item) => {
    //     result[item.name] = { name: item.name, type: "export", id: index }
    //     return result
    //   }, {}) || {}
    //   return dirTree;
    // }, { dirMap: {}, name: 'root' })
    // setDir(tree)

    console.log('data', data)
    setLegoGroups(
      legoGroupTransfer([
        // {
        //   group: '组1',
        //   name: 'ElTable',
        //   icon: '表格',
        //   source: 'element-ui',
        //   code: '<ElTable></ElTable>'
        // },
        ...data.map((item: any) => ({
          id: item.id,
          group: item.group,
          name: item.name,
          source: item.source,
          code: item.code,
        }))
      ])
    );
    if (getLegoGroups.length) {
      setState('data')
    } else {
      setState('empty')
    }
  })
  const updateLego = (lego?: any) => {
    addLegoDialog?.open?.(lego).then((item) => {
      item.id = lego?.id || Date.now().toString(36) + Math.random().toString(36);
      vscode.postMessage({ command: 'lego.list.update', data: item });
      const groupIndex = getLegoGroups.findIndex((group) => group.name === item.group)
      const isAddGroup = groupIndex === -1;
      if (isAddGroup) {
        setLegoGroups([...getLegoGroups, { name: item.group, legos: [item] }])
      }

      const isUpdateGroup = groupIndex !== -1;
      if (isUpdateGroup) {
        const legoIndex = getLegoGroups[groupIndex].legos.findIndex(({ id }: any) => lego.id === id)
        const isAdd = legoIndex === -1
        if (isAdd) {
          setLegoGroups(groupIndex, 'legos', (value: any) => {
            return [...value, item]
          })
        }

        const isUpdate = legoIndex !== -1
        if (isUpdate) {
          setLegoGroups(groupIndex, 'legos', legoIndex, item)
        }

        const isDelete = legoIndex !== -1 && ['', null, undefined].includes(lego.name);
        if (isDelete) {
          setLegoGroups(groupIndex, 'legos', (legos: any[]) => {
            return legos.splice(legoIndex, 1)
          })
        }
      }

      if (getLegoGroups.length) {
        setState('data')
      } else {
        setState('empty')
      }
    })
  }
  vscode.listenMessage('lego.list.add', (data: any) => {
    updateLego()
  })
  const handleDragStart = (event, data) => {
    event.dataTransfer.setData('text/plain', JSON.parse(JSON.stringify(data.code)));
    vscode.postMessage({ command: 'lego.list.drag.start', data: JSON.parse(JSON.stringify(data)) });
  }
  const handleDragEnd = (event, data) => {
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.drag.end', data: JSON.parse(JSON.stringify(data)) });
  }


  const [checked, setChecked] = createSignal(false)
  return (
    <div style="color:var(--vscode-sideBarSectionHeader-foreground)">
      <AddLegoDialog ref={addLegoDialog}></AddLegoDialog >
      <DeleteDialog ref={deleteLegoDialog}></DeleteDialog>

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
          <Accordion.Root value={[getLegoGroups?.[0]?.name]} multiple collapsible>
            <For each={getLegoGroups}>{(legoGroup: any) => (
              <Accordion.Item value={legoGroup.name}>
                <Accordion.ItemTrigger>
                  <Accordion.ItemIndicator style="display: flex;align-items: center;justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down "><path d="m6 9 6 6 6-6"></path></svg>
                  </Accordion.ItemIndicator>
                  {legoGroup.name}
                </Accordion.ItemTrigger>
                <Accordion.ItemContent >
                  <div style="display:flex;flex-flow:row wrap;gap:16px;padding:16px;background: var(--vscode-dropdown-listBackground);">
                    <For each={legoGroup.legos}>{(lego: any) => (
                      <div
                        draggable={true}
                        onDragStart={(event) => { handleDragStart(event, lego) }}
                        onDragEnd={(event) => { handleDragEnd(event, lego) }}
                      >
                        <ContextMenu items={[
                          { id: 'edit', label: '编辑', onClick: () => { updateLego(lego) } },
                          {
                            id: 'delete', label: '删除', onClick: () => {
                              deleteLegoDialog.open(lego).then(() => {
                                vscode.postMessage({ command: 'lego.list.update', data: { id: lego.id } });
                                const groupIndex = getLegoGroups.findIndex((group) => group.name === lego.group)
                                const legoIndex = getLegoGroups[groupIndex].legos.findIndex(({ id }: any) => lego.id === id)
                                setLegoGroups(groupIndex, 'legos', (legos: any[]) => {
                                  return legos.splice(legoIndex, 1)
                                })
                              })
                            }
                          },
                        ]}>
                          <div style="cursor: grab;width:40px;height:40px; padding:4px; border: solid 1px var(--vscode-badge-background);background:var(--vscode-badge-background);border-radius: 8px; ">
                            <img src={Test} style="pointer-events: none;background:white;border-radius: 8px;"></img>
                          </div>

                          <div style="width:48px;display:flex;justify-content:center;">
                            {lego.name}
                          </div>
                        </ContextMenu>
                      </div>
                    )}</For>
                  </div>
                </Accordion.ItemContent>
              </Accordion.Item>
            )}</For>
          </Accordion.Root>
        </Match>
      </Switch>
      {/* </Layout.Main> */}
      {/* </Layout.Root> */}
    </div>
  );
};

export default LegoList;
