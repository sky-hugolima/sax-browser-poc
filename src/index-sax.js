async function loadAndParseWithSAX() {
    log('loadAndParseWithSAX');
    const stopFpsMonitor = startRenderTimeMonitoring();
    const initialMemorySize = performance.memory.totalJSHeapSize;
    performance.mark('fetch_start');
    const response = await fetch('master.mpd');
    performance.mark('fetch_ready');

    const reader = response.body.getReader();
    const parser = sax.parser(true);
    const textDecoder = new TextDecoder();

    let representationCount = 0;

    parser.onopentag = (node) => {
        if (node.name === 'Representation') {
            representationCount++;
        }
    };

    const pump = async () => {
        const r = await reader.read();
        if (r.done) {
            parser.close();
            performance.mark('parser_done');
            return;
        }
        const str = textDecoder.decode(r.value);
        parser.write(str);
        
        await pump();
    };

    await pump();
    stopFpsMonitor();

    const finalMemorySize = performance.memory.totalJSHeapSize;

    log('Time until fetch ready (MS): ', performance.measure('fetch_time', 'fetch_start', 'fetch_ready').duration);
    log('Stream parsing time (MS): ', performance.measure('parsing_time', 'fetch_ready', 'parser_done').duration);
    log('JS heap increase - not including DOM (MB): ', (finalMemorySize - initialMemorySize) / 1024 / 1024);
    log('Representation elements included in document: ', representationCount);
    log('Animation FPS: ', performance.getEntriesByName('fps').map(m => m.detail).join(',') || 'took less than a second');
}


loadAndParseWithSAX();
