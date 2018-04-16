module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,css,js}'],
  swDest: 'dist/sw.js',
  // Define runtime caching rules.
  runtimeCaching: [
    {
      // Match any request ends with .png, .jpg, .jpeg or .svg.
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

      // Apply a cache-first strategy.
      handler: 'cacheFirst',

      options: {
        // Only cache 10 images.
        expiration: {
          maxEntries: 10
        }
      }
    }
  ]
}
