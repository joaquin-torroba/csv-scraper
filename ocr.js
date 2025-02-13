const puppeteer = require('puppeteer');
const supabase = require('./supabase');

async function generateImage(content, index) {
    const fileName = `csv_${Date.now()}_section${index}.png`;
    
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        headless: true
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    await page.setContent(`
        <html>
            <body style="margin: 0; padding: 20px;">
                <pre style="white-space: pre-wrap;">${content}</pre>
            </body>
        </html>
    `);
    
    // Capturar screenshot como Buffer
    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();
    
    // Subir a Supabase
    const { data, error } = await supabase.storage
        .from('csv-images')
        .upload(fileName, screenshot, {
            contentType: 'image/png'
        });
        
    if (error) throw error;
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
        .from('csv-images')
        .getPublicUrl(fileName);
        
    return publicUrl;
}

// El resto del código sigue igual
async function captureCSVAsImage(csvData) {
    const ROWS_PER_SECTION = 50;
    const rows = csvData.split('\n');
    const headers = rows[0];
    const images = [];
    
    for (let i = 1; i < rows.length; i += ROWS_PER_SECTION) {
        const sectionRows = [headers, ...rows.slice(i, i + ROWS_PER_SECTION)];
        const sectionContent = sectionRows.join('\n');
        const imageUrl = await generateImage(sectionContent, Math.floor(i/ROWS_PER_SECTION));
        images.push(imageUrl);
    }
    
    return images;
}

module.exports = { captureCSVAsImage };