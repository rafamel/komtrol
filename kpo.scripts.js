const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  build: [scripts.build, kpo.series('npm pack', { cwd: './pkg' })],
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',
  docs: [scripts.docs, kpo.kpo`docs:uml`],
  'docs:uml': 'puml generate assets/diagram.puml -o assets/diagram.png',

  /* Private */
  ['$watch:task']: [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
