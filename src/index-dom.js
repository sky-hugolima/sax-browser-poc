async function loadAndParseWithDOM() {
  log("loadAndParseWithDOM");
  const stopFpsMonitor = startRenderTimeMonitoring();
  const initialMemorySize = performance.memory.totalJSHeapSize;
  const initialUsedMemorySize = performance.memory.usedJSHeapSize;
  performance.mark("fetch_start");
  const response = await fetch("master.mpd");
  performance.mark("fetch_ready");
  const xml = await response.text();
  performance.mark("response_done");
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const representationCount = doc.querySelectorAll("Representation").length;
  performance.mark("parser_done");
  stopFpsMonitor();
  const finalMemorySize = performance.memory.totalJSHeapSize;
  const finalUsedMemorySize = performance.memory.usedJSHeapSize;

  log("-----------------------Fetch times------------------------------");
  // log('Time until fetch ready (MS): ', performance.measure('fetch_time', 'fetch_start', 'fetch_ready').duration /1000);
  // log('Download complete (MS): ', performance.measure('download_complete', 'fetch_ready', 'response_done').duration /1000);
  // log('Parsing time (MS): ', performance.measure('parsing_time', 'response_done', 'parser_done').duration /1000);

  log("-----------------------Stats------------------------------");
  log(
    "JS heap increase - used memory not including DOM (MB): ",
    formatBytes(finalUsedMemorySize - initialUsedMemorySize)
  );
  log(
    "JS heap increase - not including DOM (MB): ",
    formatBytes(finalMemorySize - initialMemorySize)
  );
  log("Representation elements included in document: ", representationCount);
  log(
    "Animation FPS: ",
    performance
      .getEntriesByName("fps")
      .map((m) => JSON.stringify(m))
      .join(",") || "took less than a second"
  );
  log("-----------------------------------------------------");
}

loadAndParseWithDOM();
// const fetchAndLoad = setInterval(() => {
//     loadAndParseWithDOM();
// },500)

// setTimeout(() => {
//     clearInterval(fetchAndLoad)
//     // performance.clearMarks();
//     // performance.clearMeasures();
// },5000)
