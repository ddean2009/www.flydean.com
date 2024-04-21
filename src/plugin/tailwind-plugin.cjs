function tailwindPlugin(context, options) {
    return {
        name: 'tailwind-plugin',
        configurePostCss(postcssOptions) {
            postcssOptions.plugins.push(
                require('postcss-import'),
                require('tailwindcss'),
                // require('postcss-nested'),
                require('autoprefixer'),
            );
            return postcssOptions;
        },
    };
}

module.exports = tailwindPlugin;
