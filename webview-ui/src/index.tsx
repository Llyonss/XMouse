/* @refresh reload */
import { render } from "solid-js/web";
import FileRelation from "./pages/FileRelation";
import LegoEditor from "./pages/LegoEditor";
import LegoList from "./pages/LegoList";
if(document.getElementById("FileRelation"))
render(() => <FileRelation />, document.getElementById("FileRelation") as HTMLElement);

if(document.getElementById("LegoEditor"))
render(() => <LegoEditor />, document.getElementById("LegoEditor") as HTMLElement);

if(document.getElementById("LegoList"))
render(() => <LegoList />, document.getElementById("LegoList") as HTMLElement);
