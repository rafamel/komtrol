const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  build: [
    kpo.kpo`docs:uml`,
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
  'docs:uml': 'puml generate assets/diagram.puml -o assets/diagram.png',

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
