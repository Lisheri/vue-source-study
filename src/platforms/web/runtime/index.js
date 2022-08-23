/* @flow */

// * 发现这里的Vue也是从其他地方import来的
import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch'
import platformDirectives from './directives/index'
import platformComponents from './components/index'

// install platform specific utils(导入和平台相关的特定通用方法)
// * 判断是否是关键属性(比如表单元素的 input/check/selected/muted)
// * 如果是这些属性, 设置el.props属性(属性不设置到标签上)
Vue.config.mustUseProp = mustUseProp // 必须使用Prop
Vue.config.isReservedTag = isReservedTag // 判断是否保留标签
Vue.config.isReservedAttr = isReservedAttr // 判断是否保留属性
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
// * 通过extend方法注册了一些和平台相关的全局的指令和组件
// ? 指令为v-model和v-show
extend(Vue.options.directives, platformDirectives)
// ? 注册的组件其实就是v-transition和v-transition-group
extend(Vue.options.components, platformComponents)

// install platform patch function
// * patch函数的作用就是将虚拟dom转换为真实dom
// * 此处针对浏览器环境扩展一个patch函数, 非浏览器环境返回一个noop(空函数)
// * inBrowser其实就是通过判断是否存在 window 这个对象, 存在就判断为浏览器环境
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
// 在Vue原型上增加一个$mount方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // * 内部调用mountComponent, 用于渲染DOM
  return mountComponent(this, el, hydrating)
}

// devtools global hook
// 给 devtools 使用的代码
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test'
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}

export default Vue
