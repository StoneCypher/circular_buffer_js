
const fs      = require('fs'),
      path    = require('path');

const rimraf  = require('rimraf');

const base    = require('./base-package.json');





function copyFolderSync(from, to) {

  rimraf.sync(to);

  if (!fs.existsSync(to)) {
    fs.mkdirSync(to);
  } else {
    throw "# !!! Version target directory mustn't exist after rimraf!";
  }

  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });

}





rimraf.sync(`./docs/docs/${base.version}/`);
copyFolderSync('./docs/docs/current/', `./docs/docs/${base.version}/`)

console.log(`# Cloned current docs to archival directory for ${package.version}; finished`);
