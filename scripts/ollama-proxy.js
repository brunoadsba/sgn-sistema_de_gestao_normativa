const http = require('http');

const options = {
    hostname: 'localhost',
    port: 11434,
};

const server = http.createServer((req, res) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request started`);

    const proxyReq = http.request({
        ...options,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${proxyRes.statusCode} (${Date.now() - start}ms)`);
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on('error', (err) => {
        const duration = Date.now() - start;
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - Proxy Error after ${duration}ms:`, err);
        res.statusCode = 502;
        res.end('Bad Gateway');
    });
});

server.listen(11435, '0.0.0.0', () => {
    console.log('Ollama Proxy listening on 0.0.0.0:11435 -> localhost:11434');
});
