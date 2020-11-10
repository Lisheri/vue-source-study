/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  // * extend 传入一个对象，返回是一个函数
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // * 这里的this并不是实例vm，而是Vue这个构造函数，因为extend是Vue的静态方法，并非原型上的方法
    const Super = this
    // * Vue的cid
    const SuperId = Super.cid
    // * 这里实际上是在extendOptions上增加了一个构造器_Ctor，初始化为一个空对象
    // * 实际上是做了一层缓存的优化
    // ? 目前估计是下一次在渲染component的时候，如果在Vue上一级存在过这个component，也就会有一个对应的cid存在，那么就会直接取出来，得到该component对应的VNode
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // * 定义了一个name, 如果在传过来的对象上不存在这个name，就会取Vue的options上面的name
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      // * 这里是在开发环境对name做一次校验
      validateComponentName(name)
    }

    // * 定义了一个子构造函数
    const Sub = function VueComponent (options) {
      // * 所以这里执行this._init时，就会执行Vue.prototype._init方法
      this._init(options)
    }
    // * 将子构造函数的原型都指向了父Vue的原型
    Sub.prototype = Object.create(Super.prototype)
    // * 将他原型上的constructor指回自己
    Sub.prototype.constructor = Sub
    //! 以上是一个简单的原型链继承，由于此处super指向Vue，因此Sub完全继承了Vue原型上的所有东西
    Sub.cid = cid++
    // * options做了一层合并，将自身的options和Vue的options做了一层合并
    // * 局部注册组件，就会在此处合并options，extendOptions就是组件的options，Super.options表示Vue的options
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // * 然后将super指向外层的Super，也就是Vue
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // * 以下两个步骤对Sub子构造函数自己的Props和Computed做了一次初始化
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // * 这里将全局(Vue)的静态方法复制给Sub
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    // * 这里拷贝了component, directive和filter
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // * 这里将Sub缓存下来，赋值给原来的那个Cid(Sub初始化的时候对原来的cid做了一次+1)
    cachedCtors[SuperId] = Sub
    return Sub
    // * 这里的目的就是让Sub拥有和Vue一样的能力
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
