/* @flow */

import { noop, extend } from 'shared/util'
import { warn as baseWarn, tip } from 'core/util/debug'
import { generateCodeFrame } from './codeframe'

type CompiledFunctionResult = {
  render: Function;
  staticRenderFns: Array<Function>;
};

// 通过new Function将字符串形式的代码转换为函数
// 通过try catch包裹一层, 如果转换过程中有错, 则将错误信息存储起来, 并返回空函数
function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    // 收集错误信息
    errors.push({ err, code })
    return noop
  }
}

export function createCompileToFunctionFn (compile: Function): Function {
  // 首先定义了一个 cache空对象(无原型), 目的是通过闭包缓存编译后的结果
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    // 首先通过extend克隆了一份 options(Vue中初始化时传入的options, 目的是为了防止污染原始options, 是个浅拷贝)
    options = extend({}, options)
    // 获取warn函数, 在开发环境中于控制台发送警告
    const warn = options.warn || baseWarn
    delete options.warn

    /* istanbul ignore if */
    // 这里主要是判断当前环境是否支持eval或动态生成函数去执行, 若不行, 则开发环境报错
    if (process.env.NODE_ENV !== 'production') {
      // detect possible CSP restriction
      try {
        new Function('return 1')
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          )
        }
      }
    }

    // check cache
    // 1. 读取缓存中的 compiledFunctionResult 对象, 如果有则直接返回
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      // 判断缓存中是否有结果, 如果有则直接获取缓存中编译后的渲染函数返回, 不必再次编译
      // 空间换时间
      // 模板内容作为key, delimiters这个属性只有完整版的vue才有, 编译时才会使用, 作用是改变插值表达式使用的符号
      // 差值表达式默认使用{{}}, 通过这个属性, 可以将插值表达式改成任意的内容, 比如模板字符串
      return cache[key]
    }

    // compile
    // 2. 将模板编译为编译对象(render, staticRenderFns), 字符串形式的js代码
    // 调用compile开始进行编译, 将模板和用户传入的选项传递给compile
    // 编译结束后会返回一个对象, 内部有render 和 staticRenderFns两个成员
    // 此时的render函数中, 存储的是字符串形式的js代码
    const compiled = compile(template, options)

    // check compilation errors/tips
    // 上述compile生成的对象中还有两个辅助属性, 一个是errors, 一个是tips
    // 在编译过程中, 会遇到一些错误信息, 这里在开发环境下将这些信息打印出来
    if (process.env.NODE_ENV !== 'production') {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(e => {
            warn(
              `Error compiling template:\n\n${e.msg}\n\n` +
              generateCodeFrame(template, e.start, e.end),
              vm
            )
          })
        } else {
          warn(
            `Error compiling template:\n\n${template}\n\n` +
            compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
            vm
          )
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(e => tip(e.msg, vm))
        } else {
          compiled.tips.forEach(msg => tip(msg, vm))
        }
      }
    }

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    // 3. 把字符串形式的js代码转换成js方法
    // 调用 createFunction 将字符串形式的js代码转换为函数
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    // 开发环境打印编译产生的错误信息
    if (process.env.NODE_ENV !== 'production') {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          `Failed to generate render function:\n\n` +
          fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'),
          vm
        )
      }
    }

    // 最后缓存结果并返回结果
    // 最终的结果就是 render和staticRenderFns
    // 4. 缓存并返回res对象(render, staticRenderFns方法)
    return (cache[key] = res)
  }
}
