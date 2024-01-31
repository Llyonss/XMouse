import type { Component } from "solid-js";
import { createSignal, onMount } from 'solid-js'
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
import { vscode } from "./utilities/vscode";
import "./App.css";
import cytoscape from 'cytoscape';

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());


const FileRelation: Component = () => {
  const [getRelation, setRelation] = createSignal([])
  vscode.listenMessage('relation', (data: any) => {
    setRelation(data)
    draw(getRelation())
  })
  onMount(() => {
    draw(getRelation())
  })
  function draw(relations) {
    console.log(relations);
    var cy = cytoscape({
      container: document.getElementById('cy'), // container to render in
      headless: false,
      elements: relations?.map(data => ({ data })) || [],
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
        }
      ],
      layout: {
        name: 'cose',

        /**
        clusters: Object.values(relations?.reduce((res,item)=>{
          if(item.group){
            res[item.group] = [...res?.[item.group]||[],item.id ];
          }
          return res;
        },{})),
        padding:5,
        nodeSeparation:5,
        **/
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
            position: { x: Math.random() * 300, y: Math.random() * 300 },
            classes: 'group',
          });
        }

        element.move({ parent: groupId });
      }
    });
  }
  return (
    <div id="cy"></div>
  )
}

export default FileRelation;
