const EventsEmitter = require('events')
const readline = require('readline')

const MuteStream = require('mute-stream') // 用于沉默输出流
const ansiEscapes = require('ansi-escapes') // 用于输出空行



class List extends EventsEmitter { // List 实例, 继承 events
    constructor(option) {
        super()
        // 接收参数
        this.name = option.name
        this.message = option.message
        this.chioces = option.chioces
        // 创建输入、输出流
        this.input = process.stdin
        const ms = new MuteStream() // 封装沉默输出流
        ms.pipe(process.stdout)
        this.output = ms // 导入实例
        this.rl = readline.createInterface({ // 启动 readline 监听
            input: this.input,
            output: this.output,
        })
        this.selected = 0 // 默认选项下标
        this.heigth = 0 // 默认渲染行数，用于创建空行
        this.keypress = this.rl.input.on('keypress', this.onKeypress) // 监听键盘输入
        this.haveSelected = false // 是否选择完毕
    }

    onKeypress = (...keymap) => { // 处理键盘输入，keymap 为数组
        /**
        如:
        [
          undefined,
          {
            sequence: '\x1B[B',
            name: 'down',      
            ctrl: false,       
            meta: false,       
            shift: false,      
            code: '[B'
          }
        ]
        */
        let key = keymap[1] // 取第二个参数
        // 判断上下，操作 selected 下标
        if (key.name == 'up') {
            this.selected--
            if (this.selected < 0) {
                this.selected = this.chioces.length - 1
            }
            this.render() // 处理完执行渲染函数
        } else if (key.name == 'down') {
            this.selected++
            if (this.selected > this.chioces.length - 1) {
                this.selected = 0
            }
            this.render() // 处理完执行渲染函数
        } else if (key.name === 'return') { // 判断回车
            this.haveSelected = true // 完成选择
            this.render() // 处理完执行渲染函数
            this.close() // 调用关闭方法
            this.emit('exit', this.chioces[this.selected]) // 发布完成事件
        }
    }

    render() { // 渲染函数
        this.output.unmute() // 取消输出流静默
        this.clear() // 清屏
        this.output.write(this.getContent()) // 输出内容
        this.output.mute() // 静默输出流，让用户的输入，不会显示到控制台
    }

    getContent = () => { // 获取输出内容
        if (!this.haveSelected) { // 判断是否完成选择
            let title = '\x1B[32m?\x1B[39m \x1B[1m' + this.message +
                '\x1B[22m(Use arrow Keys)\x1B[0m\n' // 标题内容 \x1B[1m 加粗
            this.chioces.forEach((chioce, index) => { // 处理选项
                if (this.selected === index) {
                    if (index === this.chioces.length - 1) {
                        title += '\x1B[36m> ' + chioce.name + '\x1B[0m' // 当前选中，添加颜色
                    } else {
                        title += '\x1B[36m> ' + chioce.name + '\x1B[0m\n'
                    }
                } else {
                    if (index === this.chioces.length - 1) {
                        title += '  ' + chioce.name
                    } else {
                        title += '  ' + chioce.name + '\n'
                    }
                }
            })
            this.heigth = this.chioces.length + 1 // 保存显示内容行数
            return title
        } else {
            // 完成选择内容
            const name = this.chioces[this.selected].name
            let title = '\x1B[32m?\x1B[39m \x1B[1m' + this.message +
                '\x1B[22m\x1B[0m\x1B[36m' + name + '\x1B[39m\x1B[0m \n'
            return title
        }
    }

    clear() { // 清屏
        const emptyLines = ansiEscapes.eraseLines(this.heigth) // 根据函数通过 eraseLines 获取空行
        this.output.write(emptyLines) // 输出空行，完成清屏
    }

    close() { // 关闭
        this.output.unmute() // 输出流解除静默
        this.rl.output.end() // 结束输出流
        this.rl.pause() // 关闭 readline 输入
        this.rl.close() // 调用 readline 关闭方法
    }
}

module.exports = function (option) { // 核心方法
    return new Promise(function (resolve, reject) { // 返回一个 Promise
        try {
            const list = new List(option); // 构建 List 实例
            list.render(); // 调用渲染方法，渲染出列表
            list.on('exit', function (answer) { // 监听退出
                resolve(answer) // 返回结果
            })
        } catch (e) {
            reject(e) // 返回错误
        }
    })
}