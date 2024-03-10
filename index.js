const express = require('express');
const PDFParser = require('pdf-parse');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    const pdfUrl = req.query.pdfurl;

    if (!pdfUrl) {
        return res.status(400).send('PDF URL parameter missing');
    }

    axios.get(pdfUrl, { responseType: 'arraybuffer' })
        .then(response => {
            const buffer = Buffer.from(response.data, 'binary');
            return PDFParser(buffer);
        })
        .then(data => {
            res.send(data.text);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('An error occurred');
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
