// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import { GiscusConfig } from './src/components/Comment'
import mermaid from "mermaid";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import * as fs from "fs";

const tailwindPlugin = require('./src/plugin/tailwind-plugin.cjs');
const javaHTML = fs.readFileSync('./src/snippets/java.html', 'utf-8');
const interviewHTML = fs.readFileSync('./src/snippets/interview.html', 'utf-8');
const pythonHTML = fs.readFileSync('./src/snippets/python.html', 'utf-8');
const aiHTML = fs.readFileSync('./src/snippets/ai.html', 'utf-8');
const blockchainHTML = fs.readFileSync('./src/snippets/blockchain.html', 'utf-8');
const mobileDevHTML = fs.readFileSync('./src/snippets/mobile-dev.html', 'utf-8');
const webHTML = fs.readFileSync('./src/snippets/web.html', 'utf-8');
const archHTML = fs.readFileSync('./src/snippets/arch.html', 'utf-8');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '程序那些事',
  tagline: '你想要的,我这里都有!',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'http://www.flydean.com',
  baseUrl: '/',

  organizationName: 'ddean2009', // Usually your GitHub org/user name.
  projectName: 'www.flydean.com', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  customFields: {
    // image: '',
    description:'AIGC,chatgpt,stable diffusion,人工智能,大数据,区块链,java,javascript,python,算法,flutter系列教程',
    keywords: ['AIGC','chatgpt','stable diffusion','人工智能','大数据','区块链','java','javascript','python','算法','flutter'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          sidebarCollapsible: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        //google-gtag
        gtag: {
          trackingID: 'UA-142381148-1',
          anonymizeIP: false,
        },
        //sitemap
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],// end preset
  //begin stylesheets
  stylesheets: [
    {
      href: '/katex/katex.min.css',
      type: 'text/css',
    },
  ],//stylesheets ends
  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    format: 'detect',
    mermaid: true,
  },// markdown ends
  plugins: [
    tailwindPlugin,
    'docusaurus-plugin-sass',
    // '@babel/plugin-syntax-jsx',
    ['docusaurus-plugin-baidu-tongji', {
    token: '09b5e994e1e3872ac77bb501a1857c31' }
    ],
      ['@docusaurus/plugin-ideal-image',{
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      }],
      ['./src/plugin/plugin-content-blog', // 为了实现全局 blog 数据，必须改写 plugin-content-blog 插件
        {
          path: 'blog',
          // editUrl: ({ locale, blogDirPath, blogPath, permalink }) =>
          //     `https://github.com/ddean2009/www.flydean.com/edit/main/${blogDirPath}/${blogPath}`,
          editLocalizedFiles: false,
          blogDescription: '程序那些事',
          blogSidebarCount: 10,
          blogSidebarTitle: '最近博客',
          postsPerPage: 10,
          showReadingTime: true,
          readingTime: ({ content , defaultReadingTime }) =>
              defaultReadingTime({ content, options: { wordsPerMinute: 300 } }),
          feedOptions: {
            type: 'all',
            title: 'flydean',
            copyright: `Copyright © ${new Date().getFullYear()} 程序那些事.<p><a href="http://beian.miit.gov.cn/" class="footer_lin">粤ICP备19017836号</a></p>`,
          },
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        }]
      ],//end plugin

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '首页',
        logo: {
          alt: '程序那些事',
          src: 'img/logo.svg',
        },
        items: [
          {
            label: 'JAVA',
            type: 'dropdown',
            position: 'left',
            to: '/java/java-roadmap',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: javaHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'aigcSidebar',
            label: 'AIGC',
            position: 'left',
          },
          {
            label: 'AI',
            type: 'dropdown',
            position: 'left',
            to: '/AI/llma/langchain',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: aiHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            label: '区块链',
            type: 'dropdown',
            position: 'left',
            to: '/blockchain',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: blockchainHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            label: '移动开发',
            type: 'dropdown',
            position: 'left',
            to: '/flutter/dart',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: mobileDevHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            label: '系统架构',
            type: 'dropdown',
            position: 'left',
            to: '/Architecture/common',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: archHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'algorithmSidebar',
            label: '算法动画',
            position: 'left',
          },
          {
            label: 'PYTHON',
            type: 'dropdown',
            position: 'left',
            to: '/python/python-base',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: pythonHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            label: 'JS和前端',
            type: 'dropdown',
            position: 'left',
            to: '/javascript/ecmascript',
            className: 'dyte-dropdown',
            items: [
              {
                type: 'html',
                value: webHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'cryptologySidebar',
            label: '密码学',
            position: 'left',
          },
          {
            type: 'search',
            position: 'right',
          },
          {to: '/blog', label: '博客', position: 'right'},
          {
            label: '面试秘籍',
            type: 'dropdown',
            to:'/interview/prepare',
            position: 'right',
            className: 'dyte-dropdown resources-dropdown',
            items: [
              {
                type: 'html',
                value: interviewHTML,
                className: 'dyte-dropdown',
              },
            ],
          },
          {
            href: 'https://github.com/ddean2009/www.flydean.com',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '关注我',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/ddean2009/www.flydean.com',
              },
              {
                label: 'CSDN',
                href: 'https://blog.csdn.net/superfjj',
              },
              {
                label: '掘金',
                href: 'https://juejin.cn/user/3913917124584142',
              },
              {
                label: '知乎',
                href: 'https://www.zhihu.com/people/flydean2020',
              },

            ],
          },
          {
            title: '联系我',
            items: [
              {
                html: `
                 <h4>flydean@163.com</h4>
              `,
              },
              {
                html: `
                 <img src="/img/qrcode.jpg" alt="关注公众号" width="55" height="55" />
                 <img src="/img/qrcode2.jpeg" alt="加我好友" width="55" height="55" />
                 <img src="/img/zhishixingqiu.jpg" alt="加入星球" width="55" height="55" />
              `,
              },
            ],
          },
          {
            title: '资源下载',
            items: [
              {
                label: '各类秘籍',
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook',
              },
            ],
          },
          {
            title: '电子小册',
            items: [
              {
                label: 'Spring Boot 2.X实战教程',
                href: 'https://pan.quark.cn/s/dcb6c1d5a386',
              },
              {
                label: 'Stream和Lambda表达式最佳实践',
                href: 'https://pan.quark.cn/s/4041737b1b77',
              },
              {
                label: '深入理解java集合',
                href: 'https://pan.quark.cn/s/d4adc5126230',
              },
              {
                label: 'IO/NIO深入指南',
                href: 'https://pan.quark.cn/s/3227954cb851',
              },
              {
                label: '深入理解java并发和多线程',
                href: 'https://pan.quark.cn/s/a4189e6f8f15',
              },
              {
                label: 'Spring5中文参考指南',
                href: 'https://pan.quark.cn/s/0d88e1888e16',
              },
            ],
          },
        ],
        // logo: {
        //   alt: '加我好友',
        //   src: 'img/qrcode.jpg',
        //   // href: 'https://opensource.fb.com',
        //   width: 55,
        //   height: 55,
        // },
        copyright: `Copyright © ${new Date().getFullYear()} 程序那些事.<a target="_blank" rel="noopener noreferrer" href="http://www.beian.miit.gov.cn/">粤ICP备19017836号</a>.`,
      },
      //评论
      giscus: {
        repo: 'ddean2009/blog-discussions',
        repoId: 'R_kgDOLoUaIA',
        category: 'Announcements',
        // category: 'General',
        categoryId: 'DIC_kwDOLoUaIM4CeYKC',
        theme: 'light',
        darkTheme: 'dark',
      } satisfies Partial<GiscusConfig>,
      //搜索
      algolia: {
        // The application ID provided by Algolia
        appId: 'SX9DZLY43T',
        // Public API key: it is safe to commit it
        apiKey: 'aa47b4e0c7e2b4c78f784364560f2da2',
        indexName: 'myblog',
        // Optional: see doc section below
        contextualSearch: false,
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|flydean\\.com',
        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        // replaceSearchResultPathname: {
        //   from: '/docs/', // or as RegExp: /\/docs\//
        //   to: '/',
        // },
        // Optional: Algolia search parameters
        // searchParameters: {},
        // Optional: path for search page that enabled by default (`false` to disable it)
        // searchPagePath: 'search',
        //... other Algolia params
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [
          'bash',
          'json',
          'java',
          'python',
          'php',
          'sql',
          'go',
          'php',
          'protobuf',
          'javascript',
        ],
        defaultLanguage: 'java',
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: { start: 'highlight-start', end: 'highlight-end' },
          },
          {
            className: 'code-block-error-line',
            line: 'This will error',
          },
        ],
      },
      announcementBar: {
        id: 'support_us',
        content:
            '觉得这个网站对你有帮助的话，给我点个赞吧! <a target="_blank" rel="noopener noreferrer" href="https://github.com/ddean2009/www.flydean.com">github</a>',
        backgroundColor: '#fafbfc',
        textColor: '#091E42',
        isCloseable: false,
      },
      metadata: [
          {name: 'referrer',content:'no-referrer'},
        {
          name: 'keywords',
          content: 'flydean,程序那些事',
        },
        {
          name: 'keywords',
          content: 'AIGC,AI,人工智能,java,javascript,python,区块链,blockchain,算法,数据结构,大数据',
        },
        {
          name: 'keywords',
          content: 'spring,spring boot, spring cloud',
        },
      ]
      ,
    }),//end themconfig

  scripts: [
    {
      src: 'https://readmore.openwrite.cn/js/readmore-2.0.js',
      // src: 'https://readmore.openwrite.cn/js/readmore.js',
      defer: true,
    },
    // {
    //   src: '/js/readmorelocal.js',
    //   defer: true,
    // },
  ],
};

export default config;
