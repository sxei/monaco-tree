const path = require('path');
const fs = require('fs');

module.exports = {
  entry: './src/index.js',
  
  output: {
    filename: 'js/index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NiceMonacoTree',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },

  devServer: {
    inline: true,
    contentBase: path.resolve(__dirname, 'dist'),
    host: '127.0.0.1',
    port: 9527,
    historyApiFallback: true
  },
  
  module: {
    rules: [
        {
          test: /\.html$/,
          use: ["file?name=[name].[ext]"]
        },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        resolve: {
          extensions: ['.js', '.jsx']
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      // {
      //   test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: "file-loader",
      //   options: {
      //       outputPath: 'assets',
      //   }
      // },
      // {
      //   test: /\.(jpe?g|png|gif)$/i, 
      //   loader: "file-loader?name=/img/[name].[ext]"
      // },
      {
        // svg图标都很小，直接用base64打包
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
            name: './images/[name].[ext]',
            limit: 999999
        }
      }
    ]
  }

};