const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'A KatsuJS App',
      template: './src/index.html',
      filename: './index.html'
    })
  ],
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: 'bundle.js',
    library: 'Katsu',
    libraryTarget: 'umd',
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
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ],
  }
};
