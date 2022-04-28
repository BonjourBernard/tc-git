require('console-color-mr');
//引入shelljs
const shell = require('shelljs')
// git 对所有冲突的地方都会生成下面这种格式的信息，所以写个检测冲突文件的正则
// const isConflictRegular = "^<<<<<<<\\s|^=======$|^>>>>>>>\\s"
const charset = 'utf-8';

function checkClash() {
    return new Promise((resolve, reject) => {
        // git grep 命令会执行 perl 的正则匹配所有满足冲突条件的文件
        // 换为git diff --check
        shell.echo(`判断是否有冲突`.yellow);
        shell.exec(`git diff --check`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`存在冲突代码，请检查`)
                return
            }
            console.log(`不存在冲突代码，开始上传`.green)
            resolve()
        })
    })
}
function pullCode() {
    return new Promise((resolve, reject) => {
        shell.echo(`执行git pull`.yellow);
        shell.exec(`git pull`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`拉取代码失败：${stderr}`)
                return
            }
            console.log(`拉取代码成功，开始检查冲突`.green)
            resolve()
        })
    })
}
function pushCode() {
    return new Promise((resolve, reject) => {
        shell.echo(`执行git push`.yellow);
        shell.exec(`git push`, {
            encoding: charset
        }, (code, stdout, stderr) => {
            if (code !== 0) {
                reject(`git push 失败：${stderr}`)
                return
            }
            console.log(`git push 成功`.green)
            resolve()
        })
    })
}

module.exports = async function () {
    try {
        await pullCode()
        await checkClash()
        await pushCode()
    } catch (e) {
        shell.echo(e.red)
    } finally {
        shell.exit(0)
    }
}
