import * as vscode from 'vscode';
import { commands, ExtensionContext } from "vscode";
import { LegoListPanel } from "./panels/LegoListPanel";
import { LegoEditorPanel } from "./panels/LegoEditorPanel";
import { FileRelationPanel } from './panels/FileRelationPanel';
import { XMFile } from "./modules/XMFile"
export async function activate(context: ExtensionContext) {
  const xmFile = new XMFile()
  await xmFile.init();
  console.log(xmFile);
  const legoListPanel = new LegoListPanel(context, xmFile.files)
  const legoEditorPanel = new LegoEditorPanel(context, xmFile.files)
  const fileRelationFile = new FileRelationPanel(context, xmFile.relations);
}
