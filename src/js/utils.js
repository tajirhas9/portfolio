export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        timeZone: "UTC",
    })
}
