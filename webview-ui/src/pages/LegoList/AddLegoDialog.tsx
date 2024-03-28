import type { Component } from "solid-js";
import { createEffect, createSignal, For, Match, Switch } from 'solid-js'
import { Tabs } from '@ark-ui/solid'
import { Dialog, Layout, Combobox } from '../../components'
import { Portal } from 'solid-js/web'
import Close from './close.svg'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeTextField } from "@vscode/webview-ui-toolkit";
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeTextField());

export default (props) => {
    const [getIsOpen, setIsOpen] = createSignal(false)

    const [getIsAdd, setIsAdd] = createSignal(true)
    const [getName, setName] = createSignal('')
    const [getGroup, setGroup] = createSignal('')
    const [getSource, setSource] = createSignal({ from: '', import: '' })
    const [getCode, setCode] = createSignal('')
    let resolveLock = (data: any) => { };
    let rejectLock = () => { };
    if (props.ref) {
        props.ref({
            open: (item: any) => {
                setIsOpen(true)
                setName(item?.name || '');
                setGroup(item?.group || '');
                setSource(item?.source || { from: '', import: '' });
                setCode(item?.code || '');
                setIsAdd(!item)
                const lock = new Promise(((resolve, reject) => {
                    resolveLock = resolve;
                    rejectLock = reject;
                }));
                return lock
            }
        })
    }
    return (
        <Dialog.Root open={getIsOpen()} onOpenChange={() => { setIsOpen(false); rejectLock() }}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Title>{getIsAdd() ? '编辑组件' : '添加组件'}</Dialog.Title>
                        <Dialog.Description>
                            {/* 123123123 */}
                            <Layout.Column style="gap:8px;">
                                <Layout.Row >
                                    <span style="width:5rem;">组件名：</span>
                                    <input style="flex-grow: 1;" placeholder="如: ElButton按钮" value={getName()} onChange={event => setName(event.target.value)}></input>
                                </Layout.Row>
                                <Layout.Row >
                                    <span style="width:5rem;">组件分类：</span>
                                    <input style="flex-grow: 1;" placeholder="如: 我的UI" value={getGroup()} onChange={event => setGroup(event.target.value)}></input>
                                </Layout.Row>
                                {/* <span>组件ICON：</span><input></input> */}
                                <div>
                                    <span >组件依赖：</span>
                                    <Layout.Column style="gap:8px;padding-left:1rem;margin-top:8px;">
                                        <label >
                                            <Layout.Row >
                                                <span style="width:4rem;">import</span>
                                                <input placeholder="如: { ElButton }" style="flex-grow: 1;" value={getSource().import} onChange={event => setSource({ ...getSource(), import: event.target.value })}></input>
                                            </Layout.Row>
                                        </label>
                                        <label>
                                            <Layout.Row >
                                                <span style="width:4rem;">from</span>
                                                <input placeholder="如: element-ui" style="flex-grow: 1;" value={getSource().from} onChange={event => setSource({ ...getSource(), from: event.target.value })}></input>
                                            </Layout.Row>
                                        </label>
                                    </Layout.Column>
                                </div>

                                <span style="width:5rem;">组件内容</span><textarea placeholder="如: <ElButton>你好</ElButton>" value={getCode()} onChange={event => setCode(event.target.value)}></textarea>
                            </Layout.Column>
                            <Layout.Row style="margin-top:24px;gap:8px;">
                                <button data-type="primary" onclick={() => {
                                    setIsOpen(false);
                                    resolveLock?.({
                                        name: getName(),
                                        group: getGroup(),
                                        source: getSource(),
                                        code: getCode(),
                                    });
                                }}>确认</button>
                                <button data-type="secondary" onclick={() => setIsOpen(false)}>取消</button>
                            </Layout.Row>
                        </Dialog.Description>
                        <Dialog.CloseTrigger><img src={Close} style="filter: invert(1);"></img></Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}