import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin  from 'extract-text-webpack-plugin';
/**
 * Created by tanxiangyuan on 16/8/23.
 */
const appPath = path.resolve(__dirname, 'web/client');
//测试环境
const ip = '127.0.0.1';
const port = 8020;

// const hotDevServer = 'webpack/hot/only-dev-server';
// https://github.com/webpack/webpack-dev-server
// const webpackDevServer = `webpack-dev-server/client?http://${ip}:${port}`;


var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';


module.exports = {
    cache: true, //开启缓存,增量编译
    debug: true, //开启 debug 模式
    watch: true,
    devtool: 'source-map', //生成 source map文件,'cheap-source-map':调试时的源码是编译后的es5,但是编译速度快
    port: port,
    stats: {
        colors: true, //打印日志显示颜色
        reasons: false //打印相关模块被引入
    },

    resolve: {
        root: [appPath], // 设置要加载模块根路径，该路径必须是绝对路径
        modulesDirectories: ['node_modules'],
        //自动扩展文件后缀名
        extensions: ['', '.js', '.jsx', '.css', '.json','.less']
    },

    // 入口文件 让webpack用哪个文件作为项目的入口
    entry: [
        hotMiddlewareScript,
        './src/web/client/scripts/index'],

    // 出口 让webpack把处理完成的文件放在哪里
    output: {
        // 编译输出目录, 不能省略
        path: path.resolve(__dirname, './web/static/dist'),
        filename: 'bundle.js', //文件名称
        publicPath: '/dist' //资源路径
    },

    module: {
        // https://github.com/MoOx/eslint-loader
        /*preLoaders: [{
         test: /\.jsx?$/,
         exclude: /node_modules.*!/,
         loader:'eslint'
         }],*/
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                exclude: /node_modules/,
                cacheDirectory: true, // 开启缓存
                query: {
                    presets: ['react', 'es2015']
                }
            },
            // https://github.com/webpack/extract-text-webpack-plugin 单独引入css文件
            {
                test: /\.less/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader?{browsers:["IE >= 8"]}!less-loader')
            },
            // https://github.com/webpack/extract-text-webpack-plugin 单独引入css文件
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            // https://github.com/webpack/url-loader
            {
                test: /\.(png|jpg|gif|woff|woff2|svg)$/,
                loader: 'url?limit=10000', // 10kb
                exclude: /node_modules/,
                query: {
                    mimetype: 'image/png'
                }
            },
            {
                test: /\.(mp4|ogg)$/,
                exclude: /node_modules/,
                loader: 'file-loader'
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('[name].css'),
        new webpack.NoErrorsPlugin()/*,
        new webpack.DllReferencePlugin({
            context: __dirname,
            /!**
             * 在这里引入 manifest 文件
             *!/
            manifest: require('./web/static/dist/vendor-manifest.json')
        })*/
    ]
};