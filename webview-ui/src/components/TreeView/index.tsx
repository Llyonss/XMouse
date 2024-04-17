import './index.css'

import { createSignal } from "solid-js";
import { For, Show } from 'solid-js'
import { TreeView } from '@ark-ui/solid'


let UUID = 0;
type treeNode = { id: string, children?: treeNode[], title: string };

const LegoListDirTree = (props: { data: treeNode[] }, node: () => {}, onActive: () => {}, load: (data: treeNode) => {}) => {
    const dirTree = (data: any, level = 1) => {
        const id = UUID++;
        data?.children?.forEach?.(item => item.parent = data)
        const [getChildren, setChildren] = createSignal(data?.children || [])
        return (
            <TreeView.Branch id={id + ''} depth={level} >
                <TreeView.BranchControl id={id + ''} depth={level}
                    onClick={async () => {
                        props?.onActive?.(data?.xmfiles);
                        const children = await props?.load?.(data);
                        children.forEach(item => item.parent = data)
                        setChildren(children)
                    }}>
                    <TreeView.BranchText id={id + ''} depth={level}>
                        <div data-scope="tree-view" data-part="treeitem-expand">
                            <Show when={!data.leaf || Object.keys(getChildren() || {}).length}>
                                <i class="fa fa-angle-right" ></i>
                            </Show>
                        </div>
                        {props?.node?.(data, level)}
                    </TreeView.BranchText>
                </TreeView.BranchControl>

                <TreeView.BranchContent id={id + ''} depth={level}>
                    <For each={Object.keys(getChildren() || {})}>{(key) =>
                        dirTree({ ...getChildren()[key], name: key }, level + 1)
                    }</For>
                </TreeView.BranchContent>
            </TreeView.Branch >
        )
    };
    return (<div>
        <TreeView.Root>
            <TreeView.Tree>
                {Object.values(props?.data)?.map(item => dirTree(item))}
            </TreeView.Tree>
        </TreeView.Root>
    </div>)
};
export default LegoListDirTree