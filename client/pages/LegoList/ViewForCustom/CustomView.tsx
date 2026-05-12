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
const escapeHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function handleDrag(event: any, type: any, data: any) {
    event.dataTransfer.setData('text/plain', data.code);
    vscode.postMessage({ command: `lego.list.drag.${type}`, data: JSON.parse(JSON.stringify(data)) });

    if (type === 'start') {
        const preview = document.createElement('div');
        preview.style.cssText = `
            position:fixed;top:-9999px;left:-9999px;
            padding:10px 14px;
            background:var(--vscode-editor-background);
            border:1px solid var(--vscode-focusBorder);
            border-radius:8px;
            box-shadow:0 6px 20px rgba(0,0,0,0.35);
            font-family:var(--vscode-font-family);
            font-size:12px;
            color:var(--vscode-foreground);
            max-width:240px;
            pointer-events:none;
        `;
        const sourceInfo = data.source?.from
            ? `<div style="font-size:10px;color:var(--vscode-textLink-foreground);margin-bottom:6px;"><i class="fa fa-cube" style="margin-right:4px;"></i>${escapeHtml(data.source.from)}</div>`
            : '';
        const codeHtml = data.code
            ? `<pre style="margin:0;padding:6px 8px;background:var(--vscode-textCodeBlock-background);border-radius:4px;font-size:11px;line-height:1.4;max-height:80px;overflow:hidden;white-space:pre-wrap;word-break:break-all;color:var(--vscode-editor-foreground);">${escapeHtml(data.code)}</pre>`
            : '';
        preview.innerHTML = `
            <div style="font-weight:600;font-size:13px;margin-bottom:2px;">${escapeHtml(data.name || '')}</div>
            ${sourceInfo}
            ${codeHtml}
            <div style="font-size:10px;color:var(--vscode-descriptionForeground);margin-top:6px;text-align:center;">拖拽到编辑器中释放</div>
        `;
        document.body.appendChild(preview);
        event.dataTransfer.setDragImage(preview, 12, 12);
        setTimeout(() => { if (preview.parentNode) preview.parentNode.removeChild(preview); }, 0);
    }
}

const LegoList: Component = (props: any) => {
    // 初始化数据
    const [legoGroupsStore, setLegoGroups] = createStore<any[]>([])
    const updateLegoGroupStore = (data: any) => {
        setLegoGroups(Object.values(
            [
                ...data.filter(item => item).map((item: any) => ({
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
    }
    vscode.call('lego.list.get', {}).then(res => {
        updateLegoGroupStore(res)
    })
    vscode.listenMessage('lego.list.fresh', res => {
        updateLegoGroupStore(res)
    })
    const slots: any = {
        dialog: [],
        operate: [],
        itemMenu: [],
        emptyButton: [],
    }

    CustomViewPlugin.map(install => { install(slots, legoGroupsStore, updateLegoGroupStore) })
    return (<>
        <section class="lego-list__operate">
            {slots.operate}
        </section>
        <Switch fallback={<div></div>}>
            <Match when={legoGroupsStore.length === 0}>
                <div class="lego-list__empty">
                    <div class="lego-list__empty-icon">
                        <i class="fa fa-puzzle-piece"></i>
                    </div>
                    <div class="lego-list__empty-title">欢迎使用代码大全</div>
                    <div class="lego-list__empty-steps">
                        <div>① 点击下方「添加组件」按钮开始使用</div>
                        <div>② 右键组件可编辑或删除</div>
                        <div>③ 拖拽组件到代码中即可使用</div>
                    </div>
                    {slots.emptyButton}
                </div>
            </Match>
            <Match when={legoGroupsStore.length > 0}>
                <div class="lego-list__accordion">
                    <DAccordion items={legoGroupsStore}>{(legoGroup: any) => (
                        <div class="lego-list__items">
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
                </div>
            </Match>
        </Switch>
        {slots.dialog}
    </>);
};

export default LegoList;
