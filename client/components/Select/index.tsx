import { splitProps } from "solid-js";
import { Select } from '@ark-ui/solid'
import { Index, Portal } from 'solid-js/web'
import './select.scss'
export default (props: any) => {
    const [selectProps] = splitProps(props, ['onValueChange', 'multiple'])
    return (
        <Select.Root items={props.options} {...selectProps}>
            <Select.Label>Framework</Select.Label>
            <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder="Select a Framework" />
                </Select.Trigger>
                <Select.ClearTrigger>
                    <i class="fa fa-close"></i>
                </Select.ClearTrigger>
            </Select.Control>
            <Portal>
                <Select.Positioner>
                    <Select.Content>
                        <Select.ItemGroup id="framework">
                            <Select.ItemGroupLabel for="framework">Frameworks</Select.ItemGroupLabel>
                            <Index each={props.options}>
                                {(item) => (
                                    <Select.Item item={item()}>
                                        <Select.ItemText>{item().name}</Select.ItemText>
                                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                                    </Select.Item>
                                )}
                            </Index>
                        </Select.ItemGroup>
                    </Select.Content>
                </Select.Positioner>
            </Portal>
        </Select.Root>
    )
}