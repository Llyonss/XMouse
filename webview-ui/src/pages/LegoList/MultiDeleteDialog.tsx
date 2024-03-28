import type { Component } from "solid-js";
import { createEffect, createSignal, For, Match, Switch, Show } from 'solid-js'
import { Tabs } from '@ark-ui/solid'
import { Dialog, Layout, Combobox } from '../../components'
import { Portal } from 'solid-js/web'
import Close from './close.svg'
import { MultiSelect } from '@digichanges/solid-multiselect';
import { TreeSelect } from 'cui-solid'

export default (props) => {
    const [getIsOpen, setIsOpen] = createSignal(false)
    const [getGroups, setGroups] = createSignal([])
    const [getOptions, setOptions] = createSignal([])
    const [getValue, setValue] = createSignal([])
    let selectRef = {};
    let resolveLock = (data: any) => { };
    let rejectLock = () => { };
    if (props.ref) {
        props.ref({
            open: (groups) => {
                setIsOpen(true);
                setGroups(groups);
                setValue([])
                setOptions(
                    groups?.map((group: any, groupIndex: number) => ({
                        id: groupIndex + 1,
                        title: group.name,
                        children: group.legos.map((item: any, itemIndex: number) => ({
                            id: (groupIndex + 1) + '_' + itemIndex, title: item.name, data: item
                        }))
                    })) || []
                )
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
                            <Layout.Column style="gap:8px;">
                                <span >请选择组件进行删除</span>
                                <Show when={getIsOpen()}>
                                    <TreeSelect
                                        style=""
                                        ref={selectRef}
                                        value={getValue()}
                                        onChange={value => setValue(value)}
                                        multi
                                        data={getOptions()}
                                        clearable
                                        showMax={3}
                                        showMore
                                        transfer={true}
                                        mode='Shallow' />
                                </Show>
                            </Layout.Column>
                            <Layout.Row style="margin-top:24px;gap:8px;">
                                <button data-type="primary" onclick={() => {
                                    setIsOpen(false);
                                    const groups = getGroups();
                                    resolveLock(getValue().flatMap((id: string) => {
                                        const [groupId, legoId] = id.split('_');
                                        const isGroup = legoId === undefined;
                                        if (isGroup) return groups[groupId - 1].legos;
                                        return groups[groupId - 1].legos[legoId]
                                    }));
                                }}>删除</button>
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