/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 14:45:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-20 22:28:03
 */
'use strict';

const path = require('path');
const fs = require('fs');
const packager = require('electron-packager');
const {
  author,
  productName,
  version
} = require('../package.json');


/**
 * @returns {Promise<number>}
 * @see https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html
 */
const bundleElectronApp = async () => {
  const entryDir = path.join(__dirname, '..', 'build');
  const entryFile = path.join(__dirname, '..', 'tasks', 'electron', 'main.js');
  const preloadFile = path.join(__dirname, '..', 'tasks', 'electron', 'preload.js');

  if (!fs.existsSync(entryDir)) {
    console.error(
      `Cannot find dir "${entryDir}", maybe you need to build React app first.`
    );

    return 1;
  }

  const packageData = {
    name: productName,
    author,
    version,
    main: './electron/main.js',
  };

  if (fs.existsSync(path.join(entryDir, 'electron'))) {
    fs.rmSync(path.join(entryDir, 'electron'), { force: true, recursive: true });
  }

  fs.mkdirSync(path.join(entryDir, 'electron'));
  const tmpEntry = path.join(entryDir, 'electron', 'main.js');
  const tmpPreload = path.join(entryDir, 'electron', 'preload.js');
  const tmpPkgJSON = path.join(entryDir, 'package.json');

  fs.copyFileSync(entryFile, tmpEntry);
  fs.copyFileSync(preloadFile, tmpPreload);
  fs.writeFileSync(
    tmpPkgJSON,
    JSON.stringify(packageData, undefined, 2) + '\n',
    {
      encoding: 'utf-8'
    }
  );

  const appPaths = await packager({
    name: productName,
    appVersion: `${version}`,
    appBundleId: `bundle-${version}`,
    buildVersion: `${version}`,
    dir: entryDir,
    electronZipDir: path.join(__dirname, '..', 'electron-cache'),
    executableName: productName,
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    ignore: ['.espoir'],
    out: path.join(__dirname, '..', 'output'),
    overwrite: true,
    platform: ['win32'],
    tmpdir: path.join(__dirname, '..', 'output-tmp'),
    win32metadata: {
      CompanyName: author.split(/ +/)[0],
      FileDescription: productName,
      InternalName: productName,
      ProductName: productName,
    },
    appCategoryType: 'public.app-category.education',
    darwinDarkModeSupport: true,
  });
  
  console.log(`Electron app bundles created:\n${appPaths.join('\n')}`);

  console.log('Remove temporary files');

  fs.rmSync(tmpPkgJSON);
  fs.rmSync(path.join(entryDir, 'electron'), { force: true, recursive: true });

  return 0;
};


if (module === require.main) {
  bundleElectronApp().then(process.exit);
}
