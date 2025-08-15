module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Enable CSS compression in production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          // Aggressive minification settings
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          mergeRules: true,
          minifySelectors: true,
          minifyFontValues: true,
          minifyParams: true,
          discardDuplicates: true,
          reduceIdents: true,
          // Optimize for maximum compression
          zindex: true,
          discardUnused: true,
          autoprefixer: false, // Already handled above
        }]
      }
    })
  }
};