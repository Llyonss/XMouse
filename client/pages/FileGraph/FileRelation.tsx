import type { Component } from "solid-js";
import { createEffect, createSignal, onMount } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "../../utilities/vscode";
import cytoscape from 'cytoscape';

import cise from 'cytoscape-cise';
cytoscape.use(cise);
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

let cy: any = null;
function draw(nodes: any) {
    const relations = [
        ...(nodes.node?.map(data => ({ data })) || []),
        ...(nodes.line?.map(data => ({ data })) || [])
    ]
    console.log('relations', relations)

    if (!relations?.length) return;
    const clusters = Object.values(relations?.reduce((res, item) => {
        if (item.data.group) {
            res[item.data.group] = [...res?.[item.data.group] || [], item.data.id + ''];
        }
        return res;
    }, {}))

    cy = cytoscape({
        container: document.getElementById('cy'), // container to render in
        headless: false,
        elements: relations,
        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(label)',
                    'color': 'white'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: '.group',
                style: {
                    'background-color': 'rgba(2,2,2 ,0.4)',
                    'width': 100,
                    'height': 100,
                    'shape': 'rectangle',
                    'label': 'data(label)',
                    'color': 'white'
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
                    'color': 'yellow'
                }
            }
        ],
        layout: {
            name: 'cise',
            // allowNodesInsideCircle: true,
            // refresh: 1,
            clusters: clusters,
            nodeSeparation: 0.1,
            idealInterClusterEdgeLengthCoefficient: 4,
            idealInterClusterEdgeLength: 100,
        }
    });

    cy.elements().forEach(function (element) {

        if (element.data('group')) {
            var groupId = 'group-' + element.data('group');
            var group = cy.getElementById(groupId);

            if (!group.length) {
                group = cy.add({
                    group: 'nodes',
                    data: { id: groupId, label: element.data('group') },
                    classes: 'group',
                });
            }

            element.move({ parent: groupId });
        }
    });
}

const update = (current: any) => {
    const buffer: any[] = []
    const travelEffect = (node: any) => {
        node.outgoers().forEach(next => {
            if (buffer.includes(next.data('id'))) {
                return;
            }
            buffer.push(next.data('id'))
            next.addClass('effect')
            travelEffect(next)
        })
    }
    cy.elements().forEach(function (element) {
        element.removeClass('current')
        element.removeClass('effect')
    })

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
            draw(props.graph)
        })
        createEffect(() => {
            update(props.current)
        })
    })

    return (
        <div id="cy" style="width:100vw;height:100vh"></div>
    )
}

export default FileRelation;
