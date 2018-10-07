const registerSx = (sx, _ = (global.SX = {})) =>
  Object.keys(sx).forEach((key) => (global.SX[key] = sx[key]));
const sx = (name) => `node -r ./package-scripts.js -e "global.SX.${name}()"`;
const scripts = (x) => ({ scripts: x });
const exit0 = (x) => `${x} || ${bin('shx')} echo `;
const series = (x) => `(${x.join(') && (')})`;
// const intrim = (x) => x.replace(/\n/g, ' ').replace(/ {2,}/g, ' ');
const bin = (x) => `../../node_modules/.bin/${x}`;

const OUT_DIR = 'lib';

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: series([
    'nps validate',
    exit0(`${bin('shx')} rm -r ${OUT_DIR}`),
    `${bin('shx')} mkdir ${OUT_DIR}`,
    `${bin('babel')} src --out-dir ${OUT_DIR}`
  ]),
  watch: `${bin('onchange')} "./src/**/*.{js,jsx,ts}" -i -- nps private.watch`,
  fix: `${bin('prettier')} --write "./**/*.{js,jsx,ts,json,scss}" \
--config ../../.prettierrc.js --ignore-path ../../.prettierignore`,
  lint: {
    default: `eslint ./src --ext .js`,
    test: `eslint ./test --ext .js`,
    md: `${bin('markdownlint')} *.md --config ../../markdown.json`
  },
  test: {
    default: `nps lint.test && ${bin('jest')} ./test/.*.test.js`,
    watch: `${bin(
      'onchange'
    )} "./{test,src}/**/*.{js,jsx,ts}" -i -- nps private.test_watch`
  },
  validate: 'nps fix lint lint.test lint.md test private.validate_last',
  update: 'npm update --save/save-dev && npm outdated',
  clean: `${exit0(`${bin('shx')} rm -r ${OUT_DIR} coverage`)} && ${bin(
    'shx'
  )} rm -rf node_modules`,
  // Private
  private: {
    watch: `${sx('clear')} && nps lint && ${bin(
      'babel'
    )} src --out-dir ${OUT_DIR}`,
    test_watch: `${sx('clear')} && nps test`,
    validate_last: `npm outdated || ${sx('countdown')}`
  }
});

registerSx({
  clear: () => console.log('\x1Bc'),
  countdown: (i = 8) => {
    if (!process.env.MSG) return;
    console.log('');
    const t = setInterval(() => {
      process.stdout.write('\r' + process.env.MSG + ' ' + i);
      !i-- && (clearInterval(t) || true) && console.log('\n');
    }, 1000);
  }
});
