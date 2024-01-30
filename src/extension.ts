import * as vscode from 'vscode';
import { commands, ExtensionContext } from "vscode";
import { LegoEditorPanel } from "./panels/LegoEditorPanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  // const showHelloWorldCommand = commands.registerCommand("xmouse.component.open", () => {
  //   HelloWorldPanel.render(context.extensionUri);
  // });

  // Add command to the extension context
  new LegoEditorPanel(context)


  // const components = await ComponentsLoader.elementui(context);


}
