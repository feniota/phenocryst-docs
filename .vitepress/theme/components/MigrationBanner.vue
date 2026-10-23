<!--
    From: https://github.com/vuejs/docs/blob/main/.vitepress/theme/components/Banner.vue
    Copyright (c) 2019-present, Yuxi (Evan) You and Vue documentation contributors
-->
<script setup lang="ts">
import { useData } from "vitepress";
import { onMounted, ref } from "vue";

const { lang } = useData();
const visible = ref(false);

onMounted(() => {
  visible.value = window.location.hostname === "phenocryst.feniota.org";
  if (visible.value) {
    document.documentElement.classList.add("migration-banner-visible");
  }
});
</script>
<template>
  <div v-if="visible" class="migration-banner">
    <template v-if="lang === 'en'">
      This site has moved to&nbsp;
      <a href="https://mc.feniota.org">mc.feniota.org</a>. phenocryst.feniota.org will be shut down
      in the future.
    </template>
    <!-- handcrafted 0.125ic CJK-Latin space -->
    <template v-else>
      本站已迁移到<span style="display: inline-block; height: 1px; width: 0.125ic"></span>
      <a href="https://mc.feniota.org">mc.feniota.org</a>，phenocryst.feniota.org 将在未来关停。
    </template>
  </div>
</template>

<style>
html.migration-banner-visible {
  --vp-layout-top-height: 36px;
}

@media (max-width: 768px) {
  html.migration-banner-visible {
    --vp-layout-top-height: 64px;
  }
}
</style>

<style scoped>
html.dark .migration-banner {
  border-top: 1px solid #996600;
  border-bottom: 1px solid #996600;
  background-color: #775500;
  color: #fff;
}
html:not(.dark) .migration-banner {
  background-color: #ffcc00;
  color: #1a1a1a;
}

.migration-banner {
  position: fixed;
  z-index: var(--vp-z-index-layout-top);
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--vp-layout-top-height);
  padding: 0 16px;
  box-sizing: border-box;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.migration-banner a {
  color: inherit;
  text-decoration: underline;
}
</style>
