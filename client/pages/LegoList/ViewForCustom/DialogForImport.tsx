import { createSignal } from 'solid-js'
import { Show } from 'solid-js'
import { DDialog as useDDialog, DSelect, DTab, DTreeSelect } from '../../../components'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeTextField } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../../utilities/vscode";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeTextField());

export default () => {
    const [getJson, setJson] = createSignal('')
    const [getErrorInfo, setErrorInfo] = createSignal('')
    const [DDialog, openDDialog] = useDDialog()
    vscode.listenMessage('lego.list.import', (data: any) => {
        openDDialog().then((list: any[]) => {
            vscode.postMessage({ command: 'lego.list.updateList', data: list });
        })
    })

    const DialogForImport = (props: any) => (
        <DDialog
            trigger={props.trigger}
            title={() => (<>导入配置 </>)}
            content={() => (<>
                <span style="width:5rem;">组件配置</span>
                <Show when={getErrorInfo()}><span style="color:red;font-size:12px">{getErrorInfo()}</span></Show>
                <textarea
                    placeholder="如: [&#13;&#10;  {&#13;&#10;    name:'按钮',&#13;&#10;    group:'我的UI',&#13;&#10;    code:'<Button></Button>',&#13;&#10;    source:[&#13;&#10;      {&#13;&#10;        import:'{button}',&#13;&#10;        from:'element-ui'&#13;&#10;      }&#13;&#10;    ]&#13;&#10;  }&#13;&#10;]"
                    value={getJson()}
                    onChange={event => setJson(event.target.value)}
                    style="height: calc(var(--input-height) * 9px);width:100%;">
                </textarea>

            </>)}
            footer={(close) => (<>
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
    return [DialogForImport, () => {
        openDDialog().then((list: any[]) => {
            vscode.postMessage({ command: 'lego.list.updateList', data: list });
        })
    }]
}