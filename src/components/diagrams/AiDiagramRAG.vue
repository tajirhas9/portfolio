<template>
    <div id="ai-1-2"></div>
</template>
<script setup>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { paint, arrow } from './palette.js';

const render = () => {
    const div = document.querySelector('#ai-1-2')

    d3.select(div).selectAll('*').remove()

    const svg = d3.select(div).append('svg').attr('viewBox', '0 0 800 340').attr('preserveAspectRatio', 'xMidYMin meet')

    // RAG layer
    svg.append('rect').attr('x', 145).attr('y', 75).attr('width', 485).attr('height', 260).attr('stroke', 'gray').attr('stroke-dasharray', '6 4').attr('fill', 'none')
    svg.append('text').attr('x', 155).attr('y', 95).attr('fill', 'gray').text('RAG')

    // Question
    svg.append('rect').attr('x', 20).attr('y', 20).attr('width', 100).attr('height', 60).call(paint, 'input')
    svg.append('text').attr('x', 70).attr('y', 55).attr("text-anchor", "middle").text('Question')

    // Product manual
    svg.append('rect').attr('x', 20).attr('y', 260).attr('width', 110).attr('height', 60).call(paint, 'knowledge')
    svg.append('text').attr('x', 75).attr('y', 285).attr("text-anchor", "middle").text('Product')
    svg.append('text').attr('x', 75).attr('y', 305).attr("text-anchor", "middle").text('Manual')

    // Chunk
    svg.append('rect').attr('x', 160).attr('y', 260).attr('width', 80).attr('height', 60).call(paint, 'knowledge')
    svg.append('text').attr('x', 200).attr('y', 295).attr("text-anchor", "middle").text('Chunk')

    // Embed
    svg.append('rect').attr('x', 270).attr('y', 260).attr('width', 80).attr('height', 60).call(paint, 'knowledge')
    svg.append('text').attr('x', 310).attr('y', 295).attr("text-anchor", "middle").text('Embed')

    // Vector DB
    svg.append('rect').attr('x', 380).attr('y', 260).attr('width', 100).attr('height', 60).call(paint, 'knowledge')
    svg.append('text').attr('x', 430).attr('y', 295).attr("text-anchor", "middle").text('Vector DB')

    // Semantic search
    svg.append('rect').attr('x', 380).attr('y', 140).attr('width', 100).attr('height', 60).call(paint, 'code')
    svg.append('text').attr('x', 430).attr('y', 165).attr("text-anchor", "middle").text('Semantic')
    svg.append('text').attr('x', 430).attr('y', 185).attr("text-anchor", "middle").text('Search')

    // Augment prompt
    svg.append('rect').attr('x', 515).attr('y', 85).attr('width', 100).attr('height', 70).call(paint, 'code')
    svg.append('text').attr('x', 565).attr('y', 115).attr("text-anchor", "middle").text('Augmented')
    svg.append('text').attr('x', 565).attr('y', 135).attr("text-anchor", "middle").text('Prompt')

    // LLM
    svg.append('rect').attr('x', 660).attr('y', 85).attr('width', 80).attr('height', 70).call(paint, 'llm')
    svg.append('text').attr('x', 700).attr('y', 125).attr("text-anchor", "middle").text('LLM')

    // Response
    svg.append('rect').attr('x', 660).attr('y', 240).attr('width', 80).attr('height', 60).call(paint, 'output')
    svg.append('text').attr('x', 700).attr('y', 275).attr("text-anchor", "middle").text('Response')


    // connections
    const curveFunc = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return d.x })
        .y(function (d) { return d.y })

    svg.append("defs")
        .append("marker")
        .attr("id", "arrow-rag")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)          // Places the point of coordinate adjustment
        .attr("refY", 5)
        .attr("markerWidth", 6)   // Width of the marker
        .attr("markerHeight", 6)  // Height of the marker
        .attr("orient", "auto-start-reverse") // Rotates with the path
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z") // A simple triangle path
        .attr("fill", arrow)

    const m2c = [{ x: 130, y: 290 }, { x: 158, y: 290 }]
    const c2e = [{ x: 240, y: 290 }, { x: 268, y: 290 }]
    const e2v = [{ x: 350, y: 290 }, { x: 378, y: 290 }]
    const s2v = [{ x: 430, y: 202 }, { x: 430, y: 258 }]
    const p2s = [{ x: 120, y: 65 }, { x: 300, y: 65 }, { x: 378, y: 165 }]
    const p2a = [{ x: 120, y: 35 }, { x: 450, y: 35 }, { x: 513, y: 110 }]
    const s2a = [{ x: 480, y: 170 }, { x: 545, y: 170 }, { x: 545, y: 157 }]
    const a2l = [{ x: 615, y: 120 }, { x: 658, y: 120 }]
    const l2r = [{ x: 700, y: 155 }, { x: 700, y: 238 }]

    for (const points of [m2c, c2e, e2v, p2s, p2a, s2a, a2l, l2r]) {
        svg.append('path').attr('d', curveFunc(points)).attr('stroke', arrow).attr('fill', 'none').attr('marker-end', 'url(#arrow-rag)')
    }

    // search sends the query vector down, vector db returns the nearest chunks
    svg.append('path').attr('d', curveFunc(s2v)).attr('stroke', arrow).attr('fill', 'none').attr('marker-start', 'url(#arrow-rag)').attr('marker-end', 'url(#arrow-rag)')

    svg.append('text').attr('x', 490).attr('y', 192).attr('font-size', 12).text('relevant chunks')
    svg.append('text').attr('x', 438).attr('y', 226).attr('font-size', 11).text('query vector ↓')
    svg.append('text').attr('x', 438).attr('y', 244).attr('font-size', 11).text('chunks ↑')
    svg.append('text').attr('x', 230).attr('y', 58).attr("text-anchor", "middle").attr('font-size', 11).text('embed question')
}

onMounted(() => {
    render()
})
</script>

<style scoped>
#ai-1-2 {
    margin-top: 50px;
    overflow-x: auto;
}

#ai-1-2 :deep(svg) {
    display: block;
    width: 100%;
    max-width: 800px;
    min-width: 560px;
    height: auto;
}
</style>
