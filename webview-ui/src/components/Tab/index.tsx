import { Tabs,  } from '@ark-ui/solid'

import { createSignal, Index, } from 'solid-js'

import './tab.scss'

const Item = Tabs.Content
const List = (props) => {
    return (
        <Tabs.List>
            <Index each={props.tabs}>{(tab) => (
                <Tabs.Trigger value={tab().id}>{tab().label}</Tabs.Trigger>
            )}</Index>
        </Tabs.List>
    )
}
const Root = (props) => {
    const [value, setValue] = createSignal<string | null>('导入项目文件')
    return (
        <Tabs.Root value={value()} onValueChange={(e) => setValue(e.value)}>
            {props.children}
        </Tabs.Root >
    )
};

export default {
    Item, List, Root
}