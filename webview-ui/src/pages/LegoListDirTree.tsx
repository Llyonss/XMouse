import type { Component } from "solid-js";
import { createSignal, For } from 'solid-js'

const LegoListDirTree: Component = (props) => {
    const dirTree = (data: any, level = 0) => {
        return (
            <div style={`padding-left:${level * 4}px`} >
                <div onClick={() => { props.onActive(data?.xmfiles) }}>{data?.name}</div>
                <For each={Object.keys(data?.dirMap || {})}>{(key) =>
                    dirTree({ ...data?.dirMap[key], name: key }, level + 1)
                }</For>
            </div >
        )
    };
    return (<div>{dirTree(props?.data)}</div>)
};
export default LegoListDirTree;