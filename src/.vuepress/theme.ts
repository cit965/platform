import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://vuepress-theme-hope-docs-demo.netlify.app",

  author: {
    name: "南哥",
    url: "https://avatars.githubusercontent.com/u/49775493?v=4",
  },

  locales: {
    "/": {

      footer:
        '主题使用 <a href="https://theme-hope.vuejs.press/zh/">VuePress Theme Hope</a> | <a href="https://mister-hope.com/about/site.html" target="_blank">关于网站</a>',

      copyright: "基于 MIT 协议，© 2019-至今 Mr.Hope",

      blog: {
        description: "k8s等开源项目贡献者，CNCF平台工程小组成员，云原生架构师",
        intro: "/about/",
        medias: {
          GitHub: "https://github.com/mouuii",
          BiliBili: "https://space.bilibili.com/630395917",
          Twitter: "https://twitter.com/binChou143590",
          // QQ: "http://wpa.qq.com/msgrd?v=3&uin=1178522294&site=qq&menu=yes",
          // Qzone: "https://1178522294.qzone.qq.com/",
          // Gmail: "mailto:mister-hope@outlook.com",
          // Zhihu: "https://www.zhihu.com/people/mister-hope",
          // Steam: "https://steamcommunity.com/id/Mr-Hope/",
          // Weibo: "https://weibo.com/misterhope",
          // Gitee: "https://gitee.com/Mister-Hope",
          // Twitter: "https://twitter.com/Mister_Hope",
          // Telegram: "https://t.me/Mister_Hope",
        },
      },
    },
  },

  iconAssets: "fontawesome-with-brands",

  logo: "/logo_mao.png",

  repo: "cit965/platform",

  docsDir: "src",

  // navbar
  navbar,

  // sidebar
  sidebar,

  footer: "中国平台工程官方社区",

  displayFooter: true,

  encrypt: {
    config: {
      "/demo/encrypt.html": ["1234"],
    },
  },

  // page meta
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  
  plugins: {
    // You should generate and use your own comment service
    comment: {
      provider: "Giscus",
      repo: "cit965/platform-discuss",
      repoId: "R_kgDOKukSNA",
      category: "Announcements",
      categoryId: "DIC_kwDOKukSNM4CbHWF",
    },

    blog: {
      excerptLength: 0,
    },
    // All features are enabled for demo, only preserve features you need here
    mdEnhance: {
      align: true,
      attrs: true,

      // install chart.js before enabling it
      // chart: true,

      codetabs: true,

      // insert component easily
      // component: true,

      demo: true,

      // install echarts before enabling it
      // echarts: true,

      figure: true,

      // install flowchart.ts before enabling it
      // flowchart: true,

      // gfm requires mathjax-full to provide tex support
      // gfm: true,

      imgLazyload: true,
      imgSize: true,
      include: true,

      // install katex before enabling it
      // katex: true,

      // install mathjax-full before enabling it
      // mathjax: true,

      mark: true,

      // install mermaid before enabling it
      // mermaid: true,

      playground: {
        presets: ["ts", "vue"],
      },

      // install reveal.js before enabling it
      // revealJs: {
      //   plugins: ["highlight", "math", "search", "notes", "zoom"],
      // },

      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,

      // install @vue/repl before enabling it
      // vuePlayground: true,
    },

    // uncomment these if you want a pwa
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cachePic: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  },
});
