import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/demo/",
  {
    text: "博客",
    icon: "lightbulb",
    prefix: "/guide/",
    link: "/article/"
  }
]);
