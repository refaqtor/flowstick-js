/* eslint strict: 0 */
'use strict';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
const baseConfig = require('./webpack.config.base');

const config = Object.create(baseConfig);
const cssConfig =
  'modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]';

config.devtool = 'source-map';

config.entry = './src/index';

config.output.publicPath = '../dist/';

config.module.loaders.push({
  test: /\.global\.scss$/,
  loader: ExtractTextPlugin.extract(
    'style-loader',
    'css-loader!sass-loader'
  ),
}, {
  test: /^((?!\.global).)*\.scss$/,
  loader: ExtractTextPlugin.extract(
    'style-loader',
    'css-loader?' + cssConfig + '!sass-loader'
  ),
});

config.plugins.push(
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    __DEV__: false,
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      /* eslint-disable camelcase */
      screw_ie8: true,
      /* eslint-enable camelcase */
      warnings: false,
    },
  }),
  new ExtractTextPlugin('style.css', { allChunks: true })
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
