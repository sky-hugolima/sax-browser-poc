export function log(...messages) {
  messages.forEach((message) => {
    const txt = document.createTextNode(message);
    document.body.appendChild(txt);
  });
  document.body.appendChild(document.createElement("br"));
}

export function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function time() {
  return window.performance?.now() ?? new Date().getTime();
}

export function startRenderTimeMonitoring() {
  let stopped = false;
  let renderTimes = [];

  function captureRenderTime() {
    renderTimes.push(time());
    if (!stopped) {
      window.requestAnimationFrame(captureRenderTime);
    }
  }
  window.requestAnimationFrame(captureRenderTime);

  const handle = window.setInterval(() => {
    const now = time();
    const fps = renderTimes.filter((t) => t >= now - 1000).length;
    performance.mark("fps", {
      detail: fps,
    });
    renderTimes = [];
  }, 1000);

  return () => {
    stopped = true;
    window.clearInterval(handle);
  };
}
