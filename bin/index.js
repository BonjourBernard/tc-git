#!/usr/bin/env node
require('console-color-mr');
const createBranch = require('./direction/branch');
const commit = require('./direction/commit');
const push = require('./direction/push');
const tag = require('./direction/tag');
const path = require('path');
const root = process.cwd()
const { name } = require(path.resolve(root, 'package.json'))
const PROJECT_NAME = name.toLocaleUpperCase()
var args = process.argv.splice(2)
if (!args[0]) {
    warnFunc()
}
console.log(`${args}操作`.green)
function warnFunc() {
    console.log('无效命令'.red)
    console.log('请输入：'.yellow + 'yarn git -- '.green + '${命令}'.blue)
    process.exit(0)
}
const direction = args[0].toLowerCase()
switch (direction) {
    case 'branch':
        createBranch(PROJECT_NAME);
        break;
    case 'commit':
        commit(PROJECT_NAME);
        break;
    case 'push':
        push(PROJECT_NAME);
        break;
    case 'tag':
        tag(PROJECT_NAME);
        break;
    default:
        warnFunc(PROJECT_NAME)
        break;
}