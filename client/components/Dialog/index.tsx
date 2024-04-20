import { JSX, createSignal, Show, JSXElement } from 'solid-js'
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
    footer: (close: DDialogClose) => JSX.Element,
    trigger: undefined | string | (() => JSX.Element),
}
export default function useDDialog() {
    const [getIsOpen, setIsOpen] = createSignal(false)
    const context = {
        resolveLock: (data?: any) => { },
        rejectLock: () => { }
    };
    const close: DDialogClose = (data?: any) => {
        if (data) {
            context.resolveLock(data)
        } else {
            context.rejectLock()
        }
        setIsOpen(false);
        hasOpen = false;
    }
    const open: DDialogOpen = () => {
        if (hasOpen) { return; } hasOpen = true;

        setIsOpen(true)
        const lock = new Promise(((resolve, reject) => {
            context.resolveLock = resolve;
            context.rejectLock = reject;
        }));
        return lock
    }
    const DDialog = (props: DDialogProps): JSXElement => {
        props?.ref?.({ open, close })
        return (
            <Dialog.Root open={getIsOpen()} onOpenChange={() => { close() }} closeOnInteractOutside={false}>
                <Show when={props.trigger}>
                    <Dialog.Trigger>
                        {typeof props.trigger === 'string' ? props.trigger : props.trigger()}
                    </Dialog.Trigger>
                </Show>
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
    return [DDialog, open]
}