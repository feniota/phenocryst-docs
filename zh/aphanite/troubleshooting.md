# 疑难解答

## WebGPU 不可用，无法加载 3D 皮肤预览。 {#webgpu-not-available}

Aphanite 使用[我们用 WebGPU 编写的超轻量 3D 皮肤预览器](https://github.com/feniota/tiny-skin-viewer)来渲染 3D 皮肤预览。得益于我们直接和 WebGPU API 与 WGSL 着色器交互，该库在您浏览器中仅会带来约 13KB 的加载负载。

### WebGPU 是什么？

**WebGPU** 是现代浏览器中的底层图形 API，能让网页更高效地利用 GPU 硬件，呈现高性能 3D 图形和计算任务。它是 WebGL 的下一代替代者。

然而，WebGPU 是一个相对较新而且较底层的 API，即使现在距离它公布已经过去了近 9 年，它仍然被视为实验性的 API，且未[进入基线](https://developer.mozilla.org/zh-CN/docs/Glossary/Baseline/Compatibility)。

### 浏览器支持情况

下面只是概况，具体请参考 [MDN 文档中的兼容性表格](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGPU_API#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7)。

| **浏览器** | **支持状态** |
|--------|----------|
| Chromium 113+ (Windows/macOS) | 完全支持 |
| Chromium 144+ (Linux) | 非 Intel 12 代以上 GPU 的设备需手动开启 |
| Firefox 147+ | 部分支持（不支持 Intel Mac 和 Linux） |
| Firefox (Android) | 不支持 |
| 其余手机浏览器 | 完全支持 |

#### 看样子我的浏览器支持，但它仍然报错？

极有可能是因为您没有通过[安全上下文](https://developer.mozilla.org/zh-CN/docs/Web/Security/Defenses/Secure_Contexts)访问 Aphanite，或者可以简单地理解为非 HTTP**S**。

- 如果您是用户，在其他人给您的链接里看到了“WebGPU 不支持”，请告诉给您链接的那个人，让 TA 配置 HTTPS。
- 如果您正在部署和测试 Aphanite，请确保您的 Aphanite 实例配置了[反向代理](/zh/aphanite/deployment#port-forwarding)。
- 如果您正在开发 Aphanite，请确保您是通过本机回环网卡（`localhost`、`127.0.0.1` 或 `[::1]`）访问的。

### 手动启用 WebGPU

对于使用 Linux，且非 Intel Xe 显卡的 Chrome 用户，以及较老版本的 Firefox 用户而言，WebGPU 功能在浏览器中存在，但是默认没有启用，需要手动打开。

#### Chrome Linux

1. 在地址栏输入 `chrome://flags/#force-enable-webgpu-interop`。
2. 将选项从 `Default` 改为 `Enabled`。
3. 重启浏览器查看效果。
4. 如果还是没有用，或许还需要启用 `chrome://flags/#enable-unsafe-webgpu`。

#### Firefox

- 在地址栏中输入 `about:config`。
- 搜索 `dom.webgpu.enabled`。
- 将其设为 `true`。
- 重启浏览器。

如果以上操作后仍不可用，有可能是因为您的 GPU 硬件或驱动版本不满足要求。
