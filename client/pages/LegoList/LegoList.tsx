import ViewForCustom from './ViewForCustom';
import ViewForFiles from './ViewForFiles';
import ViewForPackages from './ViewForPackages';
import { createSignal } from 'solid-js'
import { DTab } from '../../components'

export default () => {
  const [getActiveTab, setActiveTab] = createSignal(['json'])

  return (
    <div style="color:var(--vscode-sideBarSectionHeader-foreground)">
      <DTab.Root
        value={getActiveTab()}
        onValueChange={(e: any) => { setActiveTab(e.value) }}
        style='display: flex;flex-flow: column;height: 100vh;'
      >
        <DTab.List tabs={[
          { id: 'json', label: '自定义' },
          { id: 'workspace', label: '项目文件' },
          { id: 'npm', label: 'NPM包' },
        ]}></DTab.List>
        <DTab.Item value="workspace" style="flex: 1 1;overflow: auto;">
          <ViewForFiles></ViewForFiles>
        </DTab.Item>
        <DTab.Item value="npm" style="flex: 1 1;overflow: auto;">
          <ViewForPackages></ViewForPackages>
        </DTab.Item>
        <DTab.Item value="json" style="flex: 1 1;overflow: auto;">
          <ViewForCustom ></ViewForCustom>
        </DTab.Item>
      </DTab.Root>
    </div>
  );
};