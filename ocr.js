const puppeteer = require('puppeteer');
const path = require('path');

async function generateImage(content, index) {
    const imageName = `csv_${Date.now()}_section${index}.png`;
    const imagePath = path.join(__dirname, 'public/images', imageName);
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    await page.setContent(`
        <html>
            <body style="margin: 0; padding: 20px;">
                <pre style="white-space: pre-wrap;">${content}</pre>
            </body>
        </html>
    `);
    
    await page.screenshot({ path: imagePath, fullPage: true });
    await browser.close();
    
    return imageName;
}

async function captureCSVAsImage(csvData) {
    const ROWS_PER_SECTION = 50;  // Ajustable según necesidad
    const rows = csvData.split('\n');
    const headers = rows[0];
    const images = [];
    
    // Dividir en secciones
    for (let i = 1; i < rows.length; i += ROWS_PER_SECTION) {
        const sectionRows = [headers, ...rows.slice(i, i + ROWS_PER_SECTION)];
        const sectionContent = sectionRows.join('\n');
        const imageName = await generateImage(sectionContent, Math.floor(i/ROWS_PER_SECTION));
        images.push(imageName);
    }
    
    return images;  // Devuelve array de nombres de imágenes
}

module.exports = { captureCSVAsImage };