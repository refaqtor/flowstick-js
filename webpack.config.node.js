const devConfigs = require('./webpack.config.development');

module.exports = {
  resolve: {
    extensions: devConfigs.resolve.extensions,
    alias: {
      electron: './test/mocks/electron',
    },
  },
  output: {
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: devConfigs.module.loaders.slice(1),  // remove babel-loader
  },
};
