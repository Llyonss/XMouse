export default {
    Root(props) {
        return (<div data-scope="layout" data-part="root">{props.children}</div>)
    },
    Head(props) {
        return (<header data-scope="layout" data-part="head">{props.children}</header>)
    },
    Main(props) {
        return (<main data-scope="layout" data-part="main">{props.children}</main>)
    },
    Aside(props) {
        return (<aside data-scope="layout" data-part="aside">{props.children}</aside>)
    },
    Column(props) {
        return (<div data-scope="layout" data-part="column" style={props.style}>{props.children}</div>)
    },
    Row(props) {
        return (<div data-scope="layout" data-part="row" style={props.style}>{props.children}</div>)
    }
}