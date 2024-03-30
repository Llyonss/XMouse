import { createSignal, } from 'solid-js'
import { Dialog } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'
import Close from './close.svg'
import './index.scss'
let hasOpen = false;

export default (props) => {
    const [getIsOpen, setIsOpen] = createSignal(false)
    let resolveLock = (data: any) => { };
    let rejectLock = () => { };
    if (props.ref) {
        props.ref({
            open: (item: any) => {
                if (hasOpen) {
                    return;
                }
                hasOpen = true
                setIsOpen(true)
                const lock = new Promise(((resolve, reject) => {
                    resolveLock = resolve;
                    rejectLock = reject;
                }));
                return lock
            }
        })
    }
    const close = (data?: any) => {
        if (data) {
            resolveLock(data)
        } else {
            rejectLock()
        }
        setIsOpen(false);
        hasOpen = false;
    }
    return (
        <Dialog.Root open={getIsOpen()} onOpenChange={() => { close() }}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.CloseTrigger>
                            <i class="fa fa-close" ></i>
                        </Dialog.CloseTrigger>
                        <Dialog.Title>
                            {props.title(close)}
                        </Dialog.Title>
                        <Dialog.Description>
                            <section data-scope="dialog" data-part='center'>
                                {props.content(close)}
                            </section>
                            <section data-scope="dialog" data-part='footer'>
                                {props.footer(close)}
                            </section>
                        </Dialog.Description>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}