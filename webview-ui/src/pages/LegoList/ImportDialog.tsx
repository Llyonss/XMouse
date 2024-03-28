import type { Component } from "solid-js";
import { createEffect, createSignal, For, Match, Switch, Show } from 'solid-js'
import { Tabs } from '@ark-ui/solid'
import { Dialog, Layout, Combobox } from '../../components'
import { Portal } from 'solid-js/web'
import Close from './close.svg'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeTextField } from "@vscode/webview-ui-toolkit";
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeTextField());

export default (props) => {
    const [getIsOpen, setIsOpen] = createSignal(false)
    const [getJson, setJson] = createSignal('')
    const [getErrorInfo, setErrorInfo] = createSignal('')
    let resolveLock = (data: any) => { };
    let rejectLock = () => { };
    if (props.ref) {
        props.ref({
            open: (item: any) => {
                setIsOpen(true)
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
                        <Dialog.Title>导入组件</Dialog.Title>
                        <Dialog.Description>
                            {/* 123123123 */}
                            <Layout.Column style="gap:8px;">
                                <span style="width:5rem;">组件配置</span>
                                <Show when={getErrorInfo()}><span style="color:red;font-size:12px">{getErrorInfo()}</span></Show>
                                <textarea
                                    placeholder="如: [&#13;&#10;  {&#13;&#10;    name:'按钮',&#13;&#10;    group:'我的UI',&#13;&#10;    code:'<Button></Button>',&#13;&#10;    source:[&#13;&#10;      {&#13;&#10;        import:'{button}',&#13;&#10;        from:'element-ui'&#13;&#10;      }&#13;&#10;    ]&#13;&#10;  }&#13;&#10;]"
                                    value={getJson()}
                                    onChange={event => setJson(event.target.value)}
                                    style="height: calc(var(--input-height) * 9px);">
                                </textarea>
                            </Layout.Column>
                            <Layout.Row style="margin-top:24px;gap:8px;">
                                <button data-type="primary" onclick={() => {
                                    try {
                                        const json = JSON.parse(getJson())
                                        if (!(json instanceof Array)) {
                                            setErrorInfo(`这不是我需要的JSON哦, 我需要[{group:string,name:string,code:string}]的数组哦`);
                                            return;
                                        }
                                        if (json.some((item, index) => item.name === undefined || item.group === undefined  || item.code === undefined)) {
                                            setErrorInfo(`这串JSON格式似乎不太对哦, 我需要[{group:string,name:string,code:string}]的数组哦`);
                                        }
                                    } catch (e) {
                                        setErrorInfo('JSON有点问题哦, 我需要[{group:string,name:string,code:string}]的数组哦');
                                    }
                                    if (getErrorInfo()) {
                                        return;
                                    }
                                    setIsOpen(false);
                                    resolveLock?.(JSON.parse(getJson()));
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