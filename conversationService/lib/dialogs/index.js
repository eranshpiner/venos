const glob = require('glob');
const path = require('path');

glob
  .sync(path.resolve(__dirname, './**/*.js'))
  .forEach(f => {
      if (!f.endsWith('index.js')) {
        module.exports[f.substring(f.lastIndexOf('/') + 1, f.length - 3)] = require(path.resolve(f));
      }
    }
  );
