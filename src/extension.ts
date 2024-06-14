import type { ExtensionContext } from 'vscode'
import { XMFile } from './modules/XMFile'
import LegoListPanel from './panels/LegoListPanel'
import FileGraphPanel from './panels/FileGraphPanel'
import Storage from './storage'

export async function activate(context: ExtensionContext) {
  (new Storage()).setContext(context)
  const xmFile = new XMFile()
  const legoListPanel = new LegoListPanel(context, xmFile)

  const fileGraph = new FileGraphPanel(context, xmFile)
}
