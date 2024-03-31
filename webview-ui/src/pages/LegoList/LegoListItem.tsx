
export default (props: any) => {
    return (
        <div
            draggable={true}
            onDragStart={(event) => { handleDragStart(event, lego) }}
            onDragEnd={(event) => { handleDragEnd(event, lego) }}
        >
            <div style="cursor: grab;width:48px;height:48px; padding:4px; border: solid 1px var(--vscode-badge-background);background:var(--vscode-badge-background);border-radius: 8px; ">
                <img src={Test} style="pointer-events: none;background:white;border-radius: 8px;"></img>
            </div>
            <div style="width:48px;display:flex;justify-content:center;word-break: break-all;">
                {lego.name}
            </div>
        </div>
    )
}