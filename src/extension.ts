import * as vscode from 'vscode';
import { commands, ExtensionContext } from "vscode";
import { LegoListPanel } from "./panels/LegoListPanel";
import { LegoEditorPanel } from "./panels/LegoEditorPanel";
import { LegoHoverProvider } from './modules/CodeHoverProvider';
import { XMFile } from "./modules/XMFile"
export async function activate(context: ExtensionContext) {
  // Create the show hello world command
  // const showHelloWorldCommand = commands.registerCommand("xmouse.component.open", () => {
  //   HelloWorldPanel.render(context.extensionUri);
  // });

  // Add command to the extension context

  const xmFile = new XMFile()
  await xmFile.init();

  const legoListPanel = new LegoListPanel(context, xmFile.files)

  const legoEditorPanel = new LegoEditorPanel(context, xmFile.files);
  const legoHoverProvider = new LegoHoverProvider(context);
  legoHoverProvider.onClick = (hoverInfo) => {
    const component = xmFile.files.find(item => item.name === hoverInfo.name);
    if (!component) { return }
    legoEditorPanel.setComponent(component, hoverInfo.position);
  }
}
