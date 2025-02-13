const express = require('express');
const { parse } = require('csv-parse');
const multer = require('multer');
const upload = multer();
const app = express();
const port = process.env.PORT || 3001;  // Cambiar esta línea
const path = require('path');
const { captureCSVAsImage } = require('./ocr');

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});

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