---
title: 真实项目
icon: splotch
order: 1
category:
  - 案例

docs:
  - name: vue3
    desc: 0基础学前端
    logo: https://waline.js.org/logo.png
    url: https://waline.js.org/
    repo: https://github.com/walinejs/waline
    preview: https://img1.baidu.com/it/u=2404796828,3158324841&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=500

  - name: k8s入门10讲
    desc: 全网最通俗易懂的k8s入门课
    logo: https://innenu.com/logo.svg
    url: https://innenu.com
    repo: https://github.com/inNENU/resource/
    preview: https://img1.baidu.com/it/u=1880920965,3615296744&fm=253&fmt=auto&app=138&f=JPG?w=499&h=444

---

## 平台工程项目


<div style="display:flex">
<SiteInfo  v-for="item in $frontmatter.docs"
  :key="item.link"
  v-bind="item"
  style="display:flex;"
  />
</div>


## 更多

- 随时随地通过 PR 添加你的博客或文档至此。