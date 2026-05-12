import { JSXElement, createSignal } from 'solid-js'
import { DDialog as useDDialog, DLayout } from '../../../components'

export default () => {
    const [getIsAdd, setIsAdd] = createSignal(true)
    const [getName, setName] = createSignal('')
    const [getGroup, setGroup] = createSignal('')
    const [getSource, setSource] = createSignal({ from: '', import: '' })
    const [getCode, setCode] = createSignal('')
    const [DDialog, openDDialog] = useDDialog()

    return [
        (props): JSXElement => (
            <DDialog
                title={() => (
                    <>{getIsAdd() ? '添加组件' : '编辑组件'}</>
                )}
                content={() => (
                    <DLayout.Column style="gap:12px;min-width:0;">
                        <DLayout.Column style="gap:3px;">
                            <span style="font-size:12px;color:var(--vscode-descriptionForeground);">组件名</span>
                            <input style="width:100%;box-sizing:border-box;" placeholder="如: ElButton按钮" value={getName()} onChange={event => setName(event.target.value)}></input>
                        </DLayout.Column>
                        <DLayout.Column style="gap:3px;">
                            <span style="font-size:12px;color:var(--vscode-descriptionForeground);">组件分类</span>
                            <input style="width:100%;box-sizing:border-box;" placeholder="如: 我的UI" value={getGroup()} onChange={event => setGroup(event.target.value)}></input>
                        </DLayout.Column>
                        <DLayout.Column style="gap:3px;">
                            <span style="font-size:12px;color:var(--vscode-descriptionForeground);">组件依赖</span>
                            <DLayout.Column style="gap:8px;padding-left:10px;">
                                <DLayout.Column style="gap:2px;">
                                    <span style="font-size:11px;color:var(--vscode-descriptionForeground);">import</span>
                                    <input style="width:100%;box-sizing:border-box;" placeholder="如: { ElButton }" value={getSource().import} onChange={event => setSource({ ...getSource(), import: event.target.value })}></input>
                                </DLayout.Column>
                                <DLayout.Column style="gap:2px;">
                                    <span style="font-size:11px;color:var(--vscode-descriptionForeground);">from</span>
                                    <input style="width:100%;box-sizing:border-box;" placeholder="如: element-ui" value={getSource().from} onChange={event => setSource({ ...getSource(), from: event.target.value })}></input>
                                </DLayout.Column>
                            </DLayout.Column>
                        </DLayout.Column>
                        <DLayout.Column style="gap:3px;">
                            <span style="font-size:12px;color:var(--vscode-descriptionForeground);">组件内容</span>
                            <textarea style="width:100%;box-sizing:border-box;min-height:60px;max-height:140px;" placeholder="如: <ElButton>你好</ElButton>" value={getCode()} onChange={event => setCode(event.target.value)}></textarea>
                        </DLayout.Column>
                    </DLayout.Column>
                )}
                footer={(close) => (
                    <>
                        <button data-type="primary" onclick={() => {
                            close({
                                name: getName(),
                                group: getGroup(),
                                source: getSource(),
                                code: getCode(),
                            })
                        }}>确认</button>
                        <button data-type="secondary" onclick={() => close(false)}>取消</button>
                    </>
                )}
            ></DDialog>
        ),
        (item) => {
            setName(item?.name || '');
            setGroup(item?.group || '');
            setSource(item?.source || { from: '', import: '' });
            setCode(item?.code || '');
            setIsAdd(!item)
            return openDDialog()
        }
    ]
}