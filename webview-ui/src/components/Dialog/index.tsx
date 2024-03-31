import { JSX, createSignal, } from 'solid-js'
import { Dialog } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'
import './index.scss'
let hasOpen = false;
type DDialogOpen = () => Promise<any> | undefined;
type DDialogClose = (data?: any | undefined) => void;
type DDialogProps = {
    ref: (data?: { open: DDialogOpen, close: DDialogClose }) => {},
    title: (close: DDialogClose) => JSX.Element,
    content: (close: DDialogClose) => JSX.Element,
    footer: (close: DDialogClose) => JSX.Element
}
export default (props: DDialogProps) => {
    const [getIsOpen, setIsOpen] = createSignal(false)
    const context = {
        resolveLock: (data?: any) => { },
        rejectLock: () => { }
    };
    const open: DDialogOpen = () => {
        if (hasOpen) { return; } hasOpen = true;

        setIsOpen(true)
        const lock = new Promise(((resolve, reject) => {
            context.resolveLock = resolve;
            context.rejectLock = reject;
        }));
        return lock
    }
    const close: DDialogClose = (data?: any) => {
        if (data) {
            context.resolveLock(data)
        } else {
            context.rejectLock()
        }
        setIsOpen(false);
        hasOpen = false;
    }
    props.ref({ open, close })
    return (
        <Dialog.Root open={getIsOpen()} onOpenChange={() => { close() }} closeOnInteractOutside={false}>
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