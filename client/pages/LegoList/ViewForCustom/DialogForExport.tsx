import { createSignal } from 'solid-js'
import { vscode } from "../../../utilities/vscode";
import { DDialog as useDDialog, DLayout, DTreeSelect, DToast } from '../../../components'

export default () => {
    const [getGroups, setGroups] = createSignal([])
    const [getOptions, setOptions] = createSignal([])
    const [getValue, setValue] = createSignal([])
    const [DDialog, openDDialog] = useDDialog()
    let toastRef: any = {};
    const openDialogForExport = (data) => {
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
        openDDialog().then((list: any[]) => {
            navigator.clipboard.writeText(JSON.stringify(list)).then(() => {
                toastRef.open({
                    title: '导出成功！',
                    description: '导出内容已经复制到剪贴板啦，去粘贴吧!',
                    duration: 20000,
                })
            })
        })
    }
    const DialogForExport = (props: any) => {
        return (
            <>
                <DToast ref={toastRef}></DToast>
                <DDialog
                    title={() => (<>
                        导出配置
                    </>)}
                    content={() => (<>
                        <DLayout.Column style="gap:8px;">
                            <span >请选择导出组件</span>
                            <DTreeSelect
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
            </>

        )
    }

    vscode.listenMessage('lego.list.export', (data: any) => {
        openDialogForExport()
    })
    return [DialogForExport, openDialogForExport]
}