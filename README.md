# CRTShader
An attempt at making perfect CRT shader so that all those example images look like they are on a real CRT. I don't know if it will be usable on games.
Here when loaded a pixel art image, ideally it should look like these real CRT render examples.

I have no deep knowledge of any of this, but having played old games on actual CRTs, I know they never looked like blocky pixels.

Before doing shader stuff, I am using https://github.com/Hugo-Dz/spritefusion-pixel-snapper to cleanup the input pixel art.

The WASM build and worker.js are downloaded from https://www.spritefusion.com/_app/immutable/workers/assets/spritefusion_pixel_snapper_bg-B54QY3P4.wasm and https://www.spritefusion.com/_app/immutable/workers/worker-DUJSSrcT.js

TODO
- [ ] pixel art shader
  - [x] RGB vertical pixels like CRT
    - [ ] RGB pixels alignment and gap settings
  - [ ] bloom? brightness? intensity? NTSC blur? bleed? noise? etc etc
  - [ ] Add lots of pixel art examples

