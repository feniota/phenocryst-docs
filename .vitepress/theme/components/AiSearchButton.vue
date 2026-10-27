<script setup lang="ts">
import { inBrowser, useData } from "vitepress";
import { computed, onMounted, onUnmounted } from "vue";

const SEARCH_API_URL = "https://phenocryst-docs-search.feniota.org/";

const { lang } = useData();
const isZh = computed(() => lang.value === "zh");

const ZH_TRANSLATIONS = {
  loadingAriaLabel: "加载中",
  errorPrefix: "错误：",
  missingApiUrlError: "缺少 api-url 属性，请提供有效的 API 地址。",
  poweredBy: "由以下服务提供",
  placeholder: "搜索文档…",
  searchButtonLabel: "搜索",
  searchInputAriaLabel: "搜索文档",
  searchResultsAriaLabel: "搜索结果",
  emptyStateTitle: "开始搜索",
  emptyStateDescription: "输入关键词以搜索",
  modalEmptyStateDescription: "输入关键词开始搜索",
  noResultsTitle: "未找到结果",
  noResultsDescription: "未找到与“{query}”相关的结果",
  modalNoResultsTitle: "未找到结果",
  modalNoResultsDescription: "未找到与“{query}”相关的结果",
  resultsCount: "找到 {n} 个结果",
  resultsCountPlural: "找到 {n} 个结果",
  resultsCountOverflow: "显示 {n} 个结果，共 {total} 个",
  modalResultsCount: "{n} 个结果",
  modalResultsCountPlural: "{n} 个结果",
  modalResultsCountZero: "0 个结果",
  modalResultsCountError: "出错",
  seeMoreResults: "查看更多结果",
  groupOther: "其他",
  favoriteResults: "收藏",
  recentResults: "最近",
  addFavorite: "添加到收藏",
  removeFavorite: "取消收藏",
  navigateHint: "导航",
  selectHint: "选择",
  closeHint: "关闭",
  closeAriaLabel: "关闭",
  loadingMessages: [
    "正在搜索…",
    "正在翻找结果…",
    "正在扫描知识库…",
    "正在匹配最佳结果…",
    "正在筛选数据…",
    "快好了…",
    "正在四处查找…",
    "正在串联线索…",
    "正在翻阅页面…",
    "正在寻找答案…",
  ],
};

let snippetAttached = false;

onMounted(async () => {
  if (!inBrowser) return;

  try {
    await import("@cloudflare/ai-search-snippet");

    // Attach to <body> to escape VP's nested stacking contexts.
    // Closed height is 0, so it has zero layout impact.
    const el = document.createElement("search-modal-snippet");
    el.setAttribute("api-url", SEARCH_API_URL);
    el.setAttribute("placeholder", isZh.value ? "搜索文档…" : "Search documentation...");
    if (isZh.value) {
      el.setAttribute("translations", JSON.stringify(ZH_TRANSLATIONS));
    }
    el.setAttribute("shortcut", "k");
    el.setAttribute("show-url", "true");
    el.setAttribute("show-date", "true");
    document.body.appendChild(el);
    snippetAttached = true;
  } catch (e) {
    console.warn("Failed to load AI Search snippet:", e);
  }
});

onUnmounted(() => {
  if (snippetAttached) document.querySelector("search-modal-snippet")?.remove();
});

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const tagName = element.tagName;
  return (
    element.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
}

function openSearch() {
  document.querySelector("search-modal-snippet")?.open();
}

function handleSlashKey(event: KeyboardEvent) {
  if (!isEditingContent(event) && event.key === "/") {
    event.preventDefault();
    openSearch();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleSlashKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleSlashKey);
});
</script>

<template>
  <!-- Search trigger button styled like VP default theme.
       The <search-modal-snippet> is dynamically created and attached
       to <body> in script setup — no template rendering needed. -->
  <button
    type="button"
    class="DocSearch DocSearch-Button"
    :aria-label="isZh ? '搜索' : 'Search'"
    @click="openSearch"
  >
    <span class="DocSearch-Button-Container">
      <span class="vp-icon DocSearch-Search-Icon" />
      <span class="DocSearch-Button-Placeholder">{{ isZh ? "搜索" : "Search" }}</span>
    </span>
    <span class="DocSearch-Button-Keys">
      <kbd class="DocSearch-Button-Key" />
      <kbd class="DocSearch-Button-Key">K</kbd>
    </span>
  </button>
</template>

<style scoped>
/* DocSearch button styles — matches VitePress default theme exactly */
.DocSearch-Button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  width: 48px;
  height: 55px;
  background: transparent;
  transition: border-color 0.25s;
  border: none;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
}

.DocSearch-Button:hover {
  background: transparent;
}

.DocSearch-Button:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

.DocSearch-Button:focus:not(:focus-visible) {
  outline: none !important;
}

@media (min-width: 768px) {
  .DocSearch-Button {
    justify-content: flex-start;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0 10px 0 12px;
    width: auto;
    height: 40px;
    background-color: var(--vp-c-bg-alt);
  }

  .DocSearch-Button:hover {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-bg-alt);
  }
}

.DocSearch-Button .DocSearch-Button-Container {
  display: flex;
  align-items: center;
}

.DocSearch-Button .DocSearch-Search-Icon {
  position: relative;
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-1);
  fill: currentColor;
  transition: color 0.5s;
}

.DocSearch-Button:hover .DocSearch-Search-Icon {
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Search-Icon {
    top: 1px;
    margin-right: 8px;
    width: 14px;
    height: 14px;
    color: var(--vp-c-text-2);
  }
}

.DocSearch-Button .DocSearch-Button-Placeholder {
  display: none;
  margin-top: 2px;
  padding: 0 16px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.DocSearch-Button:hover .DocSearch-Button-Placeholder {
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Button-Placeholder {
    display: inline-block;
  }
}

.DocSearch-Button .DocSearch-Button-Keys {
  direction: ltr;
  display: none;
  min-width: auto;
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Button-Keys {
    display: flex;
    align-items: center;
  }
}

.DocSearch-Button .DocSearch-Button-Key {
  display: block;
  margin: 2px 0 0 0;
  border: 1px solid var(--vp-c-divider);
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding-left: 6px;
  min-width: 0;
  width: auto;
  height: 22px;
  line-height: 22px;
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 500;
  transition:
    color 0.5s,
    border-color 0.5s;
}

.DocSearch-Button .DocSearch-Button-Key + .DocSearch-Button-Key {
  border-right: 1px solid var(--vp-c-divider);
  border-left: none;
  border-radius: 0 4px 4px 0;
  padding-left: 2px;
  padding-right: 6px;
}

.DocSearch-Button .DocSearch-Button-Key:first-child {
  font-size: 0 !important;
}

.DocSearch-Button .DocSearch-Button-Key:first-child::after {
  content: "Ctrl";
  font-size: 12px;
  letter-spacing: normal;
  color: var(--vp-c-text-2);
}

:global(.mac) .DocSearch-Button .DocSearch-Button-Key:first-child::after {
  content: "⌘";
}

.DocSearch-Button .DocSearch-Button-Key:first-child > * {
  display: none;
}

.DocSearch-Search-Icon {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' stroke-width='1.6' viewBox='0 0 20 20'%3E%3Cpath fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' d='m14.386 14.386 4.088 4.088-4.088-4.088A7.533 7.533 0 1 1 3.733 3.733a7.533 7.533 0 0 1 10.653 10.653z'/%3E%3C/svg%3E");
  -webkit-mask-image: var(--icon);
  mask-image: var(--icon);
  background-color: currentColor;
}
</style>
