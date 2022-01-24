function log(...messages) {
    messages.forEach(message => {
        const txt = document.createTextNode(message);
        document.body.appendChild(txt);
    });
    document.body.appendChild(document.createElement('br'));
}

function time() {
    return window.performance?.now() ?? new Date().getTime();
}

function startRenderTimeMonitoring() {
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
        const fps = renderTimes.filter(t => t >= now - 1000).length;
        performance.mark('fps', {
            detail: fps
        });
        renderTimes = [];
    }, 1000);

    return () => {
        stopped = true;
        window.clearInterval(handle);
    };
}
