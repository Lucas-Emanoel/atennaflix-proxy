/* Arquivo: proxy-server.js */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Habilita o CORS para que seu app possa acessar o proxy
app.use(cors());

// Rota principal para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.send('Servidor Proxy para AtennaFlix está a funcionar!');
});

// O proxy em si
const videoProxy = createProxyMiddleware({
  router: (req) => {
    // Pega a URL do vídeo a partir do parâmetro "?url="
    const targetUrl = new URL(req.query.url);
    return targetUrl.origin;
  },
  pathRewrite: (path, req) => {
    // Reescreve o caminho para o caminho original do vídeo
    const targetUrl = new URL(req.query.url);
    return targetUrl.pathname + targetUrl.search;
  },
  changeOrigin: true,
  // IMPORTANTE: Esta linha ignora o erro de certificado SSL inválido
  secure: false, 
  onProxyReq: (proxyReq, req, res) => {
    // Define o cabeçalho 'host' para o do servidor de vídeo original
    const targetUrl = new URL(req.query.url);
    proxyReq.setHeader('host', targetUrl.host);
  },
  onError: (err, req, res) => {
    console.error('Erro no proxy:', err);
    res.status(500).send('Erro no proxy. Verifique os logs.');
  }
});

// Aplica o middleware do proxy à rota /proxy
app.use('/proxy', videoProxy);

app.listen(PORT, () => {
  console.log(`Servidor proxy a ouvir na porta ${PORT}`);
});

/* -------------------------------------------------- */

/* Arquivo: package.json */

{
  "name": "atennaflix-proxy",
  "version": "1.0.0",
  "description": "Proxy para contornar problemas de SSL e CORS para o AtennaFlix",
  "main": "proxy-server.js",
  "scripts": {
    "start": "node proxy-server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  }
}

