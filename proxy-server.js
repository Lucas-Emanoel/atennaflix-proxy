const express = require('express');
const request = require('request');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxy', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('URL do vídeo não fornecida.');
    }

    const options = {
        url: videoUrl,
        headers: {
            'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            'Range': req.headers['range'] || '',
        }
    };

    // Faz o streaming diretamente
    req.pipe(request(options))
        .on('response', (response) => {
            res.statusCode = response.statusCode;
            res.set(response.headers);
        })
        .on('error', (err) => {
            console.error('Erro ao buscar o vídeo:', err);
            res.status(500).send('Erro ao buscar o vídeo.');
        })
        .pipe(res);
});

app.listen(PORT, () => {
    console.log(`Proxy rodando na porta ${PORT}`);
});
