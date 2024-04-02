// eslint-disable-next-line @typescript-eslint/no-var-requires
const blogPluginExports = require('@docusaurus/plugin-content-blog');
const { default: blogPlugin } = blogPluginExports;

async function blogPluginEnhanced(context, options) {
  const blogPluginInstance = await blogPlugin(context, options);

  return {
    ...blogPluginInstance,
    async contentLoaded({ content, allContent, actions }) {
      // Create default plugin pages
      await blogPluginInstance.contentLoaded({ content, allContent, actions });

      // Create your additional pages
      const { blogPosts, blogTags } = content;
      const { setGlobalData } = actions;

      setGlobalData({
        posts: blogPosts.slice(0, 10), // Only store 10 posts
        postNum: blogPosts.length,
        tagNum: Object.keys(blogTags).length,
      });
    },
  };
}

module.exports = Object.assign({}, blogPluginExports, { default: blogPluginEnhanced });
