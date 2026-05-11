import ViewForCustom from './ViewForCustom';
import ViewForFiles from './ViewForFiles';
import ViewForPackages from './ViewForPackages';
import { createSignal } from 'solid-js'
import { DTab } from '../../components'
import './style.scss'

export default () => {
  const [getActiveTab, setActiveTab] = createSignal(['json'])

  return (
    <div class="lego-list">
      <DTab.Root
        value={getActiveTab()}
        onValueChange={(e: any) => { setActiveTab(e.value) }}
        style='display: flex;flex-flow: column;height: 100vh;'
      >
        <div class="lego-list__tab-bar">
          <div class="lego-list__tab-list">
            <DTab.List tabs={[
              { id: 'json', label: '自定义' },
              { id: 'workspace', label: '项目文件' },
              { id: 'npm', label: 'NPM包' },
            ]}></DTab.List>
          </div>
        </div>
        <DTab.Item value="workspace" class="lego-list__content">
          <ViewForFiles></ViewForFiles>
        </DTab.Item>
        <DTab.Item value="npm" class="lego-list__content">
          <ViewForPackages></ViewForPackages>
        </DTab.Item>
        <DTab.Item value="json" class="lego-list__content">
          <ViewForCustom ></ViewForCustom>
        </DTab.Item>
      </DTab.Root>
    </div>
  );
};