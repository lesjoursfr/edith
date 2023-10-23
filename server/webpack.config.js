import { resolve } from "path";
import * as sass from "sass";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

export default {
  mode: "development",
  entry: resolve("./server/index.ts"),
  devServer: {
    host: "127.0.0.1",
    port: 8084,
    static: [
      {
        directory: resolve("./node_modules/@popperjs/core/dist/umd"),
        publicPath: "/popperjs",
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
    filename: "colorpicker.js",
    library: "Colorpicker",
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
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: sass,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "colorpicker.css",
    }),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: [{ preset: "default" }],
        minify: [CssMinimizerPlugin.cssnanoMinify],
      }),
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
