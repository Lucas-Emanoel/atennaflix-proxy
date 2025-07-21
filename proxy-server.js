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
  res.send('Servidor Proxy para AtennaFlix está a funcionar! (v2)');
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
    const targetUrl = new URL(req.query.url);
    proxyReq.setHeader('host', targetUrl.host);
    
    // --- MELHORIA PRINCIPAL ---
    // Adiciona cabeçalhos para simular um navegador real
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    proxyReq.setHeader('Referer', targetUrl.origin); // Informa a origem do pedido
    
    // Remove cabeçalhos que podem identificar o proxy
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-forwarded-host');
    proxyReq.removeHeader('x-forwarded-proto');
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
