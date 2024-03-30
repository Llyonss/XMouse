import { Accordion } from '@ark-ui/solid'
import { Index, createEffect, createSignal } from 'solid-js'
import './index.scss'
export default (props) => {
    const [getAccordion, setAccordion] = createSignal([props.items[0].name])
    return (
        <Accordion.Root value={getAccordion()} onValueChange={e => { setAccordion(e.value) }} multiple collapsible>
            {props.items.map((item) => (
                <Accordion.Item value={item.name}>
                    <Accordion.ItemTrigger>
                        <Accordion.ItemIndicator>
                            <i class="fa fa-angle-right"></i>
                        </Accordion.ItemIndicator>
                        {item.name}
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent >
                        {props.children(item)}
                    </Accordion.ItemContent>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    )
}