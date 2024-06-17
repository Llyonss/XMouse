import type { Component } from "solid-js";
import { createEffect, createSignal, onMount } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../utilities/vscode";
import cytoscape from 'cytoscape';

import cise from 'cytoscape-cise';

import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';
import force from 'cytoscape-d3-force'

cytoscape.use(dagre);
cytoscape.use(fcose);

cytoscape.use(force);
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

let cy: any = null;
function draw({ nodes, links, relations }, props) {

    const elements = [
        ...(nodes?.map(data => ({
            data: {
                id: data.id,
                label: data.label,
                type: data.type,
            }
        })) || []),
        ...(links?.map(data => ({
            data: {
                source: data.from,
                target: data.to,
                type: 1,
            }
        })) || []),
    ]

    cy = cytoscape({
        container: document.getElementById('cy'), // container to render in
        headless: false,
        elements: elements,
        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#678F8D',
                    'label': 'data(label)',
                    'color': 'white',
                    'z-index': 100,
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                }
            },

            {
                selector: '.current',
                style: {
                    'background-color': 'red',
                    'color': 'red'
                }
            },
            {
                selector: '.effect',
                style: {
                    'background-color': 'yellow',
                    'color': 'yellow',
                }
            }, {
                selector: "edge[type = 2]",
                style: {
                    'width': 1,
                    'line-color': '#678F8D',
                    'mid-target-arrow-color': '#678F8D',
                    'mid-target-arrow-shape': 'triangle',
                }
            },
            {
                selector: "node[type = 2]",
                style: { "background-color": "white", 'width': '10px', 'height': '10px', 'font-size': '70px', 'font-weight': 'bold', 'color': 'rgba(255,255,255,0.5)' }
            },
            {
                selector: "node[type = 3]",
                style: { "background-color": "white", 'width': '80px', 'height': '80px', 'font-size': '100px', 'font-weight': 'bold', 'color': 'rgba(255,255,255,0.5)' }
            }
        ],
        layout: {
            name: 'd3-force',
            animate: true,
            fixedAfterDragging: false,
            linkId: function id(d) {
                return d.id;
            },
            linkDistance: 100,
            manyBodyStrength: -2000,
            ready: function () { },
            stop: function () { },
            tick: function (progress) {
                console.log('progress - ', progress);
            },
            randomize: false,
            infinite: true // some more options here...
        }
    });

    relations?.forEach(edge => {
        try {
            cy.add({
                data: {
                    type: 2,
                    target: edge.to,
                    source: edge.from,
                }
            })
        } catch (e) {
            console.log(edge, e)
        }


    })
    cy.on('click', 'node', function (evt) {
        console.log('clicked ' + this.id(), evt);
        props?.onNodeClick?.(this)
    });

}



const update = (current: any) => {
    const buffer: any[] = []
    const travelEffect = (node: any, level = 0) => {
        node.outgoers().forEach(next => {
            if (buffer.includes(next.data('id'))) {
                return;
            }
            if (next.data('type') !== 1) {
                return;
            }
            buffer.push(next.data('id'))

            next.addClass('effect')
            const colors = ['red', 'yellow', 'blue', 'green', '#00FFFF', '#8080C0']
            node.style({ 'background-color': colors[level] })
            node.edgesTo(next).style({ 'line-color': colors[level], 'mid-target-arrow-color': colors[level], 'width': 5, 'z-index': '1' })

            console.log('nextnext', next, node.edgesTo(next))
            travelEffect(next, level + 1)
        })
    }
    cy.nodes('.current').style({ 'background-color': '#678F8D' })
    cy.nodes('.effect').style({ 'background-color': '#678F8D' })
    cy.nodes().removeClass('current');
    cy.nodes().removeClass('effect');
    cy.nodes().style({ 'background-color': '#678F8D' })
    cy.edges("[type = 2]").style({ 'line-color': '#678F8D', 'mid-target-arrow-color': '#678F8D', 'width': 1, 'z-index': 'unset' })
    // console.log("cy.edges('[type = 2]')", cy.edges(),cy.edges('[type = 2]'))
    cy.elements().forEach(function (element) {
        if (element.data('id') === current) {
            travelEffect(element)
            element.addClass('current')
            element.removeClass('effect')
        }
    })
}


const FileRelation = (props: { graph: any, current: any }) => {
    onMount(() => {
        createEffect(() => {
            draw(props.graph, props)
        })
        createEffect(() => {
            update(props.current)
        })

    })

    return (
        <>
            <div id="cy" style="width:100vw;height:100vh"></div>

        </>
    )
}

export default FileRelation;
