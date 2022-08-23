/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  // 观测对象
  value: any;
  // 依赖对象
  dep: Dep;
  // 实例计数器
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // def 基于 Object.defineProperty封装, 将value.__ob__设置为不可枚举, 防止后续设置getter和setter时, __ob__ 被遍历
    // ? 不可枚举属性主要作用就是遍历隐身
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        // 服务端渲染或部分浏览器环境下, 对象上没有 __proto__属性, 以此来区分是否服务端渲染
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // * 遍历数组中的每一个对象, 创建一个 observer 实例
      this.observeArray(value)
    } else {
      // * 遍历对象中的每一个属性, 添加getter/setter
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    // 获取观察对象的每一个属性
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // 遍历每个属性, 设置为响应式数据
      // * 这里就是防止 __ob__被遍历的原因, 无需为 __ob__执行 defineReactive
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      // * 也就是说数组添加响应式，只针对数组下面是一个对象的条目，如果数组的成员是值类型就不会添加响应式
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  // ! 这里虽然将所有数组的__proto__都修改为了 src, 这个src是只有'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse' 这7个方法的对象
  // ! 但是 src也就是 arrayMethods 创建的时候, 这个对象的__proto__就已经指向了Array.prototype, 因此, 尽管响应式数组的第一层方法已经改变，但其他所有的方法，都还在第二层__proto__上面
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
// * observe接受两个参数，第一个是value，也就是需要添加监听的对象, 任意类型都可以，第二个是一个布尔值，表明是不是根节点
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 首先判断是否是一个对象, 或者是否是VNode的一个实例
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  // 定义变量ob, 类型是 Observer, void表示初始化状态, 其实就是Observer的实例
  let ob: Observer | void
  // 判断是否存在 __ob__属性, 如果有需要进一步判断__ob__是否是Observer的实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 满足条件说明被监听过, 直接使用即可
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 没有该属性, 所以需要创建
    // 创建之前需要判断一下当前对象是否可以进行响应式处理
    // * shouldObserve用于控制对象是否需要添加监听, isServerRendering表示是否为服务端渲染
    // 核心就是判断当前对象是否是一个数组, 或者是一个纯粹的JS对象(Object.prototype.string.call(obj) === '[object Object]')
    // isExtensible判断当前对象是否是可扩展的(Object.seal和Object.freeze是不可扩展的, 或者使用Object.preventExtensions处理一次)
    // 然后看当前对象是否是Vue实例, 之前初始化Vue的时候给了一个属性, 就是_isVue, 就是要在这里过滤掉vue实例
    // 创建一个 Observer 对象, 执行Observer构造函数, 在其中就要把value的所有属性转换为getter和setter
    ob = new Observer(value)
  }
  // 返回前需要判断一下 asRootData, 初始化Vue实例时这里是true, 表示是根数据
  if (asRootData && ob) {
    // 根数据需要 ob.vmCount++, 进行计数
    ob.vmCount++
  }
  // 最终将创建好的observer返回
  return ob
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 创建依赖对象实例, 主要是为当前属性收集依赖, 也就是收集观察当前属性的所有 Watcher
  const dep = new Dep()

  // * 获取当前对象上指定属性的属性描述符(通过Object.defineProperty定义的第三个属性, 就是属性描述符, 其中可以定义getter/setter等)
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // configurable 用于确定当前属性是否是可配置的
  if (property && property.configurable === false) {
    // * 如果该属性存在，但是configurable为false, 那么就直接返回，因为property.configurable为false表示该属性不可修改
    // * 如果说当前属性是不可配置的, 就说明当前属性不能通过 delete 被删除, 也不能通过Object.defineProperty 重新定义
    // * 由于后续需要使用Object.defineProperty重新定义, 所以说如果不可配置, 这里直接返回
    // ? 一般也使用Object.seal() 或 Object.freeze 或者直接使用Object.defineProperty 将 configurable设置为false, 阻止data中的属性被监听, 减少运行时开销, 尤其是一个大体积的对象且该对象还不需要驱动视图更新
    return
  }

  // cater for pre-defined getter/setters
  // * 直接获取对象属性配置上的setter和getter属性
  // ? 因为Object对象可能是用户传入的, 用户传入时, 可能已经给对象中的属性设置过setter和getter, 先取出来, 后面重写, 增加派发更新和依赖收集的功能
  const getter = property && property.get
  const setter = property && property.set
  // 特殊情况判断, arguments.length === 2 表示是在 walk 调用的
  if ((!getter || setter) && arguments.length === 2) {
    // * 如果满足没有getter或者存在setter并且参数只传了两个那么就会将obj[key]赋值给val暂存起来
    val = obj[key]
  }

  // 判断是否递归观察子对象, 并将子对象属性都转换成 getter/setter 返回子观察对象
  // ? !shallow表示非浅层监听
  let childOb = !shallow && observe(val)
  // * 因此，data下面定义的数据无论是对象还是数组，最终都会深入到最底下一层，去添加观察者，将整个对象化为一个响应式对象
  // * 所谓响应式对象，就是在对data下的对象或者数组，从上到下所有的属性都添加getter方法和setter方法
  // 转换响应式对象
  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举的
    configurable: true, // 可配置的
    get: function reactiveGetter () {
      // 获取当前值, 有getter则直接用getter获取, 没有getter说明之前缓存过当前值, 直接获取即可
      const value = getter ? getter.call(obj) : val
      // 如果存在当前依赖目标, 即 watcher 对象, 则建立依赖
      if (Dep.target) {
        // * Dep的target就是Dep类的一个全局watcher, 是一个可选的静态属性
        // * Dep这个类主要是为了让数据和watcher之间建立一座桥梁
        dep.depend()
        // 如果子观察目标存在, 建立子对象的依赖关系
        if (childOb) {
          // * 如果子value是一个对象, 就会进来
          // ! 执行dep.depend() 去收集依赖
          childOb.dep.depend()
          // * 如果属性是数组, 则特殊处理收集数组对象依赖
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      // 返回属性值
      return value
    },
    set: function reactiveSetter (newVal) {
      // ! setter主要是为了做派发更新
      // ! 在触发响应式对象成员更新的时候就会触发set方法，到最后执行 dep.notify() 就是在做通知，可以更新了
      // * 首先获取当前属性值
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // * 值没有变化则不需要派发更新
      // ? newVal !== newVal && value !== value 用于确定这两个值是否为NaN, 其实可以用Object.is
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      // * 如果原来的对象上面存在getter但是没有setter就直接返回, 说明当前属性是只读的
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // * 如果新的值使用一个对象，那么就会触发observe将新的值变成一个响应式的值, 并返回 子 `observer` 对象
      childOb = !shallow && observe(newVal)
      // ! dep.notify()就是派发更新的过程
      // 派发更新(发布更改通知)
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  // * set函数接收三个参数，第一个可以是数组也可以是Object，第二参数是任意类型，第三个参数也是任意类型
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    // * 第一个参数如果是基础类型或者是undefined, 那么就会有一个警告，因为对于基础类型或者不传入第一个参数，这个方法都没有任何意义
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // ? isValidArrayIndex 确保 key 是一个大于等于0的整数数字
    target.length = Math.max(target.length, key) // * 首先修改数组的长度，他的长度取决于key和长度哪个更大，如果key更大，就说明在新增值
    target.splice(key, 1, val) // * 然后将这个值直接插入到 key 这个 index 的后面, 或者修改该 index 的 值, 这种方式可以触发重新渲染
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    // * 首先判断key值是否存在于目标对象中，如果存在，那么使用target[key] = val 这种方式以及可以触发重新渲染了
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__ // * 否则就在此处拿到taget.__ob__属性
  if (target._isVue || (ob && ob.vmCount)) {
    // * 如果target是一个Vue实例，或者ob上面有vmCount(有 vmCount 表示target是一个root data 也就是说是我们直接定义在 data 下面的)
    // * 这两种条件满足任何一个都不行, 我们要避免对Vue实例或者root data 做Vue.set()
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    // * 如果没有ob，也就是说 target 并不是一个响应式对象, 那么作为普通对象, 直接赋值就可以了
    target[key] = val
    return val
  }
  // * 如果 target 是观测值, 这里将新的值也变成一个响应式对象
  defineReactive(ob.value, key, val)
  // * 手动调用 ob.dep.notify(), 也就是对所有的 watcher 队列中的内容执行update
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  // * 通过这个方法去删除一个对象或者数组上的成员，也可以触发依赖更新的派发
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
