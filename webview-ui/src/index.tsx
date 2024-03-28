/* @refresh reload */
import { render } from "solid-js/web";
import FileRelation from "./pages/FileRelation";
import LegoEditor from "./pages/LegoEditor/LegoEditor";
import LegoList from "./pages/LegoList/LegoList";
import { Environment, useEnvironmentContext } from '@ark-ui/solid'
import 'cui-solid/src/theme/theme.less'
import './index.scss'
console.log('document',document)
if(document.getElementById("FileRelation"))
render(() => <FileRelation />, document.getElementById("FileRelation") as HTMLElement);

if(document.getElementById("LegoEditor"))
render(() => <LegoEditor />, document.getElementById("LegoEditor") as HTMLElement);

if(document.getElementById("LegoList"))
render(() =>  <Environment value={document}><LegoList /></Environment> , document.getElementById("LegoList") as HTMLElement);
