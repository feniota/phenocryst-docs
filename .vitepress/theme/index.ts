import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import AiSearchButton from "./components/AiSearchButton.vue";
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue";
import "./styles.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-before": () => h("div", { class: "aisearch-wrapper" }, h(AiSearchButton)),
    });
  },
  enhanceApp({ app }) {
    app.component("CopyOrDownloadAsMarkdownButtons", CopyOrDownloadAsMarkdownButtons);
  },
};
