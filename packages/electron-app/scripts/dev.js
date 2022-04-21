/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 22:26:12 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-20 22:40:55
 */
'use strict';

const startWebpack = require('../../react-app/scripts/dev');
const openWindow = require('../src/main');


if (module === require.main) {
  startWebpack(openWindow).then(process.exit);
}
