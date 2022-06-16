import { resolve } from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  entry: "./src/index.js",
  devServer: {
    host: "127.0.0.1",
    port: 8084,
    static: [
      {
        directory: resolve("./node_modules/@fortawesome/fontawesome-free"),
        publicPath: "/fontawesome",
        serveIndex: false,
        watch: false,
      },
      {
        directory: resolve("./node_modules/@popperjs/core/dist/umd"),
        publicPath: "/popperjs",
        serveIndex: false,
        watch: false,
      },
      {
        directory: resolve("./build/dependencies"),
        publicPath: "/dependencies",
        serveIndex: false,
        watch: false,
      },
      {
        directory: resolve("./server"),
        publicPath: "/",
        serveIndex: true,
        watch: true,
      },
    ],
  },
  output: {
    path: resolve("./build"),
    filename: "edith.js",
    library: "Edith",
    libraryTarget: "umd",
  },
  target: "browserslist",
  externals: {
    "@popperjs/core": {
      root: "Popper",
      commonjs: "Popper",
      commonjs2: "Popper",
      amd: "Popper",
    },
    codemirror: {
      root: "CodeMirror",
      commonjs: "CodeMirror",
      commonjs2: "CodeMirror",
      amd: "CodeMirror",
    },
    "@codemirror/lang-html": {
      root: "CodeMirror",
      commonjs: "CodeMirror",
      commonjs2: "CodeMirror",
      amd: "CodeMirror",
    },
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "edith.css",
    }),
  ],
};
