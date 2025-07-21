/* Arquivo: proxy-server.js */

const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Habilita o CORS para todos os domínios
app.use(cors());

// Rota principal para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.send('Servidor Proxy para AtennaFlix está a funcionar! (v3 - Streaming)');
});

// Rota do proxy
app.get('/proxy', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('URL do vídeo não fornecida.');
    }

    try {
        const options = {
            url: videoUrl,
            // IMPORTANTE: Ignora o erro de certificado SSL inválido
            strictSSL: false, 
            headers: {
                // Passa os cabeçalhos do navegador do utilizador para parecer um pedido legítimo
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                'Range': req.headers.range || null // Essencial para o player poder avançar/retroceder o vídeo
            }
        };

        // Inicia o streaming: o pedido do seu app é "canalizado" para o servidor de vídeo,
        // e a resposta do servidor de vídeo é "canalizada" de volta para o seu app.
        req.pipe(request(options))
           .on('error', (err) => {
                console.error('Erro no streaming do vídeo:', err);
                if (!res.headersSent) {
                    res.status(500).send('Erro ao obter o vídeo.');
                }
           })
           .pipe(res);

    } catch (error) {
        console.error("Erro ao processar a URL do proxy:", error);
        res.status(500).send('URL inválida ou erro interno.');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy de streaming a ouvir na porta ${PORT}`);
});
