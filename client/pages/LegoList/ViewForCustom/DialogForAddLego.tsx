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
                    <DLayout.Column style="gap:8px;min-width:250px;">
                        <DLayout.Row >
                            <span style="width:5rem;">组件名：</span>
                            <input style="flex-grow: 1;" placeholder="如: ElButton按钮" value={getName()} onChange={event => setName(event.target.value)}></input>
                        </DLayout.Row>
                        <DLayout.Row >
                            <span style="width:5rem;">组件分类：</span>
                            <input style="flex-grow: 1;" placeholder="如: 我的UI" value={getGroup()} onChange={event => setGroup(event.target.value)}></input>
                        </DLayout.Row>
                        {/* <span>组件ICON：</span><input></input> */}
                        <div>
                            <span >组件依赖：</span>
                            <DLayout.Column style="gap:8px;padding-left:1rem;margin-top:8px;">
                                <label >
                                    <DLayout.Row >
                                        <span style="width:4rem;">import</span>
                                        <input placeholder="如: { ElButton }" style="flex-grow: 1;" value={getSource().import} onChange={event => setSource({ ...getSource(), import: event.target.value })}></input>
                                    </DLayout.Row>
                                </label>
                                <label>
                                    <DLayout.Row >
                                        <span style="width:4rem;">from</span>
                                        <input placeholder="如: element-ui" style="flex-grow: 1;" value={getSource().from} onChange={event => setSource({ ...getSource(), from: event.target.value })}></input>
                                    </DLayout.Row>
                                </label>
                            </DLayout.Column>
                        </div>

                        <span style="width:5rem;">组件内容</span><textarea placeholder="如: <ElButton>你好</ElButton>" value={getCode()} onChange={event => setCode(event.target.value)}></textarea>
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