import useDialogForAddLego from "./DialogForAddLego";
import useDialogForDelete from "./DialogForDelete";
import useDialogForExport from "./DialogForExport";
import useDialogForImport from "./DialogForImport";
import useDialogForMultiDelete from "./DialogForMultiDelete";
import { vscode } from "../../../utilities/vscode";

// 添加/编辑
export function withAdd(slots, legoGroupsStore) {
    const [DialogForAddLego, openDialogForAddLego] = useDialogForAddLego();
    const addLego = () => {
        openDialogForAddLego().then((item: any) => {
            vscode.postMessage({ command: 'lego.list.add', data: JSON.parse(JSON.stringify(item)) });
        })
    }
    const updateLego = (lego?: any) => {
        openDialogForAddLego(lego).then((item: any) => {
            vscode.postMessage({ command: 'lego.list.update', data: { old: JSON.parse(JSON.stringify(lego)), new: JSON.parse(JSON.stringify(item)) } });
        })
    }
    slots.dialog.push((<DialogForAddLego></DialogForAddLego>));
    slots.operate.push((<button onClick={() => { addLego() }}>添加组件</button>));
    slots.emptyButton.push((<button onClick={() => { addLego() }}>添加组件</button>));
    slots.itemMenu.push((item) => ({ id: 'edit', label: '编辑', onClick: () => { updateLego(item) } }));
    vscode.listenMessage('lego.list.add', () => { addLego() })
}
// 删除
export function withDelete(slots, legoGroupsStore) {
    const [DialogForDelete, openDialogForDelete] = useDialogForDelete();
    slots.dialog.push((<DialogForDelete></DialogForDelete>));
    slots.itemMenu.push((item) => ({
        id: 'delete', label: '删除', onClick: () => {
            openDialogForDelete(item).then(() => {
                vscode.postMessage({ command: 'lego.list.delete', data: JSON.parse(JSON.stringify(item)) });
            })
        }
    }));
}

// 导出
export function withExport(slots, legoGroupsStore) {
    const [DialogForExport, openDialogForExport] = useDialogForExport();
    slots.dialog.push((<DialogForExport></DialogForExport>));
    slots.operate.push((<button onClick={[openDialogForExport, legoGroupsStore]}>批量导出</button>));
    vscode.listenMessage('lego.list.export', (data: any) => {
        openDialogForExport(legoGroupsStore).then((list: any[]) => {
            navigator.clipboard.writeText(JSON.stringify(list)).then(() => {
                // toastRef.open({
                //     title: '导出成功！',
                //     description: '导出内容已经复制到剪贴板啦，去粘贴吧!',
                //     duration: 20000,
                // })
            })
        })
    })
}


// 导入
export function withImport(slots, legoGroupsStore) {
    const [DialogForImport, openDialogForImport] = useDialogForImport();
    slots.dialog.push((<DialogForImport></DialogForImport>));
    slots.operate.push((<button onClick={openDialogForImport}>导入配置</button>));
    vscode.listenMessage('lego.list.import', (data: any) => {
        openDialogForImport({}).then((list: any[]) => {
            vscode.postMessage({ command: 'lego.list.updateList', data: list });
        })
    })
}

// 批量删除
export function withMultiDelete(slots, legoGroupsStore) {
    const [DialogForMultiDelete, openDialogForMultiDelete] = useDialogForMultiDelete();
    const handleMultiDelete = () => {
        openDialogForMultiDelete(legoGroupsStore).then((deleteList: any) => {
            vscode.postMessage({ command: 'lego.list.deleteList', data: JSON.parse(JSON.stringify(deleteList)) });
        })
    }
    slots.dialog.push((<DialogForMultiDelete></DialogForMultiDelete>));
    slots.operate.push((<button onClick={handleMultiDelete}>批量删除</button>));
    vscode.listenMessage('lego.list.multi-delete', () => {
        handleMultiDelete()
    })
}
export default [withAdd, withDelete, withExport, withImport, withMultiDelete]