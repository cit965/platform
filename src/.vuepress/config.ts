import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

import { registerComponentsPlugin } from "@vuepress/plugin-register-components";

import { getDirname, path } from "@vuepress/utils";

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  plugins: [
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, "./components"),
    }),
  ],
  base: "/",

  lang: "zh-CN",
  title: "平台工程中国社区",
  description: "平台工程中国社区",

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
