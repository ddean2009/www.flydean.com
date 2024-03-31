// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import mermaid from "mermaid";

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

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
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
  ],
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
  },

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

          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            type: 'search',
            position: 'right',
          },
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
        defaultLanguage: 'java',
      },
      announcementBar: {
        id: 'support_us',
        content:
            '觉得这个网站对你有帮助的话，给我点个赞吧! <a target="_blank" rel="noopener noreferrer" href="https://github.com/ddean2009/www.flydean.com">github</a>',
        backgroundColor: '#fafbfc',
        textColor: '#091E42',
        isCloseable: false,
      },
      metadata: [{name: 'referrer',content:'no-referrer'}]
      ,
    }),
};

export default config;
