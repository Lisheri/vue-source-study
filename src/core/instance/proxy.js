/* not type checking this file because flow doesn't play well with Proxy */

import config from 'core/config'
import { warn, makeMap, isNative } from '../util/index'

let initProxy

if (process.env.NODE_ENV !== 'production') {
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )
  // * 返回以上以逗号隔开为键名的对象，所有的值都是true

  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
  }

  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    )
  }

  // * 检测浏览器是否支持Proxy
  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy)

  if (hasProxy) {
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
          return false
        } else {
          target[key] = value
          return true
        }
      }
    })
  }

  const hasHandler = {
    has (target, key) {
      // * 如果元素key不在target中，则has 为false
      const has = key in target
      // * 在allowedGlobals将全局方法都设置为了true
      // * 也就是说如果key是一个全局方法或者是一个私有方法，那么isAllowed就是true
      const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
      // * 如果既不是在target中，也不是一个全局方法或私有方法，那就直接抛错
      // * 这个报错实际上很常见，就是在data中没有定义，就开始使用并且该属性也不是vm上的私有属性
      // * 实际上Vue的警告都会在开发环境抛出来，生茶环境是看不到的
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }

  const getHandler = {
    get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return target[key]
    }
  }

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // * 如果浏览器支持Proxy
      // determine which proxy handler to use
      const options = vm.$options
      // * Proxy主要是对对象访问做一个劫持，在此处handlers指向的是hasHandler
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
        // * 代理配置
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

export { initProxy }
