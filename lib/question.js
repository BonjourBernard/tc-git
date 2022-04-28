
const readline = require('readline');

module.exports = function (title) {
    return new Promise((rs, rj) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(title, data => {
            rl.pause() // 关闭 readline 输入
            rl.close() // 调用 readline 关闭方法
            rs(data)
        })
    })
}