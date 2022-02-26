
const fs           = require('fs'),
      { execSync } = require('child_process'),
      package      = JSON.parse(fs.readFileSync('./package.json')),
      version      = `v${package.version}`,
      command      = `echo gh release create ${version} -F ./CHANGELOG.md`;

console.log( command );
console.log( `${execSync('git --version')}` );
