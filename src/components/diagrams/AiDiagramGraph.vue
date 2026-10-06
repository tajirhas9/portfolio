<template>
    <div id="ai-1-4"></div>
</template>
<script setup>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { paint, ink, arrow } from './palette.js';

const render = () => {
    const div = document.querySelector('#ai-1-4')

    d3.select(div).selectAll('*').remove()

    const svg = d3.select(div).append('svg').attr('viewBox', '0 70 800 445').attr('preserveAspectRatio', 'xMidYMin meet')

    svg.append("defs")
        .append("marker")
        .attr("id", "arrow-graph")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 9)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", arrow)

    const text = (x, y, value, { size = 12, anchor = 'middle', fill = ink, mono = false, bold = false } = {}) => {
        const t = svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value)
        if (mono) t.attr('font-family', 'monospace')
        if (bold) t.attr('font-weight', 'bold')
        return t
    }

    const curveFunc = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return d.x })
        .y(function (d) { return d.y })

    const edge = (points, { dashed = false, both = false } = {}) => {
        const path = svg.append('path').attr('d', curveFunc(points)).attr('stroke', arrow).attr('fill', 'none').attr('marker-end', 'url(#arrow-graph)')
        if (dashed) path.attr('stroke-dasharray', '5 4')
        if (both) path.attr('marker-start', 'url(#arrow-graph)')
    }

    // a graph node: a piece of our code
    const node = (x, y, w, h, title, sub, { mono = false, tag = null } = {}) => {
        svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 10).call(paint, 'code')
        text(x + w / 2, y + h / 2 - 2, title, { size: 14, bold: true })
        text(x + w / 2, y + h / 2 + 16, sub, { size: mono ? 10 : 11, fill: 'gray', mono })
        if (tag) text(x + 8, y + 16, tag, { size: 12, anchor: 'start', fill: 'gray' })
    }

    // something outside the harness that a node talks to
    const external = (x, y, w, h, label, role = 'code') => {
        svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).call(paint, role)
        text(x + w / 2, y + h / 2 + 5, label)
    }

    const oval = (cx, cy, rx, label) => {
        svg.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', rx).attr('ry', 20).call(paint, 'code')
        text(cx, cy + 4, label, { size: 11, mono: true })
    }

    // harness
    svg.append('rect').attr('x', 20).attr('y', 80).attr('width', 660).attr('height', 250).attr('stroke', 'gray').attr('stroke-dasharray', '6 4').attr('fill', 'none')
    text(30, 100, 'Harness (graph)', { anchor: 'start', fill: 'gray' })

    oval(65, 150, 35, 'START')
    text(65, 188, '(question)', { size: 11, fill: 'gray' })

    node(130, 115, 120, 70, 'retrieve', 'embed + search', { tag: '①' })
    node(300, 115, 120, 70, 'agent', 'call LLM')
    node(440, 245, 120, 60, 'tools', 'get_order_status', { mono: true, tag: '③' })

    // router: the conditional edge, decided by stop_reason
    svg.append('path').attr('d', 'M 500 115 L 555 150 L 500 185 L 445 150 Z').call(paint, 'code')
    text(500, 147, 'route', { size: 12 })
    text(500, 162, 'stop_reason', { size: 10, mono: true })
    text(452, 122, '②', { size: 12, fill: 'gray' })

    oval(630, 150, 30, 'END')
    text(630, 122, '④', { size: 12, fill: 'gray' })

    // Response
    svg.append('rect').attr('x', 700).attr('y', 125).attr('width', 80).attr('height', 50).call(paint, 'output')
    text(740, 155, 'Response')

    // fixed edges
    edge([{ x: 100, y: 150 }, { x: 128, y: 150 }])
    edge([{ x: 250, y: 150 }, { x: 298, y: 150 }])
    edge([{ x: 420, y: 150 }, { x: 443, y: 150 }])
    edge([{ x: 660, y: 150 }, { x: 698, y: 150 }])

    // conditional edges out of the router
    edge([{ x: 555, y: 150 }, { x: 598, y: 150 }])
    text(577, 140, 'end_turn', { size: 10, mono: true })
    edge([{ x: 500, y: 185 }, { x: 500, y: 243 }])
    text(508, 220, 'tool_use', { size: 10, anchor: 'start', mono: true })

    // tool result loops back into the agent
    edge([{ x: 440, y: 275 }, { x: 390, y: 275 }, { x: 390, y: 187 }])
    text(405, 225, 'tool_result', { size: 10, anchor: 'start', mono: true })

    // outside world
    text(30, 385, 'outside world', { size: 11, anchor: 'start', fill: 'gray' })
    external(140, 355, 100, 50, 'Vector DB', 'knowledge')
    external(310, 355, 100, 50, 'LLM', 'llm')
    external(450, 355, 100, 50, 'Order API')

    edge([{ x: 190, y: 187 }, { x: 190, y: 353 }], { dashed: true, both: true })
    text(182, 250, 'query ↓', { size: 11, anchor: 'end', fill: 'gray' })
    text(182, 266, 'chunks ↑', { size: 11, anchor: 'end', fill: 'gray' })

    edge([{ x: 360, y: 187 }, { x: 360, y: 353 }], { dashed: true, both: true })
    text(352, 250, 'prompt ↓', { size: 11, anchor: 'end', fill: 'gray' })
    text(352, 266, 'reply ↑', { size: 11, anchor: 'end', fill: 'gray' })

    edge([{ x: 500, y: 307 }, { x: 500, y: 353 }], { dashed: true, both: true })
    text(508, 322, 'SQL via API', { size: 11, anchor: 'start', fill: 'gray' })

    // indexing: done once, before any question comes in
    svg.append('rect').attr('x', 20).attr('y', 430).attr('width', 340).attr('height', 75).attr('stroke', 'gray').attr('stroke-dasharray', '6 4').attr('fill', 'none')
    text(28, 446, 'indexing (once)', { size: 11, anchor: 'start', fill: 'gray' })
    external(30, 452, 100, 45, 'Product Manual', 'knowledge')
    external(160, 452, 80, 45, 'Chunk', 'knowledge')
    external(270, 452, 80, 45, 'Embed', 'knowledge')
    edge([{ x: 130, y: 474 }, { x: 158, y: 474 }])
    edge([{ x: 240, y: 474 }, { x: 268, y: 474 }])
    edge([{ x: 310, y: 452 }, { x: 310, y: 420 }, { x: 190, y: 420 }, { x: 190, y: 407 }])
    text(255, 416, 'vectors', { size: 11, fill: 'gray' })

    // ties back to the list in the blog
    text(590, 364, '① RAG', { size: 11, anchor: 'start', fill: 'gray' })
    text(590, 380, '② stop-reason routing', { size: 11, anchor: 'start', fill: 'gray' })
    text(590, 396, '③ parse schema + invoke', { size: 11, anchor: 'start', fill: 'gray' })
    text(590, 412, '④ end_turn → reply', { size: 11, anchor: 'start', fill: 'gray' })
}

onMounted(() => {
    render()
})
</script>

<style scoped>
#ai-1-4 {
    margin-top: 50px;
    overflow-x: auto;
}

#ai-1-4 :deep(svg) {
    display: block;
    width: 100%;
    max-width: 800px;
    min-width: 560px;
    height: auto;
}
</style>
