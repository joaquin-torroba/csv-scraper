const express = require('express');
const { parse } = require('csv-parse');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 3001;  // Usamos 3001 para no conflictuar con el otro proyecto
const path = require('path');
const { captureCSVAsImage } = require('./ocr');

// Middleware para procesar JSON
app.use(express.json());


// Endpoint para recibir CSV
const XLSX = require('xlsx');

app.post('/process-csv', upload.single('file'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const workbook = XLSX.read(fileBuffer);
        
        // Procesar cada hoja
        const result = {};
        const images = [];
        
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const csvData = XLSX.utils.sheet_to_csv(sheet);
            
            // Procesar CSV y generar imágenes
            const sheetImages = await captureCSVAsImage(csvData);
            images.push(...sheetImages);
            
            // Convertir a JSON
            result[sheetName] = XLSX.utils.sheet_to_json(sheet);
        }
        
        res.json({
            data: result,
            images: images
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});