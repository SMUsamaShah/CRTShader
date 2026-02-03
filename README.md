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

## Example pixel art:

![2ltsqcbcyxe71](https://github.com/user-attachments/assets/fd6b7c01-edba-4bf0-96bc-a5baa59bf200)
![bsv19c9rxxe71](https://github.com/user-attachments/assets/35444e9b-c80a-4275-b95d-833665b4fa84)
![qzox2gzcyxe71](https://github.com/user-attachments/assets/ae76c980-97ac-4a29-ad3d-a1ae346c70df)
![3piomopdyxe71](https://github.com/user-attachments/assets/3541cc9b-6aa1-4e42-b756-147913dc47de)
![835dh4quoghd1](https://github.com/user-attachments/assets/6b2a197b-689b-47e3-aa2e-830ceb404055)
![e_sf47152001_3bda000b217c4cc798e6e3cae5be9018494107f8](https://github.com/user-attachments/assets/074ef62e-9768-4a7f-a9c9-14c5eaa12e9f)
![e_sf47152008_1b7d24f1d51b33df51f6e74ed7b1773324aedcab](https://github.com/user-attachments/assets/2cd21bd1-5adb-414b-9bef-3784940f8615)
![312242dc8480d6c7a6febc933639aacbbfee2923](https://github.com/user-attachments/assets/e8b05cb3-ebe4-4e0b-ac5b-6ffc10bbae29)
![0285ddd6be0c0c8bf4f04f80191aa0e2ba7371bf_2_690x388](https://github.com/user-attachments/assets/b99487cf-3e59-4280-ae3b-693dab273a3a)
![57e3a6b3d085ae054e2865b9a65b708786e46332](https://github.com/user-attachments/assets/237225d0-3e2b-4cb5-bec0-f3fe94166396)
![b7f6efb344d5feb587df46b927a52f041fe7e619](https://github.com/user-attachments/assets/6a9e4675-a222-4158-b9ed-927847cc0ec0)
![9b4aba2417fc9c0ba35c2bd8f0a2dab701c7ede1](https://github.com/user-attachments/assets/54a76c5a-a79b-4980-8121-371522ada57b)
![f3a90fe4ba59ded1d7aaa6f454833f0a403be836](https://github.com/user-attachments/assets/56eb9fc8-b83a-4532-ad20-f274ae9aacdf)
