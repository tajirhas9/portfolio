<template>
    <div class="ai-1-3-wrap">
        <label v-if="canAnimate" class="flow-toggle">
            <input type="checkbox" v-model="animate" />
            <span class="track" aria-hidden="true"></span>
            animate
        </label>
        <div id="ai-1-3"></div>
    </div>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';
import { paint, ink, arrow, palette } from './palette.js';

const STORAGE_KEY = 'diagram-animate'
const canAnimate = ref(false)
const animate = ref(true)
let flowControl = { setEnabled: () => {}, stop: () => {} }

watch(animate, (on) => {
    flowControl.setEnabled(on)
    try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0') } catch {}
})

const render = () => {
    const div = document.querySelector('#ai-1-3')

    d3.select(div).selectAll('*').remove()

    const svg = d3.select(div).append('svg').attr('viewBox', '0 0 800 730').attr('preserveAspectRatio', 'xMidYMin meet')

    svg.append("defs")
        .append("marker")
        .attr("id", "arrow-tool")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 9)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", arrow)

    const text = (x, y, value, { size = 12, anchor = 'middle', fill = ink, mono = false } = {}) => {
        const t = svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value)
        if (mono) t.attr('font-family', 'monospace')
        return t
    }

    const message = (x1, x2, y, dashed = false) => {
        const path = svg.append('path').attr('d', d3.line()([[x1, y], [x2, y]])).attr('stroke', arrow).attr('fill', 'none').attr('marker-end', 'url(#arrow-tool)')
        if (dashed) path.attr('stroke-dasharray', '5 4')
        flow.push(path.node())
    }

    // arrows in the order data travels, for the flow animation
    const flow = []

    // lifelines
    const USER = 50, SYSTEM = 220, LLM = 520, API = 740
    const lanes = [[USER, 'User', 'input'], [SYSTEM, 'System', 'code'], [LLM, 'LLM', 'llm'], [API, 'Order API', 'code']]
    for (const [x, name, role] of lanes) {
        svg.append('rect').attr('x', x - 45).attr('y', 20).attr('width', 90).attr('height', 40).call(paint, role)
        text(x, 45, name, { size: 14 })
        svg.append('line').attr('x1', x).attr('y1', 60).attr('x2', x).attr('y2', 720).attr('stroke', 'gray').attr('stroke-dasharray', '4 4')
    }
    text(SYSTEM, 75, '(our app)', { size: 11, fill: 'gray' })

    // LLM is busy only while generating: two separate inference calls
    svg.append('rect').attr('x', LLM - 6).attr('y', 165).attr('width', 12).attr('height', 170).call(paint, 'llm')
    svg.append('rect').attr('x', LLM - 6).attr('y', 560).attr('width', 12).attr('height', 80).call(paint, 'llm')

    // feedback loop frame
    svg.append('rect').attr('x', 195).attr('y', 182).attr('width', 590).attr('height', 410).attr('stroke', 'gray').attr('stroke-dasharray', '6 4').attr('fill', 'none')
    svg.append('path').attr('d', 'M 195 182 L 245 182 L 245 194 L 237 202 L 195 202 Z').attr('stroke', 'gray').attr('fill', 'none')
    text(220, 196, 'loop', { size: 11, fill: 'gray' })
    text(253, 196, 'while stop_reason == "tool_use"', { size: 11, fill: 'gray', anchor: 'start', mono: true })

    // 1. user asks
    text((USER + SYSTEM) / 2, 92, '1. Where is my', { size: 12 })
    text((USER + SYSTEM) / 2, 106, 'order #4521?', { size: 12 })
    message(USER, SYSTEM - 2, 115)

    // 2. system sends prompt + tool definitions
    text((SYSTEM + LLM) / 2, 137, '2. system prompt + RAG chunks + question', { size: 11, mono: true })
    text((SYSTEM + LLM) / 2, 151, '+ tools: [get_order_status(order_id)]', { size: 11, mono: true })
    message(SYSTEM, LLM - 8, 165)

    // 3 & 4. the LLM reasons inside the same generation
    const thought = (y, lines) => {
        const bubble = svg.append('rect').attr('x', 275).attr('y', y).attr('stroke-width', 1).attr('width', 220).attr('height', 46).attr('rx', 14).attr('stroke', palette.llm.stroke).attr('stroke-dasharray', '3 3').attr('fill', palette.llm.fill)
        svg.append('circle').attr('cx', 501).attr('cy', y + 23).attr('r', 3).attr('stroke', palette.llm.stroke).attr('fill', palette.llm.fill)
        svg.append('circle').attr('cx', 508).attr('cy', y + 23).attr('r', 1.5).attr('stroke', palette.llm.stroke).attr('fill', palette.llm.fill)
        lines.forEach((line, i) => text(385, y + 19 + i * 16, line, { size: 11, fill: '#444' }))
        // the dot stops on the LLM's bar beside each thought
        flow.push({ x: LLM, y: y + 23, wait: 1800, bubble })
    }
    thought(208, ['3. What am I missing?', 'Live status of #4521. Not in the manual.'])
    thought(260, ['4. How can I get it? I see', 'get_order_status in tools. Use it!'])

    // 5. LLM emits a structured tool call and stops
    text((SYSTEM + LLM) / 2, 324, '5. tool_use { id: "t1",', { size: 11, mono: true })
    text((SYSTEM + LLM) / 2, 338, 'name: "get_order_status",', { size: 11, mono: true })
    text((SYSTEM + LLM) / 2, 352, 'input: { order_id: "4521" } }', { size: 11, mono: true })
    message(LLM - 6, SYSTEM + 2, 362)
    text((SYSTEM + LLM) / 2, 377, 'stop_reason: "tool_use" (generation pauses)', { size: 11, fill: 'gray', mono: true })

    // 6. system acknowledges: parse + validate before running anything
    const validate = svg.append('path').attr('d', `M ${SYSTEM} 395 L ${SYSTEM + 35} 395 L ${SYSTEM + 35} 420 L ${SYSTEM + 2} 420`).attr('stroke', arrow).attr('fill', 'none').attr('marker-end', 'url(#arrow-tool)')
    flow.push(validate.node())
    text(SYSTEM + 45, 404, '6. parse + validate: tool exists, args match', { size: 11, anchor: 'start' })
    text(SYSTEM + 45, 418, 'schema, order belongs to this user', { size: 11, anchor: 'start' })

    // 7 & 8. system executes the tool against the real API
    text(370, 450, '7. GET /orders/4521', { size: 11, mono: true })
    message(SYSTEM, API - 2, 460)
    text(630, 475, 'API server → SQL', { size: 11, fill: 'gray' })

    text(370, 505, '8. { status: "shipped", eta: "Oct 8" }', { size: 11, mono: true })
    message(API, SYSTEM + 2, 515, true)

    // 9. result goes back as a new request with the whole conversation
    text((SYSTEM + LLM) / 2, 531, '9. history + tool_result', { size: 11, mono: true })
    text((SYSTEM + LLM) / 2, 545, '{ id: "t1", content }', { size: 11, mono: true })
    message(SYSTEM, LLM - 8, 560)
    text((SYSTEM + LLM) / 2, 578, 'new request, full context resent', { size: 11, fill: 'gray' })

    // 10. final answer
    text((SYSTEM + LLM) / 2, 620, '10. "Your order has shipped, arrives Oct 8."', { size: 11 })
    message(LLM - 6, SYSTEM + 2, 630)
    text((SYSTEM + LLM) / 2, 646, 'stop_reason: "end_turn"', { size: 11, fill: 'gray', mono: true })

    // 11. system relays the answer
    text((USER + SYSTEM) / 2, 685, '11. answer', { size: 12 })
    message(SYSTEM, USER + 2, 695)

    flowControl = animateFlow(div, svg, flow, animate.value)
}

// a single dot walks the arrows in order, sliding down lifelines between steps
const animateFlow = (div, svg, flow, enabled) => {

    const dot = svg.append('circle').attr('r', 4).attr('fill', palette.llm.stroke).attr('stroke', 'white').attr('stroke-width', 1.5).attr('opacity', 0).style('pointer-events', 'none')
    const SPEED = 0.12 // px per ms
    const GAP = 400 // ms of rest between steps
    let pos = null

    const move = (duration, at, next) => dot.transition('flow').duration(duration).ease(d3.easeCubicInOut)
        .attrTween('transform', () => t => { const p = at(t); pos = p; return `translate(${p.x},${p.y})` })
        .on('end', next)

    // slide in a straight line to `to`, then continue
    const goto = (to, next) => {
        const dist = Math.hypot(to.x - pos.x, to.y - pos.y)
        if (dist < 4) return next()
        const from = pos
        move(dist / SPEED, t => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }), next)
    }

    const rest = (ms, next) => dot.transition('flow').duration(ms).on('end', next)

    const step = (i) => {
        if (i === flow.length) {
            dot.transition('flow').delay(GAP).duration(500).attr('opacity', 0).transition().delay(2000).on('end', () => { pos = null; step(0) })
            return
        }
        const item = flow[i]

        // waypoint: pause here while the bubble softly highlights
        if (!(item instanceof SVGElement)) {
            goto(item, () => {
                item.bubble.transition('flow').duration(300).attr('stroke-width', 2)
                rest(item.wait, () => {
                    item.bubble.transition('flow').duration(300).attr('stroke-width', 1)
                    step(i + 1)
                })
            })
            return
        }

        const len = item.getTotalLength()
        const start = item.getPointAtLength(0)
        const travel = () => move(Math.max(1200, len / SPEED), t => item.getPointAtLength(t * len), () => rest(GAP, () => step(i + 1)))
        if (!pos) {
            dot.attr('transform', `translate(${start.x},${start.y})`).transition('flow').duration(400).attr('opacity', 1).on('end', travel)
            return
        }
        goto(start, travel)
    }

    // only run while enabled and the diagram is on screen
    let running = false, visible = false
    const sync = () => {
        const should = enabled && visible
        if (should && !running) {
            running = true
            pos = null
            step(0)
        } else if (!should && running) {
            running = false
            dot.interrupt('flow').transition('flow').duration(200).attr('opacity', 0)
            flow.forEach(item => item.bubble && item.bubble.interrupt('flow').attr('stroke-width', 1))
        }
    }
    const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        sync()
    }, { threshold: 0.3 })
    observer.observe(div)

    return {
        setEnabled: (on) => { enabled = on; sync() },
        stop: () => { observer.disconnect(); dot.interrupt('flow') },
    }
}

onMounted(() => {
    canAnimate.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    try { animate.value = localStorage.getItem(STORAGE_KEY) !== '0' } catch {}
    animate.value = animate.value && canAnimate.value
    render()
})

onBeforeUnmount(() => flowControl.stop())
</script>

<style scoped>
.ai-1-3-wrap {
    position: relative;
    margin-top: 50px;
}

.flow-toggle {
    position: absolute;
    top: -26px;
    right: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: gray;
    cursor: pointer;
    user-select: none;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.flow-toggle:hover,
.flow-toggle:focus-within {
    opacity: 1;
}

.flow-toggle input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.flow-toggle .track {
    position: relative;
    width: 22px;
    height: 12px;
    border-radius: 6px;
    background: #d6d6d6;
    transition: background 0.2s;
}

.flow-toggle .track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    transition: transform 0.2s;
}

.flow-toggle input:checked + .track {
    background: #a596d4;
}

.flow-toggle input:checked + .track::after {
    transform: translateX(10px);
}

.flow-toggle input:focus-visible + .track {
    outline: 2px solid #a596d4;
    outline-offset: 2px;
}

#ai-1-3 {
    overflow-x: auto;
}

#ai-1-3 :deep(svg) {
    display: block;
    width: 100%;
    max-width: 800px;
    min-width: 560px;
    height: auto;
}
</style>
