import { createSignal, Show } from 'solid-js'
import { DDialog, DSelect, DTab } from '../../components'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeTextField } from "@vscode/webview-ui-toolkit";
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeTextField());

export default (props: any) => {
    const [getJson, setJson] = createSignal('')
    const [getErrorInfo, setErrorInfo] = createSignal('')

    let dialogRef: any = {};
    if (props.ref) {
        props.ref({
            open: (item: any) => {
                return dialogRef.open()
            }
        })
    }
    const [getNPM, setNPM] = createSignal([])
    return (
        <DDialog
            ref={dialogRef}
            title={() => (<>
                导入组件
            </>)}
            content={() => (<>
                <DTab.Root >
                    <DTab.List tabs={[
                        { id: 'workspace', label: '导入项目文件' },
                        { id: 'npm', label: '导入NPM包' },
                        { id: 'json', label: '导入JSON' }
                    ]}></DTab.List>
                    <DTab.Item value="workspace" >
                        测试
                    </DTab.Item>
                    <DTab.Item value="npm" >
                        <DSelect multiple
                            onValueChange={(e: any) => { setNPM(e.items) }}
                            options={[
                                { name: 'a', value: 'testa' },
                                { name: 'b', value: 'testb' },
                                { name: 'c', value: 'testc' }
                            ]}
                        >
                        </DSelect>
                    </DTab.Item>
                    <DTab.Item value="json" >
                        <span style="width:5rem;">组件配置</span>
                        <Show when={getErrorInfo()}><span style="color:red;font-size:12px">{getErrorInfo()}</span></Show>
                        <textarea
                            placeholder="如: [&#13;&#10;  {&#13;&#10;    name:'按钮',&#13;&#10;    group:'我的UI',&#13;&#10;    code:'<Button></Button>',&#13;&#10;    source:[&#13;&#10;      {&#13;&#10;        import:'{button}',&#13;&#10;        from:'element-ui'&#13;&#10;      }&#13;&#10;    ]&#13;&#10;  }&#13;&#10;]"
                            value={getJson()}
                            onChange={event => setJson(event.target.value)}
                            style="height: calc(var(--input-height) * 9px);width:100%;">
                        </textarea>
                    </DTab.Item>
                </DTab.Root>
            </>)}
            footer={(close: (data?: any) => {}) => (<>
                <button data-type="primary" onclick={() => {
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
                }}>确认</button>
                <button data-type="secondary" onclick={() => close(false)}>取消</button>
            </>)}
        ></DDialog >
    )
}