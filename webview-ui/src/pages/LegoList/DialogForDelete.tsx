import { createSignal, } from 'solid-js'
import { DDialog } from '../../components'
export default (props) => {
    let dialogRef = {};
    const [getData, setData] = createSignal({ name: '' })
    props?.ref?.({
        open(data: any) {
            setData(data)
            return dialogRef.open()
        }
    })
    return (
        <DDialog
            ref={dialogRef}
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
}