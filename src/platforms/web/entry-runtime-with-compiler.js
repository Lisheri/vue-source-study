/* @flow */
// * 使用flow进行类型检查
// * 从入口开始
import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

// * 首先引入一个Vue从runtime下面的index.js中
import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// * 首先获取到了原型上的$mount方法，然后使用mount缓存起来
const mount = Vue.prototype.$mount
// * 为什么要重新定义一遍，主要是因为上面的mount是给runtime-only版本直接用的，下面这一块的逻辑在runtime-only中是没有的
// * el参数可以是一个字符串也可以是一个Element节点
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  // * 如果el是一个body或者是html文档标签，那么就会抛错，然后直接返回
  // * 如果是body或者html标签，在编译之后就会直接将body或者html标签直接覆盖了，会导致整个html文档就错了，因此在开发环境直接报错
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // * 判断是否定义了render方法
  if (!options.render) {
    // * 判断是否存在template
    let template = options.template
    if (template) {
      // * template可以是一个"#xxx"这种形式
      if (typeof template === 'string') {
        // * 如果template是一个string，并且是#开头，那么将执行idToTemplate，判断是否存在该id的选择器，如果存在则返回该选择器下面的内容赋值给template，如果不存在，则template会得到一个空字符串
        // * 如果template是一个空字符串，那么在开发环境就会抛错
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // * 如果template是一个标签，那么就将内部的所有节点取出来，赋值给新的template
        template = template.innerHTML
      } else {
        // * 如果存在template，但是既不是一个string也不是一个ELement，直接抛错
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // * 如果没有template有el，则获取el所在的dom节点，如果el所在的dom节点不存在，则创建一个空的div,拿到div的InnerHTML
      // ! outerHTML是一个字符串,此处的template是一个字符串
      template = getOuterHTML(el)
    }
    if (template) {
      // * 以下为编译部分
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // * 通过compileToFunctions编译函数拿到一个render函数和静态staticRenderFns函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      // * 然后赋值给options的render函数和staticRender函数
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // * 这一步$mount主要就是拿到el，然后判断是否存在render函数，如果没有render函数，就把template转换为一个render函数
  // * 也就是说Vue只认识一个render函数，如果说有render函数，那就直接忽略上面所有的步骤，直接走到这一步
  // * 这里的this指向Vue实例
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    // * 如果存在则返回el本身的标签
    return el.outerHTML
  } else {
    // * 如果不存在则创建一个新的标签并返回
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
