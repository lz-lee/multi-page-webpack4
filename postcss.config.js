module.exports = {
    ident: 'postcss',
    plugins: () => [
      require('postcss-import')(),
      require('postcss-flexbugs-fixes'),
      require('autoprefixer')({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9',
        ],
        flexbox: 'no-2009',
      }),
      // for BEM style
      require('postcss-salad')({
        browsers: [
          'ie > 8', 'last 2 versions'
        ],
        features: {
          bem: {
            shortcuts: {
              component: 'b',
              modifier: 'm',
              descendent: 'e'
            },
            separators: {
              descendent: '__',
              modifier: '--'
            }
          }
        }
      })  
    ]
}
  