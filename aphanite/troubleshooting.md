# Troubleshooting

## Cannot Load 3D Skin Preview: WebGPU Unavailable {#webgpu-not-available}

Aphanite uses [our ultra-lightweight 3D skin viewer written in WebGPU](https://github.com/feniota/tiny-skin-viewer) to render 3D skin previews. Thanks to our direct interaction with the WebGPU API and WGSL shaders, this library adds only about 13KB of load in your browser.

### What is WebGPU?

**WebGPU** is a low-level graphics API for modern browsers that allows web pages to utilize GPU hardware more efficiently for high-performance 3D graphics and compute tasks. It is the next-generation successor to WebGL.

However, WebGPU is a relatively new and low-level API. Even though nearly 9 years have passed since its announcement, it is still considered experimental and has not yet [entered Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility).

### Browser Support

The table below provides a general overview. For details, please refer to the [compatibility table in MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility).

| **Browser**                   | **Support Status**                                           |
| ----------------------------- | ------------------------------------------------------------ |
| Chromium 113+ (Windows/macOS) | Fully supported                                              |
| Chromium 144+ (Linux)         | Requires manual enablement on GPUs older than Intel 12th Gen |
| Firefox 147+                  | Requires manual enablement on Intel Mac and Linux            |
| Firefox (Android)             | Not supported                                                |
| Other mobile browsers         | Fully supported                                              |

#### My browser is supported, but I still get an error?

It is very likely that you are not accessing Aphanite through a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), or simply put, not over HTTP**S**.

- If you are a user and see this error on a link someone shared with you, please let them know they need to configure HTTPS.
- If you are deploying or testing Aphanite, make sure your Aphanite instance is configured with a [reverse proxy](/aphanite/deployment#port-forwarding).
- If you are developing Aphanite, ensure you are accessing it via the local loopback interface (`localhost`, `127.0.0.1`, or `[::1]`).

### Enabling WebGPU Manually

For Linux users on Chrome without an Intel Xe GPU, as well as users on older Firefox versions, WebGPU is available in the browser but not enabled by default and needs to be turned on manually.

#### Chrome on Linux

1. Navigate to `chrome://flags/#force-enable-webgpu-interop` in the address bar.
2. Change the option from `Default` to `Enabled`.
3. Restart the browser and check the result.
4. If it still doesn't work, you may also need to enable `chrome://flags/#enable-unsafe-webgpu`.

#### Firefox

- Navigate to `about:config` in the address bar.
- Search for `dom.webgpu.enabled`.
- Set it to `true`.
- Restart the browser.

If it is still unavailable after the steps above, your GPU hardware or driver version may not meet the requirements.
