const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './demo/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'A KatsuJS App',
      template: './demo/index.html',
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
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8000,
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
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      }
    ],
  }
};
