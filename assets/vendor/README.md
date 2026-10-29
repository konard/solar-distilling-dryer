# Local Three.js distribution

Unmodified Three.js **0.128.0** (r128), matching the original website's rendering API, is vendored so the site works without a CDN or npm install. These are third-party distribution files, excluded from project formatting/linting. The `min.js` suffix identifies distribution code; OrbitControls is the upstream unminified distribution.

- `three-r128.min.js`: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- `OrbitControls-r128.min.js`: https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js
- `THREE-LICENSE.txt`: https://cdn.jsdelivr.net/npm/three@0.128.0/LICENSE (MIT)

SHA-256:

```text
9274bbcec8d96168626c732b5d31c775aa8cfb7eaa0599bec0c175908a2c1ce2  three-r128.min.js
02bb4ade710f3e607329e37a21f098bc3ac70eb6e33daf8a65e79f4db785e7b2  OrbitControls-r128.min.js
7dddf7c5b8fd10ee654db8857d75d104b5557889aa5a91fc4ca545ea7c07062f  THREE-LICENSE.txt
```

Upgrade both distribution files together and preserve the license. The native assembly and export definitions use no Three.js types.
