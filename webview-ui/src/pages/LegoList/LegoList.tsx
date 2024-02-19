import type { Component } from "solid-js";
import { createSignal, For, Match, Index } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../utilities/vscode";
import LegoListDirTree from './LegoListDirTree';
import { TreeView, Accordion, Switch, SegmentGroup, Layout, Dialog } from '../../components'
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
  xmfiles.reduce(()=>{

  })
}

const LegoList: Component = () => {
  vscode.postMessage({ command: 'lego.list.init' });
  const [getDir, setDir] = createSignal({})
  const [getLegos, setLegos] = createSignal([])
  const [getLegoGroups, setLegoGroups] = createSignal<any[]>([])


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
    // setDir(tree)
    setLegoGroups(
      legoGroupTransfer([
        {
          group: '组1',
          name: '表格',
          icon: 'TT',
        },
        {
          group: '组1',
          name: '单选',
          icon: 'X',
        },
        {
          group: '组2',
          name: '复选',
          icon: 'C',
        },
        ...data.map((item: any) => ({
          group: '未分类',
          name: item.name,
          icon: item.type,
        }))
      ])
    );
  })

  const handleDragEnd = (event, data) => {
    if (!data?.id) {
      return;
    }
    event.dataTransfer.setData('text/plain', '');
    vscode.postMessage({ command: 'lego.list.dragEnd', data });
  }


  const [checked, setChecked] = createSignal(false)
  return (
    <div >
      {/* <LegoListDirTree
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
        )} /> */}
      <Layout.Root layout="document">
        <Layout.Head>
          UI库，函数库，代码片段，设计模式
          {/* <Switch.Root checked={checked()} onCheckedChange={(e) => setChecked(e.checked)}>
            <Switch.Control >
              <Switch.Thumb />
            </Switch.Control >
            <Switch.Label>编辑模式</Switch.Label>
          </Switch.Root> */}
          <button>编辑模式</button>
        </Layout.Head>

        <Layout.Aside>
          <SegmentGroup.Root>
            {/* <SegmentGroup.Indicator /> */}
            <For each={getLegoGroups()}>{(legoGroup: any) => (
              <SegmentGroup.Item value={legoGroup.name}>
                <SegmentGroup.ItemText>{legoGroup.name}</SegmentGroup.ItemText>
                <SegmentGroup.ItemControl />
              </SegmentGroup.Item>
            )}</For>
          </SegmentGroup.Root>
        </Layout.Aside>

        <Layout.Main>
          <Accordion.Root value={[getLegoGroups()?.[0]?.name]} multiple>
            <For each={getLegoGroups()}>{(legoGroup: any) => (
              <Accordion.Item value={legoGroup.name}>
                <Accordion.ItemTrigger>
                  <Accordion.ItemIndicator>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down "><path d="m6 9 6 6 6-6"></path></svg>
                  </Accordion.ItemIndicator>
                  {legoGroup.name}
                </Accordion.ItemTrigger>
                <Accordion.ItemContent >
                  <div style="display:flex;flex-flow:row wrap;gap:4px">
                    <For each={legoGroup.legos}>{(lego: any) => (
                      <div
                        draggable={true}
                        onDragEnd={(event) => { handleDragEnd(event, lego) }}
                      >
                        <div style="width:48px;height:48px;border:solid 1px white">{lego.icon}</div>
                        <div>{lego.name}</div>
                      </div>
                    )}</For>
                  </div>
                </Accordion.ItemContent>
              </Accordion.Item>
            )}</For>
          </Accordion.Root>
        </Layout.Main>
      </Layout.Root>

      {/* <button onClick={() => setIsOpen(true)}>Open Dialog</button> */}
      {/* <Dialog.Root open={isOpen()} onOpenChange={() => setIsOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Title>Dialog Title</Dialog.Title>
              <Dialog.Description>Dialog Description</Dialog.Description>
              <Dialog.CloseTrigger>Close</Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root> */}
    </div>
  );
};

export default LegoList;
