import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { defineComponent, h, nextTick, onMounted, watch } from "vue";
import AiSearchButton from "./components/AiSearchButton.vue";
import Footer from "./components/Footer.vue";
import MigrationBanner from "./components/MigrationBanner.vue";
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue";
import "./styles.css";

const Layout = defineComponent({
  setup() {
    const { lang, page } = useData();

    const localizeCodeCopyButtons = () => {
      const title = lang.value === "zh" ? "复制代码" : "Copy Code";
      document.querySelectorAll<HTMLButtonElement>("button.copy").forEach((button) => {
        button.title = title;
      });
    };

    onMounted(localizeCodeCopyButtons);
    watch(
      () => page.value.relativePath,
      () => nextTick(localizeCodeCopyButtons),
    );

    return () =>
      h(DefaultTheme.Layout, null, {
        "layout-top": () => h(MigrationBanner),
        "nav-bar-content-before": () => h("div", { class: "aisearch-wrapper" }, h(AiSearchButton)),
        "doc-after": () => h(Footer),
      });
  },
});

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("CopyOrDownloadAsMarkdownButtons", CopyOrDownloadAsMarkdownButtons);
  },
};
