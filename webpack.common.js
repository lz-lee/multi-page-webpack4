const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Happypack = require('happypack')

const pathResolve = (dir) => {
    return path.join(__dirname, dir)
}

let entries = getEntry('src/pages/**/app.js')

let chunks = Object.keys(entries)

let config = {
    entry: entries,
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js?[chunkhash]'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.jsx'],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'src': pathResolve('src'),
            'common': pathResolve('src/common'),
            'lib': pathResolve('src/lib'),
            'api': pathResolve('src/api'),
            'assets': pathResolve('src/assets'),
        }
    },
    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                exclude: /node_modules/,
                use: 'happypack/loader?id=babel'
            },{
                test: /\.js|jsx$/,
                loader: 'happypack/loader?id=eslint',
                enforce: 'pre',
                include: pathResolve('src')
            },{
                test: /\.vue$/,
                exclude: /node_modules/,
                use: [
                  {
                    loader: 'vue-loader',
                    options: {
                      // other vue-loader options go here
                    }
                  }
                ],
            },{
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                  use: 'happypack/loader?id=css',
                  fallback: 'style-loader'
                })
            },{
                test: /\.less$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    use: 'happypack/loader?id=less'
                })
            },{
                test: /\.html$/,
                use: 'happypack/loader?id=html'
            },{
                test: /\.json/,
                use: 'happypack/loader?id=json'
            },{
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]'
                    }
                }
            },{
                test: /\.(png|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: 'image/[hash].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [
        new Happypack({
            id: 'babel',
            cache: false,
            loaders: [
                {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    }
                }
            ]
        }),
        new Happypack({
            id: 'eslint',
            cache: false,
            loaders: [{
              loader: 'eslint-loader',
              options: {
                formatter: require('eslint-friendly-formatter')
              }
            }]  
        }),
        new Happypack({
            id: 'css',
            loaders: ['css-loader']
        }),
        new Happypack({
            id: 'less',
            cache: false,
            loaders: [
                {
                    loader: 'css-loader',
                    options: {
                        camelCase: true,
                        modules: true,
                        minimize: true,
                        sourceMap: false,
                        // use css-modules for BEM style
                        localIdentName: '[name]__[local]___[hash:base64:5]'
                    }
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    loader: 'less-loader'
                }
            ]
        }),
        new Happypack({
            id: 'html',
            loaders: [
                {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src', 'img:src']
                    }
                }
            ]
        }),
        new Happypack({
            id: 'json',
            loaders: ['json-loader']
        }),
        new ExtractTextPlugin({
            filename: 'css/[name].css',
            contenthash: true
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        minimize: true,
        splitChunks: {

        }
    }
}

let pages = Object.keys('src/pages/**/app.html')

pages.forEach((pathName) => {
    let conf = {
        filename: `view/${pathName}.html`,
        template: `src/pages/${pathName}/app.html`,
        inject: false   // body
    }
    if(pathname in config.entry){
        conf.favicon = 'favicon.ico'
        conf.inject = 'body'
        conf.chunks = [pathname]
        conf.hash = true
      }
      config.plugins.push(new HtmlWebpackPlugin(conf))
})

module.exports = config

function getEntry(globPath) {
    let files = glob.sync(globPath)
    let entries = {}, entry, tempname, entryname

    for(let i = 0; i < files.length; i++){
        entry = files[i]
        //entryname = entry.split('/')[entry.split('/').length - 2]
        tempname = (entry + globPath).replace(/(.+)(.+)\1/, '$2\n').split('\n')[0].split('/')
        tempname.splice(tempname.length - 1, 1)
        entryname = tempname.join('/')
        entries[entryname] = ['./' + entry]
    }
    return entries
}