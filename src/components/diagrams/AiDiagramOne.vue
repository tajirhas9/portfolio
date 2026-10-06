<template>
    <div id="ai-1-1"></div>
</template>
<script setup>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { paint, arrow } from './palette.js';

const render = () => {
    const div = document.querySelector('#ai-1-1')

    d3.select(div).selectAll('*').remove()

    const svg = d3.select(div).append('svg').attr('viewBox', '0 0 800 280').attr('preserveAspectRatio', 'xMidYMin meet')

    // Product manual
    svg.append('rect').attr('x', 50).attr('y', 20).attr('width', 150).attr('height', 90).call(paint, 'knowledge')
    svg.append('text').attr('x', 125).attr('y', 70).attr("text-anchor", "middle").text('Product Manual')

    // Question
    svg.append('rect').attr('x', 50).attr('y', 165).attr('width', 150).attr('height', 90).call(paint, 'input')
    svg.append('text').attr('x', 125).attr('y', 215).attr("text-anchor", "middle").text('Question')

    // Prompt: manual first (static prefix, can be cached), question after
    svg.append('text').attr('x', 375).attr('y', 30).attr("text-anchor", "middle").text('Prompt')
    svg.append('rect').attr('x', 290).attr('y', 40).attr('width', 170).attr('height', 90).call(paint, 'knowledge')
    svg.append('text').attr('x', 375).attr('y', 82).attr("text-anchor", "middle").text('Product Manual')
    svg.append('text').attr('x', 375).attr('y', 102).attr("text-anchor", "middle").attr('font-size', 12).attr('fill', 'gray').text('(cached prefix)')
    svg.append('rect').attr('x', 290).attr('y', 130).attr('width', 170).attr('height', 90).call(paint, 'input')
    svg.append('text').attr('x', 375).attr('y', 180).attr("text-anchor", "middle").text('Question')

    // LLM
    svg.append('rect').attr('x', 530).attr('y', 80).attr('width', 100).attr('height', 100).call(paint, 'llm')
    svg.append('text').attr('x', 580).attr('y', 135).attr("text-anchor", "middle").text('LLM')

    // Response
    svg.append('rect').attr('x', 680).attr('y', 80).attr('width', 100).attr('height', 100).call(paint, 'output')
    svg.append('text').attr('x', 730).attr('y', 135).attr("text-anchor", "middle").text('Response')


    // connections
    const curveFunc = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return d.x })
        .y(function (d) { return d.y })

    svg.append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)          // Places the point of coordinate adjustment
        .attr("refY", 5)
        .attr("markerWidth", 6)   // Width of the marker
        .attr("markerHeight", 6)  // Height of the marker
        .attr("orient", "auto-start-reverse") // Rotates with the path
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z") // A simple triangle path
        .attr("fill", arrow)

    const m2p = [{ x: 200, y: 65 }, { x: 288, y: 85 }]
    const q2p = [{ x: 200, y: 210 }, { x: 288, y: 175 }]
    const p2l = [{ x: 460, y: 130 }, { x: 528, y: 130 }]
    const l2r = [{ x: 630, y: 130 }, { x: 678, y: 130 }]

    for (const points of [m2p, q2p, p2l, l2r]) {
        svg.append('path').attr('d', curveFunc(points)).attr('stroke', arrow).attr('fill', 'none').attr('marker-end', 'url(#arrow)')
    }
}

onMounted(() => {
    render()
})
</script>

<style scoped>
#ai-1-1 {
    margin-top: 50px;
    overflow-x: auto;
}

#ai-1-1 :deep(svg) {
    display: block;
    width: 100%;
    max-width: 800px;
    min-width: 560px;
    height: auto;
}
</style>
