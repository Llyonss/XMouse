import type { Component } from "solid-js";
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { TreeView } from '@ark-ui/solid'
let UUID = 0;
const LegoListDirTree: Component = (props) => {
    const dirTree = (data: any, level = 1) => {
        const id = UUID++;
        return (
            <TreeView.Branch id={id + ''} depth={level} >
                <TreeView.BranchControl id={id + ''} depth={level} onClick={() => { props.onActive(data?.xmfiles) }}>
                    <TreeView.BranchText id={id + ''} depth={level}>
                        <Show when={Object.keys(data?.dirMap||{}).length}>
                            <span data-scope="tree-view" data-part="treeitem-expand">⏏</span>
                        </Show>
                        {props?.node?.(data, level)}
                    </TreeView.BranchText>
                </TreeView.BranchControl>

                <TreeView.BranchContent id={id + ''} depth={level}>
                    <For each={Object.keys(data?.dirMap || {})}>{(key) =>
                        dirTree({ ...data?.dirMap[key], name: key }, level + 1)
                    }</For>
                </TreeView.BranchContent>
            </TreeView.Branch >
        )
    };
    return (<div>
        <TreeView.Root>
            <TreeView.Tree>
                {Object.values(props?.data?.dirMap || {})?.map(item => dirTree(item))}
            </TreeView.Tree>
        </TreeView.Root>
    </div>)
};
export default LegoListDirTree;