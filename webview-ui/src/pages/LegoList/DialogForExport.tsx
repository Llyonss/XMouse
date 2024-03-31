import { createSignal } from 'solid-js'
import { DDialog, DLayout, DTreeSelect } from '../../components'

export default (props: any) => {
    const [getGroups, setGroups] = createSignal([])
    const [getOptions, setOptions] = createSignal([])
    const [getValue, setValue] = createSignal([])
    let selectRef = {};
    let dialogRef: any = {};
    if (props.ref) {
        props.ref({
            open: (groups: any) => {
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
                return dialogRef.open()
            }
        })
    }
    return (
        <DDialog
            ref={dialogRef}
            title={() => (<>
                导出组件
            </>)}
            content={() => (<>
                <DLayout.Column style="gap:8px;">
                    <span >请选择导出组件</span>
                    <DTreeSelect
                        ref={selectRef}
                        value={getValue()}
                        onChange={value => setValue(value)}
                        multi
                        data={getOptions()}
                        clearable
                        showMax={3}
                        showMore
                        transfer={true}
                        mode='Shallow'
                    />
                </DLayout.Column>
            </>)}
            footer={(close) => (<>
                <button data-type="primary" onclick={() => {
                    const groups = getGroups();
                    close(getValue().flatMap((id: string) => {
                        const [groupId, legoId] = id.split('_');
                        const isGroup = legoId === undefined;
                        // @ts-ignore
                        if (isGroup) return groups[groupId - 1].legos;
                        // @ts-ignore
                        return groups[groupId - 1].legos[legoId]
                    }));
                }}>导出</button>
                <button data-type="secondary" onclick={() => close(false)}>取消</button>
            </>)}
        ></DDialog >
    )
}