<template>
    <div id="ai-1-5"></div>
</template>
<script setup>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { palette, paint, ink, arrow } from './palette.js';

const render = () => {
    const div = document.querySelector('#ai-1-5')

    d3.select(div).selectAll('*').remove()

    const svg = d3.select(div).append('svg').attr('viewBox', '0 0 800 420').attr('preserveAspectRatio', 'xMidYMin meet')

    svg.append("defs")
        .append("marker")
        .attr("id", "arrow-parse")
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

    const edge = (points, { dashed = false, both = false } = {}) => {
        const path = svg.append('path').attr('d', d3.line().x(d => d.x).y(d => d.y)(points)).attr('stroke', arrow).attr('fill', 'none').attr('marker-end', 'url(#arrow-parse)')
        if (dashed) path.attr('stroke-dasharray', '5 4')
        if (both) path.attr('marker-start', 'url(#arrow-parse)')
    }

    // a step our code has to do
    const step = (x, y, w, h, title, sub, { role = 'code', mono = false } = {}) => {
        svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 8).call(paint, role)
        text(x + w / 2, y + h / 2 + (sub ? -3 : 4), title, { size: 13, mono })
        if (sub) text(x + w / 2, y + h / 2 + 14, sub, { size: 10, fill: 'gray', mono: true })
    }

    // a decision, centered at (cx, cy)
    const decision = (cx, cy, hw, hh, title, sub) => {
        svg.append('path').attr('d', `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`).call(paint, 'code')
        text(cx, cy - 2, title, { size: 12 })
        text(cx, cy + 13, sub, { size: 10, fill: 'gray', mono: true })
    }

    const label = (x, y, value, anchor = 'middle') => text(x, y, value, { size: 10, anchor, fill: 'gray', mono: true })

    // the part a hosted API (or an inference server's tool parser) already does for us
    svg.append('path')
        .attr('d', 'M 155 22 L 790 22 L 790 110 L 445 110 L 445 225 L 210 225 L 210 110 L 155 110 Z')
        .attr('fill', palette.input.fill).attr('fill-opacity', 0.5)
        .attr('stroke', palette.input.stroke).attr('stroke-dasharray', '5 4')
    text(160, 14, 'done for you by hosted APIs, only your job with a raw self-hosted model', { size: 11, anchor: 'start', fill: 'gray' })
    text(452, 345, 'always our job', { size: 11, anchor: 'start', fill: 'gray' })

    // top row: read the stream until something looks like a tool call
    step(20, 40, 110, 50, 'LLM', 'token stream', { role: 'llm' })
    step(170, 40, 110, 50, 'read tokens')
    decision(375, 65, 80, 38, 'looks like', "starts with '{'?")
    step(480, 40, 120, 50, 'buffer tokens', "until matching '}'")
    step(640, 40, 140, 50, 'json.loads()', null, { mono: true })

    edge([{ x: 130, y: 65 }, { x: 168, y: 65 }])
    edge([{ x: 280, y: 65 }, { x: 293, y: 65 }])
    edge([{ x: 455, y: 65 }, { x: 478, y: 65 }])
    label(466, 58, 'yes')
    edge([{ x: 600, y: 65 }, { x: 638, y: 65 }])

    // regular text: just stream it and keep reading
    step(315, 165, 120, 50, 'stream as text', 'to the user', { role: 'output' })
    edge([{ x: 375, y: 103 }, { x: 375, y: 163 }])
    label(383, 135, 'no', 'start')
    edge([{ x: 315, y: 190 }, { x: 225, y: 190 }, { x: 225, y: 92 }])
    label(233, 140, 'next token', 'start')

    // is the parsed object a tool call?
    decision(710, 190, 70, 40, 'valid tool?', 'id, name, input')
    edge([{ x: 710, y: 90 }, { x: 710, y: 148 }])
    edge([{ x: 640, y: 190 }, { x: 437, y: 190 }])
    label(540, 182, 'no')

    // yes: run our function and send the result back
    step(640, 270, 140, 55, 'invoke function', 'tools[name](**input)')
    edge([{ x: 710, y: 230 }, { x: 710, y: 268 }])
    label(718, 252, 'yes', 'start')

    step(450, 270, 140, 55, 'wrap the result', 'tool_result + id')
    edge([{ x: 640, y: 297 }, { x: 592, y: 297 }])

    // feedback loop to the LLM
    edge([{ x: 450, y: 297 }, { x: 75, y: 297 }, { x: 75, y: 92 }], { dashed: true })
    label(260, 289, 'send back to LLM')

    // outside world
    step(660, 360, 100, 40, 'Order API', null)
    edge([{ x: 710, y: 327 }, { x: 710, y: 358 }], { dashed: true, both: true })
    text(700, 346, 'HTTP', { size: 11, anchor: 'end', fill: 'gray' })
}

onMounted(() => {
    render()
})
</script>

<style scoped>
#ai-1-5 {
    margin-top: 30px;
    margin-bottom: 30px;
    overflow-x: auto;
}

#ai-1-5 :deep(svg) {
    display: block;
    width: 100%;
    max-width: 800px;
    min-width: 560px;
    height: auto;
}
</style>
