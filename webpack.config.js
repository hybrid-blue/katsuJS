const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'A Single Page Application',
      template: './src/index.html',
      filename: './index.html'
    })
  ],
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'bundle.js',
    library: '_'
  },
  devServer: {
    contentBase: './dist',
    historyApiFallback: true,
  },
  externals: {
    lodash: {
    commonjs: 'lodash',
    commonjs2: 'lodash',
    amd: 'lodash',
    root: '_',
  },
 },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  }
};
