
const fs      = require('fs'),
      path    = require('path');

const rimraf  = require('rimraf');

const package = require('../../package.json');





const docsdir = './docs/docs/',
      tempdir = '../cbjs_docs_temp/',
      currdir = './docs/current/',
      versdir = `./docs/v${package.version}/`;





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





if (process.env['STEP'] === 'TEMPORARY') {       // Are we at the pre-other-checkout step?
  copyFolderSync(docsdir, tempdir);                // Put the generated docs somewhere they can be re-gotten

} else if (process.env['STEP'] === 'ARCHIVE') {  // Are we at the store the post-checkout docs step?
  rimraf.sync(currdir);                            // destroy the previous `current` directory
  copyFolderSync(tempdir, currdir);                // clone into `current` (clone remakes dir)
  copyFolderSync(tempdir, versdir);                // clone into version directory also

} else {                                         // Otherwise where are we?
  throw new Error('No process step, failing');

}





console.log(`# Cloned current docs to archival directory for ${package.version}; finished`);
