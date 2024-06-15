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
function draw(nodes: any) {
    const groups = [...new Set(nodes.node?.map(item => item.group))].map(id => ({ data: { id, label: id } }))
    const newGroups = groups.map(group => {
        // item.data.parent = item.data.id;
        const parents = groups?.filter(other => group.data?.id?.includes?.(other.data.id))?.sort((a, b) => b.data.id.length - a.data.id.length);
        console.log('parents', group, parents, parents[1]?.data.id)
        return {
            data: {
                ...group.data,
                parent: parents[1]?.data.id || undefined
            }
        }
    })
    const relations = [
        ...(nodes.node?.map(data => ({ data })) || []),
        ...(nodes.line?.map(data => ({ data })) || [])
    ]
    
    relations.forEach(item => {
        console.log('item', item)
        item.data.parent = item.data.group || 'default';
    })
    relations.push(...newGroups)
    console.log('relations', relations, groups)

    if (!relations?.length) return;
    const clusters = Object.values(relations?.reduce((res, item) => {
        if (item.data.group) {
            res[item.data.group] = [...res?.[item.data.group] || [], item.data.id + ''];
        }
        return res;
    }, {}))
    console.log('clusters', clusters)
    cy = cytoscape({
        container: document.getElementById('cy'), // container to render in
        headless: false,
        elements: relations,
        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': 'black',
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
                selector: ':parent',
                style: {
                    'background-opacity': 0.2,
                    'background-color': '#2B65EC',
                    'border-color': '#2B65EC'
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
            name: 'dagre',
            // dagre algo options, uses default value on undefined
            // nodeSep: undefined, // the separation between adjacent nodes in the same rank
            // edgeSep: undefined, // the separation between adjacent edges in the same rank
            // rankSep: undefined, // the separation between each rank in the layout
            // rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
            // align: undefined,  // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
            // acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
            // // A feedback arc set is a set of edges that can be removed to make a graph acyclic.
            // ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
            // minLen: function (edge) { return 1; }, // number of ranks to keep between the source and target of the edge
            // edgeWeight: function (edge) { return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

            // // general layout options
            fit: true, // whether to fit to viewport
            // padding: 1, // fit padding
            // spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
            // nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
            // animate: false, // whether to transition the node positions
            // animateFilter: function (node, i) { return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
            // animationDuration: 500, // duration of animation in ms if enabled
            // animationEasing: undefined, // easing of animation if enabled
            // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            // transform: function (node, pos) { return pos; }, // a function that applies a transform to the final node position
            // ready: function () { }, // on layoutready
            // sort: undefined, // a sorting function to order the nodes and edges; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
            // // because cytoscape dagre creates a directed graph, and directed graphs use the node order as a tie breaker when
            // // defining the topology of a graph, this sort function can help ensure the correct order of the nodes/edges.
            // // this feature is most useful when adding and removing the same nodes and edges multiple times in a graph.
            // stop: function () { } // on layoutstop
        }
    });

    // cy.elements().forEach(function (element) {
    //     if (element.data('parent')) {
    //         var groupId = element.data('parent');
    //         // var group = cy.getElementById(groupId);
      
    //         element.move({ parent: groupId });
    //     }
    // });

    // cy.nodes().positions(function( node, i ){
    //     console.log('nodeee',node,)
    //     return {
    //       x: i * 100,
    //       y: 100
    //     };
    //   });
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
