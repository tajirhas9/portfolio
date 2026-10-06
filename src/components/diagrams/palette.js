// soft fills by role, shared by all diagrams so the same thing looks the same everywhere
export const palette = {
    input: { fill: '#eaf2fb', stroke: '#8fb0d6' },     // user / question
    knowledge: { fill: '#fbf3e4', stroke: '#d1b07a' }, // manual, chunks, vectors
    llm: { fill: '#f1edfa', stroke: '#a596d4' },
    output: { fill: '#ebf5ee', stroke: '#8bbd9c' },    // response
    code: { fill: '#f5f5f4', stroke: '#a8a8a8' },      // our app, external services
}

export const ink = '#333'
export const arrow = '#666'

export const paint = (selection, role) => selection.attr('fill', palette[role].fill).attr('stroke', palette[role].stroke)
