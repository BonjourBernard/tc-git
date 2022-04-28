require('console-color-mr');
//引入shelljs
const shell = require('shelljs')
const prompt = require('../../lib/prompt')
const question = require('../../lib/question')
const charset = 'utf-8';
const MASTER_BRANCH = 'SX_WEB_QA'

function checkLoaclStatus() {
    return new Promise((resolve, reject) => {
        shell.echo(`检查本地是否有未提交的代码`.yellow);
        shell.exec(`git status`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git status 错误信息： ${stderr}`)
                return
            }
            // 说明有改动没有保存
            if (stdout && stdout.indexOf('Changes not staged for commit') > -1) {
                reject('请先提交本地改动')
                return
            }
            resolve()
        })
    })
}
function checkoutMaster() {
    return new Promise((resolve, reject) => {
        shell.echo(`切换至项目主分支${MASTER_BRANCH.blueBG}`.yellow);
        shell.exec(`git checkout ${MASTER_BRANCH}`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git checkout 错误信息： ${stderr}`)
                return
            }
            resolve()
        })
    })
}
function getType() {
    const option = { // 选项参数
        type: 'list',
        name: 'branchType',
        message: '请选择分支类型: ',
        chioces: [
            {
                name: '开发分支',
                value: 'dev',
            },
            {
                name: '补丁分支',
                value: 'hotfix',
            }
        ]
    }
    return prompt(option)
}
async function getBranchName(projectName) {
    const projectTag = await question(`请输入项目标识(默认${projectName.blueBG}): `.green)
    const branchName = await question('请输入分支名称: '.green)
    const name = `${projectTag || projectName}_${branchName}`
    return name
}
function branchNew(fullName) {
    return new Promise((resolve, reject) => {
        shell.echo(`生成新分支${fullName.blueBG}`.yellow);
        shell.exec(`git checkout -b ${fullName}`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git checkout -b 错误信息： ${stderr}`)
                return
            }
            resolve()
        })
    })
}

module.exports = async function (projectName) {
    try {
        await checkLoaclStatus()
        // await checkoutMaster()
        const { value } = await getType()
        const name = await getBranchName(projectName)
        await branchNew(`${value}-${name}`)
    } catch (e) {
        shell.echo(e.red)
    } finally {
        shell.exit(0)
    }
}
