<script setup lang="ts">
import { useData } from "vitepress";
const { lang } = useData();
</script>
<template>
  <div class="phenocryst-footer">
    <div>©2026 Feniota</div>
    <div class="mc-disclaimer">
      {{
        lang === "en"
          ? "NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT."
          : "本站点非官方 Minecraft 服务，未经 Mojang 或微软批准，也不与其关联。"
      }}
    </div>
  </div>
</template>

<style>
.phenocryst-footer {
  text-align: center;
  /*display: flex;
  flex-direction: column;*/
  margin-top: 64px;
  color: var(--vp-c-text-2);
}
.mc-disclaimer {
  margin-top: 1em;
  font-size: 0.8em;
}
</style>
