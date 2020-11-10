/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // * 执行initMixin的时候就在原型上添加了一个_init方法
  // TODO _init方法主要是做了一堆初始化的工作，比如说_uid的定义、 options的定义
  Vue.prototype._init = function (options?: Object) {
    // * Component这个interface详见flow下面的component.js自定义interface Component
    // * 这里的vm指向组件实例的vm
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      // * 可以计算出_init函数走了几次
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // * 可以理解为将初始化的时候传入的options，都merge到this.$options上面，也就是说，我们可以使用this.$options访问到最初定义的很多东西
    // * 组件创建的时候执行this._init(options)还是要走这个，然后这里的options._isComponent在组件渲染的时候为true，将会执行initInternalComponent来合并options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // * 局部组件会执行这个逻辑
      initInternalComponent(vm, options)
    } else {
      // * 在这里，会合并一次$options，将Vue上的options合并到vm的$options实例上
      // * 全局注册的组件在这里合并, 通过resolveConstructorOptions将Vue合并到vm.$options上
      // * 全局注册的时候，这个vm就是全局Vue实例,因此此处合并后生成的vm.$options在全局可以访问，他是全局的options
      // ! 不管是全局注册，还是局部注册，都会合并Vue上面的options，因此如果我们在Vue的options上面定义的东西，在任何地方都可以使用，但是组件中定义的，就只能merge到Sub.options中，在其他组件就无法访问了
      vm.$options = mergeOptions(
        // * vm.constructor指向Vue构造函数本身
        // * 因此在初始化的时候，这个参数代表的就是Vue构造函数上面的options
        resolveConstructorOptions(vm.constructor), 
        // * 这个options，就是定义new Vue()的时候传入的配置，如el, created(), render()等
        options || {},
        // * 当前实例
        vm
      )
    }
    /* istanbul ignore else */
    // * 在生产环境，vm就是_renderProxy
    // * 开发环境中执行initProxy来初始化_renderProxy
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // * 这个比较关键
    initLifecycle(vm) //TODO 初始化生命周期
    initEvents(vm)  // TODO  初始化事件中心
    initRender(vm) // TODO 
    // * 在beforeCreate中，vue-router，vuex都混入了一些逻辑
    callHook(vm, 'beforeCreate') // TODO 执行beforeCreate, 在这个时候，是拿不到组件内部的数据的. 因为到此为止，只初始化了生命周期事件和渲染函数
    initInjections(vm) // resolve injections before data/props // TODO 初始化全局注入
    initState(vm) // TODO 初始化props和data
    initProvide(vm) // resolve provide after data/props // TODO 
    callHook(vm, 'created') // TODO 执行created, 在created中已经可以拿到需要的data, props之类的数据了，因为在这里，已经执行完了provide/inject的初始化，data， props的初始化
    // * 也就是说在init的过程中，就会执行beforeCreate和created

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // * 判断是否传入了一个DOM对象，也就是挂载的el，如果有，则调用$mount()将el挂载
    // * $mount就是做挂载的方法
    // ! 组件创建的时候在$options上并没有el，因此到此为止，不会进去 
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // * 首先更新vm.$options，将实例的构造函数constructor上的options赋值给vm.$options，同时定义一个新的值opts
  // * 这里的vm是儿子组件的实例
  // * 局部组件执行Vue上extend时，传入的sub就是vm.constructor, sub.options就是通过Object.create()创建的options, 然后赋值给了这个vm.$options
  // * 所以可以通过vm.$options访问到定义的组件，比如说<a-table>这种, 因此在resolveAsset()方法中，可以拿到assets下面的局部组件定义那个definition
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // * 然后比较重要的就是讲options._parentVnode传进来了，并且传进来了parent
  // * 这个_parentVnode就是那个占位符的vnode, 所谓占位符，就是组件名称所构成的那个标签，就是一个占位符
  // * 这里的parent就是当前的vm实例，也就是作为这个子组件的父组件的vm实例
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  // * 这里通过vnodeComponentOptions也就是占位符(子组件, 目前还是一个占位符)的componentOptions
  // * 由于组件存在和组件相关的配置上的东西，比如说props，linsteners等，都会在componentOptions中
  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  // * 通过这个拿到了全局的render和全局的staticRenderFns
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
  // * 以上合并方式比较简单，没有mergeOptions合并策略那么复杂，因此，组件的options合并会非常快
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  // * 初始化的时候传入的Ctor是Vue构造函数(Vue)(或者是组件的构造器，当然也是merge了Vue的基本方法和原型方法)
  let options = Ctor.options
  if (Ctor.super) {
    // * 在Ctor是Vue构造函数的时候，上面不存在super，因此不会走入这里面
    // * 组件加载，无论是异步还是同步，在Ctor上，都存在super，指向的是上一层的super, 也就是Vue构造函数
    const superOptions = resolveConstructorOptions(Ctor.super)
    // ! Ctor.superOptions就是外层的options
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // * 这里的逻辑，只有在resolveConstructorOptions方法传入的Ctor.super为Vue的时候才会进来
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  // * 相当于这里获取的是Vue构造函数上的一个基本options, 然后会将这个options合并到全局注册组件的options上面去
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
