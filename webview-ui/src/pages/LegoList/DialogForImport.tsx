import { createSignal } from 'solid-js'
import { Show } from 'solid-js'
import { DDialog, DSelect, DTab, DTreeSelect } from '../../components'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeTextField } from "@vscode/webview-ui-toolkit";
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeTextField());

export default (props: any) => {
    const [getActiveTab, setActiveTab] = createSignal([])
    const [getJson, setJson] = createSignal('')
    const [getErrorInfo, setErrorInfo] = createSignal('')
    const [getValue, setValue] = createSignal([])
    const [getDirection, setDirection] = createSignal([])
    const [getSelectedDirection, setSelectedDirection] = createSignal([])
    const [getOptions, setOptions] = createSignal([
        { id: 0, title: 'element-plus', children: [] },
        {
            id: 1, title: 'arco-design', children: [
                { id: 2, title: 'vue', children: [] },
                { id: 3, title: 'react', children: [] },
            ]
        }
    ])
    let dialogRef: any = {};
    if (props.ref) {
        props.ref({
            open: (data: any) => {
                setDirection(data.direction)
                return dialogRef.open()
            }
        })
    }
    const [getNPM, setNPM] = createSignal([])

    return (
        <DDialog
            ref={dialogRef}
            title={() => (<>导入组件 </>)}
            content={() => (<>
                {/* <DTab.Root value={getActiveTab()} onValueChange={(e) => { setActiveTab(e.value) }}>
                    <DTab.List tabs={[
                        { id: 'workspace', label: '导入项目文件' },
                        { id: 'npm', label: '导入NPM包' },
                        { id: 'json', label: '导入JSON' }
                    ]}></DTab.List>
                    <DTab.Item value="workspace" >
                        <DTreeSelect
                            value={getSelectedDirection()}
                            onChange={value => setSelectedDirection(value)}
                            data={getDirection()}
                            checkRelation="unRelated"
                            multi
                            clearable
                            showMax={3}
                            showMore
                            transfer={true}
                            mode='Leaf'
                        ></DTreeSelect>
                    </DTab.Item>
                    <DTab.Item value="npm" >
                        <DTreeSelect
                            value={getValue()}
                            onChange={value => setValue(value)}
                            data={getDirection()}
                            multi
                            clearable
                            showMax={3}
                            showMore
                            transfer={true}
                            mode='Shallow'
                        ></DTreeSelect>
                    </DTab.Item> */}
                {/* <DTab.Item value="json" > */}
                <span style="width:5rem;">组件配置</span>
                <Show when={getErrorInfo()}><span style="color:red;font-size:12px">{getErrorInfo()}</span></Show>
                <textarea
                    placeholder="如: [&#13;&#10;  {&#13;&#10;    name:'按钮',&#13;&#10;    group:'我的UI',&#13;&#10;    code:'<Button></Button>',&#13;&#10;    source:[&#13;&#10;      {&#13;&#10;        import:'{button}',&#13;&#10;        from:'element-ui'&#13;&#10;      }&#13;&#10;    ]&#13;&#10;  }&#13;&#10;]"
                    value={getJson()}
                    onChange={event => setJson(event.target.value)}
                    style="height: calc(var(--input-height) * 9px);width:100%;">
                </textarea>
                {/* </DTab.Item>
                </DTab.Root> */}
            </>)}
            footer={(close) => (<>
                <button data-type="primary" onclick={() => {
                    // if (getActiveTab() === 'json') {
                    try {
                        const json = JSON.parse(getJson())
                        if (!(json instanceof Array)) {
                            setErrorInfo(`这不是我需要的JSON哦, 我需要[{group:string,name:string,code:string}]的数组哦`);
                            return;
                        }
                        if (json.some((item, index) => item.name === undefined || item.group === undefined || item.code === undefined)) {
                            setErrorInfo(`这串JSON格式似乎不太对哦, 我需要[{group:string,name:string,code:string}]的数组哦`);
                        }
                    } catch (e) {
                        setErrorInfo('JSON有点问题哦, 我需要[{group:string,name:string,code:string}]的数组哦');
                    }
                    if (getErrorInfo()) {
                        return;
                    }
                    close(JSON.parse(getJson()));
                    // }
                    // if (getActiveTab() === 'workspace') {
                    //     console.log('测试', getSelectedDirection())
                    // }

                }}>确认</button>
                <button data-type="secondary" onclick={() => close(false)}>取消</button>
            </>)}
        ></DDialog >
    )
}