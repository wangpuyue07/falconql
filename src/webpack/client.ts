// WEBPACK (client)
// --------------------------------------------------------
// IMPORTS

/* NODE */
import * as path from 'path';

/* NPM */
import * as webpack from 'webpack';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as CompressionPlugin from "compression-webpack-plugin";
import * as merge from 'webpack-merge';

/* LOCAL */
import common from './common';
import css, {rules} from './css';

const isProdMode = process.env.NODE_ENV === 'production';

// webpack client config
const client: webpack.Configuration = {
  entry: [
    path.resolve(__dirname,'..','client','client.tsx')
  ],
  name: 'client',
  module: {
    rules: [
      ...css(),
      {
        test: /\.(woff|woff2|(o|t)tf|eot)$/,
        use: [
          {
            loader: "file-loader",
            query: {
              name: `assets/img/[name]${isProdMode ? ".[hash]" : ""}.[ext]`
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            query: {
              name: `assets/fonts/[name]${isProdMode ? ".[hash]" : ""}.[ext]`
            }
          }
        ]
      }
    ]
  },
  node: {
    console: true,
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  output: {
    path: path.resolve(__dirname, "..", "..", "dist", "public")
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          chunks: "all",
          enforce: true,
          name: "main",
          test: new RegExp(
            `\\.${rules.map(rule => `(${rule.ext})`).join("|")}$`
          )
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      chunkFilename: "assets/css/[id].css",
      filename: `assets/css/[name]${isProdMode ? ".[contenthash]" : ""}.css`
    }),

    // Add global variables
    new webpack.DefinePlugin({
      GRAPHQL: JSON.stringify(process.env.GRAPHQL),
      SERVER: false,
    })
  ]
};

/** merge client with common */
const mergedClient = merge(common,client);

/** dev config */
if(process.env.NODE_ENV === 'development'){
  mergedClient.devtool = 'inline-source-map';

  mergedClient.output.chunkFilename = '[name].js';
  mergedClient.output.filename = '[name].js';
}

/** prod config */
if(process.env.NODE_ENV === 'production'){
  mergedClient.devtool = 'source-map';

  mergedClient.output.chunkFilename = 'assets/js/[name].[chunkhash].js';
  mergedClient.output.filename = 'assets/js/[name].[chunkhash].js';

  mergedClient.plugins.append(new CompressionPlugin({
      cache: true,
      minRatio: 0.99
  }));
}

// EXPORTS
export default mergedClient;