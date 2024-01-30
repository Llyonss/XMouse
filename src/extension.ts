import * as vscode from 'vscode';
import { commands, ExtensionContext } from "vscode";
import { LegoListPanel } from "./panels/LegoListPanel";
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

}
