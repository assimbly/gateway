const fs = require('fs');
const path = require('path');

const tsconfig = require('../tsconfig.json');

module.exports = {
    parseVersion,
    root,
	mapTypescriptAliasToWebpackAlias,
    isExternalLib
};

// Returns the second occurrence of the version number from `build.gradle` file
function parseVersion() {
    const versionRegex = /^version\s*=\s*[',"]([^',"]*)[',"]/gm; // Match and group the version number
    const buildGradle = fs.readFileSync('build.gradle', 'utf8');
    return versionRegex.exec(buildGradle)[1];
}

const _root = path.resolve(__dirname, '..');

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [_root].concat(args));
}

function isExternalLib(module, check = /node_modules/) {
    const req = module.userRequest;
    if (typeof req !== 'string') {
        return false;
    }
    return req.search(check) >= 0;
}

function mapTypescriptAliasToWebpackAlias(alias = {}) {
  const webpackAliases = { ...alias };
  if (!tsconfig.compilerOptions.paths) {
    return webpackAliases;
  }
  Object.entries(tsconfig.compilerOptions.paths)
    .filter(([key, value]) => {
      // use Typescript alias in Webpack only if this has value
      return Boolean(value.length);
    })
    .map(([key, value]) => {
      // if Typescript alias ends with /* then remove this for Webpack
      const regexToReplace = /\/\*$/;
      const aliasKey = key.replace(regexToReplace, '');
      const aliasValue = value[0].replace(regexToReplace, '');
      return [aliasKey, root(aliasValue)];
    })
    .reduce((aliases, [key, value]) => {
      aliases[key] = value;
      return aliases;
    }, webpackAliases);
  return webpackAliases;
}
