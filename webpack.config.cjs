const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  entry: {
    index: path.resolve(process.cwd(), 'src', 'index.js'),
    view: path.resolve(process.cwd(), 'src', 'view.js'),
  },
};
