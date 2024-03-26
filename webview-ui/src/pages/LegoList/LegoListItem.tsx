
export default (props: any) => {
    return (
        <div
            draggable={true}
            onDragEnd={props.onDragEnd}
        >
            <div style="width:48px;height:48px;border:solid 1px white">{props.icon}</div>
            <div>{props.name}</div>
        </div>
    )
}