const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  build: [
    scripts.build,
    kpo.json('./pkg/package.json', ({ json }) => ({
      ...json,
      files: [...json.files, 'react/']
    })),
    kpo.json('./pkg/react/package.json', () => ({
      sideEffects: false,
      name: 'supersour/react',
      main: '../dist/react/index.js',
      types: '../dist/react/index.d.ts',
      esnext: '../dist-src/react/index.js'
    })),
    kpo.series('npm pack', { cwd: './pkg' })
  ],
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
