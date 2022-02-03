import { startRenderTimeMonitoring, log } from "./utils";
const fetchStream = require("fetch-readablestream");
const Saxophone = require("saxophone");

export async function loadAndParseWithSAX() {
  log("loadAndParseWithSAX");
  const stopFpsMonitor = startRenderTimeMonitoring();
  const initialMemorySize = performance.memory.totalJSHeapSize;
  const initialUsedMemorySize = performance.memory.usedJSHeapSize;
  performance.mark("fetch_start");
  const response = await fetchStream("master.mpd");
  console.log("response", response);
  performance.mark("fetch_ready");
  const reader = response.body.getReader();
  const parser = new Saxophone();
  const textDecoder = new TextDecoder();

  let representationCount = 0;

  // Called whenever an opening tag is found in the document,
  // such as <example id="1" /> - see below for a list of events
  parser.on("tagopen", (tag) => {
    if (tag.name === "Representation") {
      console.log(
        `Open tag "${tag.name}" with attributes: ${JSON.stringify(
          Saxophone.parseAttrs(tag.attrs)
        )}.`
      );
      representationCount++;
    }
  });

  // Called when we are done parsing the document
  parser.on("finish", () => {
    console.log("Parsing finished.");
  });

  const pump = async () => {
    const r = await reader.read();
    if (r.done) {
      parser.end();
      performance.mark("parser_done");
      return;
    }
    const str = textDecoder.decode(r.value);
    // Triggers parsing - remember to set up listeners before
    // calling this method
    parser.write(str);

    await pump();
  };

  await pump();
  stopFpsMonitor();

  const finalMemorySize = performance.memory.totalJSHeapSize;
  const finalUsedMemorySize = performance.memory.usedJSHeapSize;

  log("-----------------------Fetch times------------------------------");
  log(
    "Time until fetch ready (MS): ",
    performance.measure("fetch_time", "fetch_start", "fetch_ready").duration
  );
  log(
    "Stream parsing time (MS): ",
    performance.measure("parsing_time", "fetch_ready", "parser_done").duration /
      1000
  );

  log("-----------------------Stats------------------------------");
  log(
    "JS heap increase - UsedMemorySize (MB): ",
    (finalUsedMemorySize - initialUsedMemorySize) / Math.pow(1024, 2)
  );
  log(
    "JS heap increase - totalJSHeapSize not including DOM (MB): ",
    (finalMemorySize - initialMemorySize) / Math.pow(1024, 2)
  );
  log("Representation elements included in document: ", representationCount);
  log(
    "Animation FPS: ",
    performance
      .getEntriesByName("fps")
      .map((m) => m.detail)
      .join(",") || "took less than a second"
  );
  log("-----------------------------------------------------");
}

// const fetchAndLoad = setInterval(() => {
//   loadAndParseWithSAX();
// }, 500);

// setTimeout(() => {
//   clearInterval(fetchAndLoad);
//   // performance.clearMarks();
//   // performance.clearMeasures();
// }, 7000);
