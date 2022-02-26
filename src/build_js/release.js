
const fs           = require('fs'),
      { execSync } = require('child_process'),
      package      = JSON.parse(fs.readFileSync('./package.json')),
      version      = `v${package.version}`,
      command      = `gh release create ${version} -F ./CHANGELOG.md`;

console.log( `${execSync(command)}` );
