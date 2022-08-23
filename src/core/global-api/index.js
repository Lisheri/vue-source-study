/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // * 初始化 Vue.config 对象
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 这些工具方法不视作全局API的一部分, 除非已经意识到某些风险, 否则不要依赖他们
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 静态方法 set/delete/nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 让一个对象编程可响应的
  Vue.observable = <T>(obj: T): T => {
    // * 传入一个对象, 让他变成响应式对象
    observe(obj)
    return obj
  }

  // * 初始化`Vue.options`对象, 并扩展, 主要有 `components/directives/filters`
  // * 创建一个空对象
  Vue.options = Object.create(null)
  // * 在ASSET_TYPES中定义了三个方法: component, directive 和 filter 
  ASSET_TYPES.forEach(type => {
    // 初始化
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // * 在此处初始化Vue的options,将options._base设置为Vue，然后在初始化的时候合并options
  // 缓存 Vue构造函数, 指向 Vue.options._base
  Vue.options._base = Vue
  // * 这里将base指向Vue
  // * builtInComponents是一个内置组件, 通过extend方法将其拓展到了components下面
  // * 其实就是注册全局内置组件 ———— keep-alive 组件
  extend(Vue.options.components, builtInComponents)

  // 注册 Vue.use()用来注册插件
  initUse(Vue)
  // 注册 Vue.mixin() 实现全局混入
  initMixin(Vue)
  // 注册 Vue.extend() 基于传入的options返回一个组件的构造函数
  initExtend(Vue)
  // 注册 Vue.directive()、Vue.component() 和 Vue.filter()
  initAssetRegisters(Vue)
}
