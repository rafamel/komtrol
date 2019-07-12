const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  bootstrap: ['lerna bootstrap', 'kpo @komfu build'],
  build: ['kpo @komfu build', 'kpo :stream --exclude komfu build'],
  link: 'lerna link',

  /* Hooks */
  postinstall: 'kpo bootstrap'
};
