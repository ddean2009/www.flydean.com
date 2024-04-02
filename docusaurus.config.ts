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

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '程序那些事',
  tagline: '你想要的,我这里都有!',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'http://www.flydean.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
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
    keywords: [],
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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
            // {
          // showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
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
    // preprocessor: ({filePath, fileContent}) => {
    //   return fileContent.replaceAll('{{MY_VAR}}', 'MY_VALUE');
    // },
    // parseFrontMatter: async (params) => {
    //   const result = await params.defaultParseFrontMatter(params);
    //   result.frontMatter.description =
    //       result.frontMatter.description?.replaceAll('{{MY_VAR}}', 'MY_VALUE');
    //   return result;
    // },
    // mdx1Compat: {
    //   comments: true,
    //   admonitions: true,
    //   headingIds: true,
    // },
  },// markdown ends

  plugins: [
    'docusaurus-plugin-sass',
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
          readingTime: ({ content, frontMatter, defaultReadingTime }) =>
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
          hideable: false,
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
            type: 'docSidebar',
            sidebarId: 'aiSidebar',
            label: 'AI',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'javaSidebar',
            position: 'left',
            label: 'JAVA',
          },
          {
            type: 'docSidebar',
            sidebarId: 'scalaSidebar',
            label: 'SCALA',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'springSidebar',
            label: 'SPRING',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'blockchainSidebar',
            label: '区块链',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'flutterSidebar',
            label: 'FLUTTER',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'algorithmSidebar',
            label: '算法动画',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'pythonSidebar',
            label: 'PYTHON',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'reactiveSidebar',
            label: '响应式框架',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'jsSidebar',
            label: 'JS',
            position: 'left',
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
            type: 'docSidebar',
            sidebarId: 'interviewSidebar',
            label: '面试秘籍',
            position: 'right',
          },
          {
            label: '其他',
            position: 'right',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'architSidebar',
                label: '系统架构',
              },
              {
                type: 'docSidebar',
                sidebarId: 'cheatSidebar',
                label: '秘诀和小贴士',
              },
              {
                type: 'docSidebar',
                sidebarId: 'csSidebar',
                label: 'CS解密',
              },
              {
                type: 'docSidebar',
                sidebarId: 'toolsSidebar',
                label: '服务器和工具',
              },
              {
                type: 'docSidebar',
                sidebarId: 'linuxSidebar',
                label: 'linux实战',
              },
              {
                type: 'docSidebar',
                sidebarId: 'dbSidebar',
                label: '数据库集锦',
              },
              // {
              //   href: 'https://forum.ionicframework.com/',
              //   label: 'Forum',
              //   target: '_blank',
              //   rel: null,
              // },
            ],
            // className: 'navbar__link--community',
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
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook/SpringBoot2.X-in-action.pdf',
              },
              {
                label: 'Stream和Lambda表达式最佳实践',
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook/java-stream-lambda-all-in-one.pdf',
              },
              {
                label: '深入理解java集合',
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook/java-collection-all-in-one.pdf',
              },
              {
                label: '小师妹学IO/NIO',
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook/java-io-all-in-one.pdf',
              },
              {
                label: '深入理解java并发和多线程',
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook/concurrent-all-in-one.pdf',
              },
              {
                label: 'Spring5中文参考指南',
                href: 'https://github.com/ddean2009/www.flydean.com/tree/master/static/ebook/Spring5-framework-reference.pdf',
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
        appId: 'YOUR_APP_ID',

        // Public API key: it is safe to commit it
        apiKey: 'YOUR_SEARCH_API_KEY',

        indexName: 'YOUR_INDEX_NAME',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|flydean\\.com',

        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        // replaceSearchResultPathname: {
        //   from: '/docs/', // or as RegExp: /\/docs\//
        //   to: '/',
        // },

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
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
};

export default config;
