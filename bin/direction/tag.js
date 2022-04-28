require('console-color-mr');
//引入shelljs
const shell = require('shelljs')
const prompt = require('../../lib/prompt')
const question = require('../../lib/question')
const charset = 'utf-8';

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
function getOldTag() {
    return new Promise((resolve, reject) => {
        shell.echo(`查看当前分支最新tag`.yellow);
        shell.exec(`git describe --abbrev=0 --tags`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git checkout 错误信息： ${stderr}`)
                return
            }
            resolve(stdout.substr(0, 20))
        })
    })
}
function creatTag(tagVersion) {
    return new Promise((resolve, reject) => {
        shell.echo(`创建tag: ${tagVersion.blueBG}`.yellow);
        shell.exec(`git tag -a ${tagVersion} -m ${tagVersion} `, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git tag 错误信息： ${stderr}`)
                return
            }
            console.log(`${tagVersion.blueBG} 创建成功`.green)
            shell.exec(`git push origin ${tagVersion} `, {
                encoding: charset
            }, (code, stdout, stderr) => {
                if (code !== 0) {
                    reject(`git 推送 tag 错误信息： ${stderr}`)
                    return
                }
                console.log(`${tagVersion}发布成功`.green)
                resolve()
            })
        })
    })
}
function getTodayStr(){
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    
    return `${year}.${month<10?('0' + month):month}.${day<10?('0' + day):day}`
}
function getNewTag(oldTag,projectName) {
    let today = getTodayStr()
    let todayVersion = 1
    if (!!oldTag && oldTag.indexOf(projectName) > -1) {
        const dateAndVersion = oldTag.split('_V')[1]
        const version = dateAndVersion.substr(dateAndVersion.length - 2, 2)
        const oldTagDate = dateAndVersion.substr(0, dateAndVersion.length - 3)
        if(today == oldTagDate){
            todayVersion = parseInt(version) + 1
        }
    }
    todayVersion = todayVersion.toString()
    if (todayVersion.length == 1) todayVersion = `0${todayVersion}`

    return `${projectName}_V${today}.${todayVersion}`
}

function getTagDirection(tag) {
    const option = { // 选项参数
        type: 'list',
        name: 'tagDirection',
        message: `将要创建${tag.blueBG},是否确认；`,
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
module.exports = async function (projectName) {
    try {
        // await checkLoaclStatus()
        const oldTag = await getOldTag()
        const newTag = getNewTag(oldTag,projectName)
        const { value: doCreatTag } = await getTagDirection(newTag)
        if (doCreatTag) await creatTag(newTag)
        else {
            let customTag = ''
            while (!customTag) {
                customTag = await question(`请输入tag(必填): `.green)
            }
            await creatTag(customTag)
        }
    } catch (e) {
        shell.echo(e.red)
    } finally {
        shell.exit(0)
    }
}
