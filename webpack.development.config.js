const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "development",
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src/styles'),
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(fsh|vsh)$/,
        include: path.resolve(__dirname, 'scripts/GDRenderW/assets/shaders'),
        use: [
          'raw-loader',
        ],
      },
    ],
  },
};