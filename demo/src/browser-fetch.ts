// Browser-compatible fetch shim for undici
export const fetch = window.fetch.bind(window);
export { fetch as default };