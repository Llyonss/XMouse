import { Tabs, } from '@ark-ui/solid'

import { createSignal, Index, splitProps, } from 'solid-js'

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
const Root = (props: any) => {
    const [, other] = splitProps(props, [])
    return (
        <Tabs.Root {...other}>
            {props.children}
        </Tabs.Root >
    )
};

export default {
    Item, List, Root
}