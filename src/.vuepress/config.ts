import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "平台工程中国社区",
  description: "平台工程中国社区",

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
