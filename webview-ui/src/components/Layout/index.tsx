import './index.scss'
export default {
    Root(props: any) {
        return (<div data-scope="layout" data-part="root">{props.children}</div>)
    },
    Head(props: any) {
        return (<header data-scope="layout" data-part="head">{props.children}</header>)
    },
    Main(props: any) {
        return (<main data-scope="layout" data-part="main">{props.children}</main>)
    },
    Aside(props: any) {
        return (<aside data-scope="layout" data-part="aside">{props.children}</aside>)
    },
    Column(props: any) {
        return (<div data-scope="layout" data-part="column" style={props.style}>{props.children}</div>)
    },
    Row(props: any) {
        return (<div data-scope="layout" data-part="row" style={props.style}>{props.children}</div>)
    }
}