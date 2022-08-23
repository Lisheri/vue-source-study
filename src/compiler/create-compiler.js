/* @flow */

import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  // baseOptions 平台相关的options
  // src/platforms/web/compiler/options中定义
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      // 模板
      template: string,
      // 选项, 调用compileToFunctions传入的选项(可以认为是用户传入的, Vue也是编译器的用户)
      options?: CompilerOptions
    ): CompiledResult {
      // 创建了一个 finalOptions, 原型指向了 baseOptions, 作用是用于合并 compile传入的options和baseOptions
      const finalOptions = Object.create(baseOptions)
      // 定义了两个数组
      // 存储编译过程中产生的错误
      const errors = []
      // 存储编译过程中产生的信息
      const tips = []

      // 将消息放入对应的数组中
      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      // 如果options存在, 则开始合并baseOptions和options
      if (options) {
        // 开发环境重写warn函数
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          // 合并模块(浅拷贝直接合并到一个数组中)
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          // 合并指令(baseOptions中的指令位于options.directives的原型上)
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        // 直接拷贝除 模块 和 指令以外的成员
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn

      // 模板编译的核心函数, 后续在看
      // 通过baseCompile将模板编译成render函数, 返回的是一个对象, 这个对象有两个成员, 分别是render函数和staticRenderFns
      // 此时的render中, 存储是字符串形式的js代码(上一节说过), 在入口函数 compileToFunctions中, 将字符串形式的js代码转换为了render函数
      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      // 在baseCompile中, 还会把编译的错误信息记录下来(通过调用finalOptions的warn方法, 将错误和信息记录到errors和tips数组中)
      // 然后将这两个数组记录到compiled的对象中
      compiled.errors = errors
      compiled.tips = tips
      // 最后返回该对象
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
