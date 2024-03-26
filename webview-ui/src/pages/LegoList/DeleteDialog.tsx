import type { Component } from "solid-js";
import { createEffect, createSignal, For, Match, Switch } from 'solid-js'
import { Tabs } from '@ark-ui/solid'
import { Dialog, Layout, Combobox } from '../../components'
import { Portal } from 'solid-js/web'
import Close from './close.svg'
export default (props) => {
    const [getIsOpen, setIsOpen] = createSignal(false)
    const [getId, setId] = createSignal('')
    const [getName, setName] = createSignal('')
    let resolveLock = (data: any) => { };
    let rejectLock = () => { };
    if (props.ref) {
        props.ref({
            open: (item: any) => {
                setIsOpen(true)
                setId(item?.id || '')
                setName(item.name)
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
                        <Dialog.Title>删除组件</Dialog.Title>
                        <Dialog.Description>
                            {/* 123123123 */}
                            <Layout.Column>
                                确定删除【{getName()}】吗？
                            </Layout.Column>
                            <Layout.Row style="margin-top:24px;gap:8px;">
                                <button data-type="primary" onclick={() => {
                                    setIsOpen(false);
                                    resolveLock?.({
                                        id: getId(),
                                    });
                                }}>确认</button>
                                <button data-type="secondary" onclick={() => setIsOpen(false)}>取消</button>
                            </Layout.Row>
                        </Dialog.Description>
                        <Dialog.CloseTrigger><img src={Close}></img></Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}