import { createSignal } from 'solid-js'
import { DDialog as useDDialog, DLayout } from '../../../components'
import { TreeSelect } from 'cui-solid'
export default () => {
    const [DDialog, openDDialog] = useDDialog()
    const [getGroups, setGroups] = createSignal([])
    const [getOptions, setOptions] = createSignal([])
    const [getValue, setValue] = createSignal([])
    const open = (data: any) => {
        setGroups(data);
        setValue([])
        setOptions(
            data?.map((group: any, groupIndex: number) => ({
                id: groupIndex + 1,
                title: group.name,
                children: group.legos.map((item: any, itemIndex: number) => ({
                    id: (groupIndex + 1) + '_' + itemIndex, title: item.name, data: item
                }))
            })) || []
        )
        return openDDialog()
    }

    const DialogForMultiDelete = (props: any) => (
        <DDialog
            trigger={props.trigger}
            title={() => (<>
                批量删除
            </>)}
            content={() => (<>
                <DLayout.Column style="gap:8px;">
                    <span >请选择组件进行删除</span>
                    <TreeSelect
                        style=""
                        value={getValue()}
                        onChange={value => setValue(value)}
                        multi
                        data={getOptions()}
                        clearable
                        showMax={3}
                        showMore
                        transfer={true}
                        mode='Shallow' />
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
                }}>删除</button>
                <button data-type="secondary" onclick={() => close(false)}>取消</button>
            </>)}
        ></DDialog >

    )
    return [DialogForMultiDelete, open]
}