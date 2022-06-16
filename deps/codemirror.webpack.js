import { resolve } from "path";

export default {
  entry: "./deps/codemirror.js",
  output: {
    path: resolve("./build/dependencies"),
    filename: "codemirror.js",
    library: {
      name: "CodeMirror",
      type: "umd",
    },
  },
  target: "browserslist",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
      },
    ],
  },
};
