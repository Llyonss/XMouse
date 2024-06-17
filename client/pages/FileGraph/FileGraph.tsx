
import { createSignal } from 'solid-js';
import { vscode } from "../../utilities/vscode";
import FileRelation from './FileRelation';
export default () => {
  const [getGraph, setGraph] = createSignal([])
  const [getCurrent, setCurrent] = createSignal('')
  // vscode.call('lego.relations', {}).then((res: any) => {
  //   console.log('resresres', res)
  //   setGraph(res)
  // })
  vscode.call('lego.fileTree', {}).then((res: any) => {
    console.log('resresres', res)
    setGraph({
      nodes: res.nodes,
      links: res.links,
      relations: res.relations,
    })
  })
  vscode.listenMessage('lego.current', (data: any) => {
    if (!data) { return }

    console.log('datadatadatadatadata', data)
    setCurrent(data)
  })

  function handleNodeClick(node) {
    console.log('click', node)
    vscode.call('lego.changeEditor', { id: node.id() })
  }
  return (
    <div style="color:var(--vscode-sideBarSectionHeader-foreground)">
      <FileRelation graph={getGraph()} current={getCurrent()} onNodeClick={handleNodeClick}></FileRelation>
    </div>
  );
};