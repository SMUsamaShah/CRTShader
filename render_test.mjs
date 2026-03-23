import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'crt_viewer_v1.html');

const browser = await chromium.launch({ args: ['--enable-webgl', '--use-gl=swiftshader'] });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

await page.goto('file://' + htmlPath);

// Build a small pixel art in the page context and call loadPixelArt()
// We create a 24x24 pixel art with bright colors to exercise all effects
const pixelArtDataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 24; c.height = 24;
    const ctx = c.getContext('2d');

    // Dark background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 24, 24);

    // A simple warrior-like sprite using solid blocks
    const px = (x, y, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); };

    // Bright white sword (will show bloom)
    for (let i = 4; i < 20; i++) px(i, 12, '#ffffff');  // horizontal blade
    for (let j = 8; j < 18; j++) px(12, j, '#ffffff');  // vertical blade

    // Green body
    for (let y = 6; y < 18; y++)
        for (let x = 9; x < 15; x++)
            px(x, y, '#22cc44');

    // Orange arm patch
    for (let y = 8; y < 14; y++)
        for (let x = 6; x < 9; x++)
            px(x, y, '#cc6622');

    // Gray shield (bright-ish, will show some bloom)
    for (let y = 10; y < 16; y++)
        for (let x = 15; x < 19; x++)
            px(x, y, '#aaaaaa');

    // Red head detail
    px(11, 4, '#ff2222'); px(12, 4, '#ff2222'); px(13, 4, '#ff2222');
    px(11, 5, '#ff2222'); px(12, 5, '#ffaaaa'); px(13, 5, '#ff2222');

    // Blue legs
    for (let y = 18; y < 22; y++) {
        px(10, y, '#2244ff'); px(11, y, '#2244ff');
        px(13, y, '#2244ff'); px(14, y, '#2244ff');
    }

    return c.toDataURL('image/png');
});

// Inject and render
await page.evaluate((dataUrl) => {
    const img = new Image();
    img.onload = () => loadPixelArt(img);
    img.src = dataUrl;
}, pixelArtDataUrl);

await page.waitForTimeout(1500);  // let WebGL render

// Zoom in to 800% so scanlines, phosphor strips and bloom are all clearly visible
await page.evaluate(() => {
    const c = document.getElementById('crtCanvas');
    c.style.transform = 'scale(8)';
    c.style.transformOrigin = 'top left';
    document.getElementById('canvasContainer').style.height = '2000px';
    document.getElementById('canvasContainer').style.overflow = 'visible';
});
await page.waitForTimeout(200);

// Screenshot the canvas area at 4x zoom
const container = page.locator('#canvasContainer');
await container.screenshot({ path: 'crt_output_4x.png' });

// Also a normal-size screenshot for reference
const canvas = page.locator('#crtCanvas');
await canvas.screenshot({ path: 'crt_output.png' });

await browser.close();
console.log('Saved crt_output.png and crt_output_4x.png');
