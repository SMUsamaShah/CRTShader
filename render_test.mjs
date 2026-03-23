import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath  = resolve(__dirname, 'crt_viewer_v1.html');
const imgPath   = resolve(__dirname, 'reference_combined.jpg');
const b64       = readFileSync(imgPath).toString('base64');

async function renderWithParams(label, scale, params) {
    const browser = await chromium.launch({ args: ['--enable-webgl', '--use-gl=swiftshader'] });
    const page    = await browser.newPage();
    await page.setViewportSize({ width: 1800, height: 1200 });
    await page.goto('file://' + htmlPath);

    // Extract reference left-half
    const refDataUrl = await page.evaluate(async (b64) => {
        const src = new Image();
        await new Promise(r => { src.onload = r; src.src = `data:image/jpeg;base64,${b64}`; });
        const half = Math.floor(src.naturalWidth / 2);
        const c = document.createElement('canvas');
        c.width = half; c.height = src.naturalHeight;
        c.getContext('2d').drawImage(src, 0, 0, half, src.naturalHeight, 0, 0, half, src.naturalHeight);
        return c.toDataURL('image/png');
    }, b64);
    writeFileSync('reference_left.png', Buffer.from(refDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));

    // Downscale right-half to native resolution, set canvasScale, then feed shader
    await page.evaluate(async ({ b64, scale, params }) => {
        // Set canvas expansion = same as downscale factor (e.g. scale=5 → canvas 5× native)
        crtCanvasScale = scale;

        const src = new Image();
        await new Promise(r => { src.onload = r; src.src = `data:image/jpeg;base64,${b64}`; });
        const half = Math.floor(src.naturalWidth / 2);
        const tmp = document.createElement('canvas');
        tmp.width = half; tmp.height = src.naturalHeight;
        tmp.getContext('2d').drawImage(src, half, 0, half, src.naturalHeight, 0, 0, half, src.naturalHeight);
        const pa = new Image();
        await new Promise(r => { pa.onload = r; pa.src = tmp.toDataURL(); });

        const nW = Math.floor(pa.width / scale), nH = Math.floor(pa.height / scale);
        const sc = document.createElement('canvas'); sc.width = pa.width; sc.height = pa.height;
        sc.getContext('2d').drawImage(pa, 0, 0);
        const sp = sc.getContext('2d').getImageData(0, 0, pa.width, pa.height);
        const dc = document.createElement('canvas'); dc.width = nW; dc.height = nH;
        const dp = dc.getContext('2d').createImageData(nW, nH);
        for (let y = 0; y < nH; y++) for (let x = 0; x < nW; x++) {
            const si = (y * scale * pa.width + x * scale) * 4, di = (y * nW + x) * 4;
            dp.data[di]=sp.data[si]; dp.data[di+1]=sp.data[si+1];
            dp.data[di+2]=sp.data[si+2]; dp.data[di+3]=sp.data[si+3];
        }
        dc.getContext('2d').putImageData(dp, 0, 0);
        Object.assign(crtParams, params);
        const native = new Image();
        await new Promise(r => { native.onload = r; native.src = dc.toDataURL(); });
        loadPixelArt(native);
    }, { b64, scale, params });

    await page.waitForFunction(() => { const c = document.getElementById('crtCanvas'); return c && c.width > 10; }, { timeout: 10000 });
    await page.waitForTimeout(800);

    // Capture the WebGL canvas pixels directly by drawing to a 2D canvas
    // (avoids any HTML overlay that Playwright screenshot might include)
    const { dataUrl, canvasW, canvasH } = await page.evaluate(() => {
        const src = document.getElementById('crtCanvas');
        const dst = document.createElement('canvas');
        dst.width = src.width; dst.height = src.height;
        dst.getContext('2d').drawImage(src, 0, 0);
        return { dataUrl: dst.toDataURL('image/png'), canvasW: src.width, canvasH: src.height };
    });

    const shaderPath = `shader_${label}.png`;
    writeFileSync(shaderPath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    await browser.close();
    console.log(`  ${label}: scale=${scale} canvas=${canvasW}×${canvasH}  ${JSON.stringify(params)}`);
    return shaderPath;
}

async function makeSideBySide(leftPath, rightPath, outPath) {
    const lb64 = readFileSync(leftPath).toString('base64');
    const rb64 = readFileSync(rightPath).toString('base64');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const dataUrl = await page.evaluate(async ({ lb64, rb64 }) => {
        const load = b64 => new Promise(r => { const img = new Image(); img.onload = () => r(img); img.src = `data:image/png;base64,${b64}`; });
        const [l, r] = await Promise.all([load(lb64), load(rb64)]);
        const h = Math.max(l.height, r.height);
        const lw = Math.round(l.width*h/l.height), rw = Math.round(r.width*h/r.height);
        const c = document.createElement('canvas'); c.width = lw+rw+4; c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(l, 0, 0, lw, h); ctx.drawImage(r, lw+4, 0, rw, h);
        return c.toDataURL('image/png');
    }, { lb64, rb64 });
    writeFileSync(outPath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    await browser.close();
    console.log(`  comparison: ${outPath}`);
}

// Final best-match parameters.
// scale=5 → downscale right-half to native 120×135, canvas 600×675 (5× expansion)
// This matches the reference resolution and creates a slightly misaligned CRT grid
// (1.67 RGB triplets per game pixel) which looks authentic.
const finalParams = {
    rgbMaskStrength:   1.0,
    phosphorGap:       0.20,
    phosphorRoundness: 0.5,
    scanlineStrength:  0.97,
    bloomStrength:     2.5,
    bloomThreshold:    0.20,
};

console.log('Rendering final comparison...');
const pFinal = await renderWithParams('final', 5, finalParams);
await makeSideBySide('reference_left.png', pFinal, 'compare_final.png');
console.log('Done.');
