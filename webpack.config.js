/* globals require:true, module: true, __dirname: true */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  devServer: {
    host: '127.0.0.1',
    port: 8084,
    static: [
      {
        directory: path.resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free'),
        publicPath: '/fontawesome',
        serveIndex: false,
        watch: false
      },
      {
        directory: path.resolve(__dirname, 'node_modules/@popperjs/core/dist/umd'),
        publicPath: '/popperjs',
        serveIndex: false,
        watch: false
      },
      {
        directory: path.resolve(__dirname, 'node_modules/codemirror'),
        publicPath: '/codemirror',
        serveIndex: false,
        watch: false
      },
      {
        directory: path.resolve(__dirname, 'server'),
        publicPath: '/',
        serveIndex: true,
        watch: true
      }

    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'wysiwyg-editor.js',
    library: 'WYSIWYGEditor',
    libraryTarget: 'umd'
  },
  target: 'browserslist',
  externals: {
    '@popperjs/core': {
      root: 'Popper',
      commonjs: 'Popper',
      commonjs2: 'Popper',
      amd: 'Popper'
    },
    codemirror: {
      root: 'CodeMirror',
      commonjs: 'CodeMirror',
      commonjs2: 'CodeMirror',
      amd: 'CodeMirror'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'wysiwyg-editor.css'
    })
  ]
};
