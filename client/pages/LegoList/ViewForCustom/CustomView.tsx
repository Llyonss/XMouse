import type { Component } from "solid-js";
import { createSignal, For, Match, Switch, } from 'solid-js'
import { vscode } from "../../../utilities/vscode";
import { DAccordion, DToast, DContextMenu, } from '../../../components'

import { createStore } from "solid-js/store";
import CustomViewPlugin from "./CustomViewPlugin";
import CustomViewItem from "./CustomViewItem";

type LegoMeta = {
    name: string,
    icon: string,
    group: string,
    tab: string, // UI | 
    path: string, // npm@xxx | code@xxx
    origin: string,
    code: string,
}
function handleDrag(event: any, type: any, data: any) {
    event.dataTransfer.setData('text/plain', data.code);
    vscode.postMessage({ command: `lego.list.drag.${type}`, data: JSON.parse(JSON.stringify(data)) });
}

const LegoList: Component = (props: any) => {
    // 初始化数据
    const [legoGroupsStore, setLegoGroups] = createStore<any[]>([])
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
    })
    const slots: any = {
        dialog: [],
        operate: [],
        itemMenu: [],
        emptyButton: [],
    }

    CustomViewPlugin.map(install => { install(slots, legoGroupsStore) })
    return (<>
        {/* <section>{slots.operate}</section> */}
        <Switch fallback={<div></div>}>
            <Match when={legoGroupsStore.length === 0}>
                <div style="padding:12px 24px">
                    <p>感谢你这么好看还订阅咱这插件！</p>
                    <p>1. 点击【下方按钮】或【右上方加号】，都可添加组件。</p>
                    <p>2. 添加组件后，右键组件，可编辑或删除。</p>
                    <p>3. 添加组件后，拖拽组件，可以拖拽到代码中。</p>
                    {slots.emptyButton}
                </div>
            </Match>
            <Match when={legoGroupsStore.length > 0}>
                <DAccordion items={legoGroupsStore}>{(legoGroup: any) => (
                    <div style="display:flex;flex-flow:row wrap;gap:16px;padding:16px;background: var(--vscode-dropdown-listBackground);align-items: flex-start;">
                        <For each={legoGroup.legos}>{(lego: any) => (
                            <DContextMenu
                                items={slots.itemMenu.map((cb: any) => cb(lego))}
                            >
                                <CustomViewItem
                                    name={lego.name}
                                    draggable={true}
                                    onDragStart={(event: any) => { handleDrag(event, 'start', lego) }}
                                    onDragEnd={(event: any) => { handleDrag(event, 'end', lego) }}
                                ></CustomViewItem>
                            </DContextMenu>
                        )}</For>
                    </div>
                )}</DAccordion>
            </Match>
        </Switch>
        {slots.dialog}
    </>);
};

export default LegoList;
