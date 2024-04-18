import { Toast, createToaster } from '@ark-ui/solid'
import './index.scss'
const Basic = (props) => {
    const [Toaster, toast] = createToaster({
        placement: 'top-end',
        render(toast) {
            return (
                <Toast.Root>
                    <Toast.Title>{toast().title}</Toast.Title>
                    <Toast.Description>{toast().description}</Toast.Description>
                    <Toast.CloseTrigger data-type="primary">Close</Toast.CloseTrigger>
                </Toast.Root>
            )
        },
    })

    // createEffect(() =>
    //     toast().subscribe((toasts) => toasts.forEach((toast) => console.log('Toast:', toast))),
    // )

    const handleToast = (info: { title: string, description: string }) => {
        const id = toast().create(info)
    }
    props.ref({ open: handleToast })
    return (
        <Toaster />
    )
}

export default Basic