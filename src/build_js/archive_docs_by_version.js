
const fs      = require('fs'),
      path    = require('path');

const rimraf  = require('rimraf');

const package = require('../../package.json');

const docsdir = './docs/docs/';





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





copyFolderSync(docsdir + 'current/', docsdir + 'v' + package.version + '/');





console.log(`# Cloned current docs to archival directory for ${package.version}; finished`);
