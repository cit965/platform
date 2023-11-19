import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "项目",
      icon: "laptop-code",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "文档",
      icon: "book",
      prefix: "guide/",
      children: "structure",
    },
    "slides",
  ],
});
