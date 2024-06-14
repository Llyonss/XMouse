
import { createSignal } from 'solid-js';
import { vscode } from "../../utilities/vscode";
import FileRelation from './FileRelation';
export default () => {
  const [getGraph, setGraph] = createSignal([])
  const [getCurrent, setCurrent] = createSignal('')
  vscode.call('lego.relations', {}).then((res: any) => {
    setGraph(res)
  })
  vscode.listenMessage('lego.current', (data: any) => {
    if (!data) { return }
    const index = getGraph()?.node?.findIndex((item: any) => {
      return item?.file?.replace("\\\\", "\\") === data
    })
    console.log('index', index)
    setCurrent(index + '')
  })
  return (
    <div style="color:var(--vscode-sideBarSectionHeader-foreground)">
      <FileRelation graph={getGraph()} current={getCurrent()} ></FileRelation>
    </div>
  );
};