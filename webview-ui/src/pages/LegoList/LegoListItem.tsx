import { splitProps } from 'solid-js'
import Test from './lego.svg'
export default (props: any) => {
    const [lego, other] = splitProps(props, ['name'])
    return (
        <div {...other} >
            <div style="cursor: grab;width:48px;height:48px; padding:4px; border: solid 1px var(--vscode-badge-background);background:var(--vscode-badge-background);border-radius: 8px; ">
                <img src={Test} style="pointer-events: none;background:white;border-radius: 8px;"></img>
            </div>
            <div style="width:48px;display:flex;justify-content:center;word-break: break-all;">
                {lego.name}
            </div>
        </div>
    )
}