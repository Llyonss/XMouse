import { createSignal, } from 'solid-js'
import { DDialog as useDDialog } from '../../../components'
export default () => {
    const [getData, setData] = createSignal({ name: '' })
    const [DDialog, openDDialog] = useDDialog()
    const open = (data: any) => {
        setData(data)
        return openDDialog()
    }
    const Dialog = () => (
        <DDialog
            title={() => '删除组件'}
            content={() => `确定删除【${getData().name}】吗？`}
            footer={(close: () => {}) => (
                <>
                    <button data-type="primary" onclick={() => close(true)}>
                        确认
                    </button>
                    <button data-type="secondary" onclick={() => close(false)}>
                        取消
                    </button>
                </>
            )}
        />
    )
    return [Dialog, open]
}