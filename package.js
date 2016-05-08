/* eslint strict: 0, no-shadow: 0, no-unused-vars: 0, no-console: 0 */
'use strict';
const os = require('os');
const webpack = require('webpack');
const cfg = require('./webpack.config.production.js');
const packager = require('electron-packager');
const del = require('del');
const exec = require('child_process').exec;
const argv = require('minimist')(process.argv.slice(2));
const pkg = require('./package.json');
const devDeps = Object.keys(pkg.devDependencies);

const appName = argv.name || argv.n || pkg.productName;
const shouldUseAsar = argv.asar || argv.a || false;
const shouldBuildAll = argv.all || false;

const DEFAULT_OPTS = {
  dir: './',
  name: appName,
  asar: shouldUseAsar,
  icon: 'icon',
  ignore: [
    '^/test($|/)',
    '^/tools($|/)',
    '^/release($|/)',
    '^/interfaces($|/)',
  ].concat(devDeps.map(name => `/node_modules/${name}($|/)`)),
};

const version = argv.version || argv.v;

if (version) {
  DEFAULT_OPTS.version = version;
  startPack();
} else {
  // use the same version as the currently-installed electron-prebuilt
  exec('npm list electron-prebuilt --dev', (err, stdout) => {
    if (err) {
      DEFAULT_OPTS.version = '0.37.2';
    } else {
      DEFAULT_OPTS.version = stdout
        .split('electron-prebuilt@')[1].replace(/\s/g, '');
    }
    startPack();
  });
}

function startPack() {
  console.log('Starting wepack build...');
  webpack(cfg, (err, stats) => {
    if (err) {
      return console.error(err);
    }
    console.log('Finished wepack build...');
    del('release')
      .then(() => {
        console.log('Starting platform builds...');
        if (shouldBuildAll) {
          const archs = ['ia32', 'x64'];
          const platforms = ['linux', 'win32', 'darwin'];

          platforms.forEach(plat => {
            archs.forEach(arch => {
              pack(plat, arch, log(plat, arch));
            });
          });
        } else {
          pack(os.platform(), os.arch(), log(os.platform(), os.arch()));
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
}

function pack(plat, arch, cb) {
  if (plat === 'darwin' && arch === 'ia32') {
    // There is no darwin ia32 electron.
    return;
  }
  const iconObj = {
    icon: DEFAULT_OPTS.icon + (() => {
      let extension = '.png';
      if (plat === 'darwin') {
        extension = '.icns';
      } else if (plat === 'win32') {
        extension = '.ico';
      }
      return extension;
    })(),
  };

  const opts = Object.assign({}, DEFAULT_OPTS, iconObj, {
    platform: plat,
    arch,
    prune: true,
    'app-version': pkg.version || DEFAULT_OPTS.version,
    out: `release/${plat}-${arch}`,
  });

  packager(opts, cb);
}


function log(plat, arch) {
  return err => {
    if (err) {
      return console.error(err);
    }
    console.log(`${plat}-${arch} finished!`);
  };
}
