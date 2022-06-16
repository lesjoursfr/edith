import { resolve } from "path";

export default {
  entry: "./server/deps/codemirror.js",
  output: {
    path: resolve("./server/builds"),
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
