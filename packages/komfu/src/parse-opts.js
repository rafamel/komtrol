export default function parseOpts({ args, defaults = {}, string } = {}) {
  let options = {};
  if (args[1] !== undefined) {
    if (typeof args[0] === 'object') {
      options = args.shift();
    } else if (string && typeof args[0] === 'string') {
      const str = args.shift();
      options[string] = str;
    }
  }
  return [Object.assign({}, defaults, options), args];
}
