const fs = require('fs');
const http = require('http');
const PDFParser = require('pdf-parse');
const url = require('url');

// Default port for the server
const port = 3000;

// Function to convert PDF to text
async function convertPdfToTxt(pdfUrl) {
  try {
    // Read PDF file from URL
    const pdfBuffer = await getPdfBuffer(pdfUrl);

    // Parse PDF
    const pdfData = await PDFParser(pdfBuffer);

    // Extract text from PDF data
    const text = pdfData.text;

    // Write text to a new file
    fs.writeFileSync('output.txt', text);

    console.log('Conversion completed. Text saved to output.txt');

    return text;
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    return null;
  }
}

// Helper function to fetch PDF buffer from URL
function getPdfBuffer(pdfUrl) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    https.get(pdfUrl, (response) => {
      let data = [];

      response.on('data', (chunk) => {
        data.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve(buffer);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to start HTTP server
function startServer() {
  http.createServer(async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const pdfUrl = queryObject.pdf;

    // Convert PDF to text and send JSON response
    if (pdfUrl) {
      const text = await convertPdfToTxt(pdfUrl);
      if (text) {
        const jsonData = { text_data: text };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(jsonData));
      } else {
        res.writeHead(500);
        res.end('Error: PDF conversion failed');
      }
    } else {
      res.writeHead(400);
      res.end('Error: PDF URL not provided');
    }
  }).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

// Start server
startServer();
