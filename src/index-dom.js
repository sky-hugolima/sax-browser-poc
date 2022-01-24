async function loadAndParseWithDOM() {
    log('loadAndParseWithDOM');
    const stopFpsMonitor = startRenderTimeMonitoring();
    const initialMemorySize = performance.memory.totalJSHeapSize;
    performance.mark('fetch_start');
    const response = await fetch('master.mpd');
    performance.mark('fetch_ready');
    const xml = await response.text();
    performance.mark('response_done');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const representationCount = doc.querySelectorAll('Representation').length;
    performance.mark('parser_done');
    const finalMemorySize = performance.memory.totalJSHeapSize;
    stopFpsMonitor();

    log('time until fetch ready (MS): ', performance.measure('fetch_time', 'fetch_start', 'fetch_ready').duration);
    log('download complete (MS): ', performance.measure('download_complete', 'fetch_ready', 'response_done').duration);
    log('parsing time (MS): ', performance.measure('parsing_time', 'response_done', 'parser_done').duration);
    log('JS heap increase - not including DOM (MB): ', (finalMemorySize - initialMemorySize) / 1024 / 1024);
    log('Representation elements included in document: ', representationCount);
    log('Animation FPS: ', performance.getEntriesByName('fps').map(m => m.detail).join(',') || 'took less than a second');
}

loadAndParseWithDOM();
