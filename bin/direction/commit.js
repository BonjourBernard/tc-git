require('console-color-mr');
//引入shelljs
const shell = require('shelljs')
const prompt = require('../../lib/prompt')
const question = require('../../lib/question')
const push = require('./push')
const charset = 'utf-8';

function addAll() {
    return new Promise((resolve, reject) => {
        shell.echo(`执行git add`.yellow);
        shell.exec(`git add .`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git add 失败：${stderr}`)
                return
            }
            console.log(`git add 成功，开始提交`.green)
            resolve()
        })
    })
}
function commitCode(commitMsg) {
    return new Promise((resolve, reject) => {
        shell.echo(`执行git commit`.yellow);
        shell.exec(`git commit -m "${commitMsg}"`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code == 1) {
                reject(`无数据可提交`)
                return
            }
            if (code !== 0) {
                reject(`git commit 失败：${stderr}`)
                return
            }
            console.log(`git commit 成功`.green)
            resolve()
        })
    })
}

function getType() {
    const option = { // 选项参数
        type: 'list',
        name: 'commitType',
        message: '请选择提交类型: ',
        chioces: [
            {
                name: '新功能',
                value: 'feat',
            },
            {
                name: '修复',
                value: 'fix',
            },
            {
                name: '打包',
                value: 'build',
            },
            {
                name: '构建或工具修改',
                value: 'chore',
            },
            {
                name: '优化',
                value: 'perf',
            },
            {
                name: '代码重构',
                value: 'refactor'
            }
            {
                name: '回退',
                value: 'revert',
            },
            {
                name: '测试用例修改',
                value: 'test',
            }
        ]
    }
    return prompt(option)
}
function getPushDirection(){
    const option = { // 选项参数
        type: 'list',
        name: 'pushDirection',
        message: '是否需要上传远端: ',
        chioces: [
            {
                name: '是',
                value: true,
            },
            {
                name: '否',
                value: false,
            }
        ]
    }
    return prompt(option)
}
module.exports = async function () {
    try {
        await addAll()
        const { name, value } = await getType()
        let msg = ''
        while (!msg) {
            msg = await question(`请输入commit message(必填): `.green)
        }
        const tapdUrl = await question(`请输入需求或缺陷tapd地址(选填): `.green)
        console.log('提交信息：'.yellow + `"${value} (${name}): ${msg.red} ${tapdUrl ? ('tapd地址：' + tapdUrl.blueBG) : ''}"`)
        await commitCode(`${value} (${name}): ${msg} ${tapdUrl ? ('tapd地址：' + tapdUrl) : ''}`)
        const { value: doPush } = await getPushDirection()
        doPush && await push()
    } catch (e) {
        shell.echo(e.red)
    } finally {
        shell.exit(0)
    }
}
