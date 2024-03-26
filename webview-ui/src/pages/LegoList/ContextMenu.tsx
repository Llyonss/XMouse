import { Menu } from '@ark-ui/solid'
import { For } from 'solid-js'

const Basic = (props) => (
    <Menu.Root>
        <Menu.ContextTrigger>
            {props.children}
        </Menu.ContextTrigger>
        <Menu.Positioner>
            <Menu.Content>
                <For each={props.items}>{(item: any) => (
                    <Menu.Item id={item.id} onclick={item.onClick}>{item.label}</Menu.Item>
                )}</For>
            </Menu.Content>
        </Menu.Positioner>
    </Menu.Root>
)

export default Basic