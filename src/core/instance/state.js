/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'

import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop, // * 空函数noop
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    // ? 计算属性触发getter的时候, 由于要依赖data或者props的值, 因此, 这里也会执行，因为在获取 data 或者 props 中的值 会触发get
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  // * 定义了getter和setter函数，然后通过Object.defineProperty方法，在target上修改了key的属性，为每一个key的属性都增加了一个getter和setter，同时修改为可枚举属性，描述符配置修改为可以被修改
  // * 这里的target就是vm实例，key就是传入的每一个data的key，
  // * 也就是说访问vm.key，访问的就是vm.sourceKey.key，这个sourceKey就是 _data, 在最开始执行initData的时候，就把data的值付给了vm._data
  // * 因此，我们可以在vue的实例中，直接通过 this. 来访问 data下面的成员
  // * 这一层this. 来访问data的成员，实际上就是触发了他的getter方法，通过getter方法，访问this._data[key]来拿到想要的数据
  // * 下划线开头在编程界默认为一个私有属性，因此最好不要使用_data去访问
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  // * 在initState中，如果定义了props就初始化props, 如果定义了methods，就初始化methods
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  // * 如果定义了data，就会初始化data, 能够在生命周期中访问到data，这里就是关键
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
   // * 首先拿到options.props的定义, 并添加到props常量中
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent // * 如果$parent不存在那么该节点就是根节点, isRoot就是true
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  // * 遍历props的key,并通过 defineReactive 添加get和set, 然后注入到props对象中, 同时添加开发环境赋值警告
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    // * 如果在vue实例上不存在props下的属性, 则通过proxy添加到实例中
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}

// * vm.$options就是初始化Vue实例的时候，传入的配置项，如data, methods,props, 生命周期等
function initData (vm: Component) {
  let data = vm.$options.data // * 获取到初始化的时候传入的data
  // * 拿到之后先做一个判断，看data是不是一个function，比较推荐的一种写法就是将data写成一个function的形式: data() {return {}}, 然后在返回一个对象
  // * 将值赋值给临时变量data的同时，还赋值给了一个vm._data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm) // * 如果是一个function，则调用getData方法
    : data || {}
  if (!isPlainObject(data)) {
    // * 如果data或者返回值不是一个对象，在非生产环境中，那就抛出一个错误，data函数必须返回一个对象
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  // * 这里会取出所有data的key，然后拿到props和methods
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // * 遍历data的key，并且做一个循环的对比，是否在props和methods中有相同的key，如果有，就抛出一个警告
  // * 为什么不能有重复，会冲突，就是因为他们最终都会挂载到VM实例上
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // * 通过这个proxy函数实现挂载，就是把data上的东西代理到vm实例上
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // * 观测这个data
  observe(data, true /* asRootData */)
}

export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  // * 响应式原理的内容
  pushTarget()
  try {
    // * 主要就是执行data方法，改变data的this指向为vm，这个vm就是一个Vue实例全局的this对象
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    // * 响应式原理的内容
    popTarget()
  }
}

const computedWatcherOptions = { lazy: true }

function initComputed (vm: Component, computed: Object) {
  // * 初始化计算属性
  // $flow-disable-line
  // * 向计算属性订阅者的原型上设置一个空对象, 并且将其缓存下来
  // * 第一次出现的时候，watchers和vm._computedWatchers就是一个浅拷贝，因此后面对watchers赋值，就会改变vm._computedWatchers的值
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering() // * 用于判断是不是服务端渲染

  for (const key in computed) {
    // * 遍历所有计算属性(定义的)
    const userDef = computed[key]
    // * 本身可以是一个函数，也可以是一个对象，我们一般都写得函数，当然也可以写一个对象，但是对象必须有get
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm, // * vm实例
        getter || noop, // * 传入的getter
        noop, // * 传入的回调函数
        computedWatcherOptions // * 传入的配置, 这里是{lazy: true}
      )
      // * 在这里实例化每一个computed的watcher
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // * computed的key不能和 data 或者 props下面的key有重复
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}

export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  // 设置是否需要缓存, 主要根据是否服务端渲染来判断, 非服务端渲染需要缓存
  // 大部分情况下为true
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    // * 在计算属性下面直接定义的就是一个函数的情况
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop // * 非SSR情况下，计算属性是没有set属性的, 他只是根据订阅的数据发生变化的时候, 执行并返回一个值
  } else {
    // * 当然，如果定义的是一个对象，那么就可以设置set和get方法，通过set方法可以对其进行赋值，但实际上直接对计算属性赋值的情况是很少的
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter (key) {
  // * 访问计算属性，就会执行以下方法并且得到他的返回值
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) { // * lazy为true, 所以watcher.dirty也是true
        watcher.evaluate()
        // * 执行完后获得value, 并且将 dirty 设置为 false
        // * 通过getters 获取 value, 这个getters就是定义的计算属性
      }
      if (Dep.target) {
        // * 本身就存在一个dep.target(全局update的dep)，而在执行 watcher.evaluate() 的时候, 在执行get中popTarget后又会更新Dep.target
        // * 说直白点就是渲染watcher
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm: Component, methods: Object) {
  // 获取props
  const props = vm.$options.props
  // 遍历methods中属性
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      // 非函数成员告警
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // 是否和props中的键重复, 重复则告警
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      // isReserved 判断key是否以 _ 或 $ 开头, 顺便告警, 同时实例上存在也告警
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 将methods注入到vue实例中, 非function返回空函数, 同时将函数内部this重定向到vue实例上
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}

function initWatch (vm: Component, watch: Object) {
  // * 侦听属性的初始化
  for (const key in watch) {
    // * 遍历所有的watch, 拿到每一个设置的侦听属性
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  // ! 这里, 如果直接定义的 userWatcher 就是一个函数, 那么以下两个判断都不会走进去, options 就是 undefined
  // ! 在new Watcher 的时候, 执行 Watcher 类的构造器, 此时 options 那个判断中会将所有的设置为false
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  // * 往原型上挂载属性$data和$props, 通过get属性指向_data和_props
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  // * 就是Vue.set和Vue.delete
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function, // watch的键名
    cb: any, // watch的回调函数
    options?: Object // watch侦听对象的属性值, 包含handler, deep, immediate等
  ): Function {
    // 获取Vue实例, 之所以没有静态方法, 就是因为这里需要使用到Vue的实例
    const vm: Component = this

    // 判断传入的 cb, 是不是一个原始对象
    if (isPlainObject(cb)) {
      // 因为$watch可以直接调用, 这里可以直接传递一个函数, 也可以直接传递一个对象, 如果传递的是一个对象, 那么就在这里对对象进行重新解析
      return createWatcher(vm, expOrFn, cb, options)
    }
    // 表示options解析过
    options = options || {}
    // 标记当前watcher是 userWatcher
    options.user = true
    // 创建 userWatcher 对象, 将处理好的 options 作为参数传入
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 判断是否需要立即执行
    if (options.immediate) {
      try {
        // 立即执行侦听器回调
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    // 返回一个取消监听的方法
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
