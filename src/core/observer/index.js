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
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // * def方法为value对象下的'__ob__'使用Object.defineproperty(value, '__ob__', {value: val(这个val就是this), enumerable: !!enumerable(此处没有传递，因此最后为false), writable: true, configurable: true})
    // * 总的来说就是增加value.__ob__, 并且属性值指向当前实例 然后添加了一些属性, 默认为不可枚举
    // * 主要是为了方便相同组件的data或者props有一次进入initState中，然后进入observe方法，对已经监听过的对象，就不用再来重新设置监听了，直接使用value.__ob__就可以了
    // ? 至于为什么要使用Object.defineProperty而不是直接使用value.__ob__ = this, 后面再看
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // * value是一个数组
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // * 这个方法主要是当value是一个数组的时候，将value下面的每一个成员递归观察起来,也就是执行observe(value[i])
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // * 到这里，就解决了上面的问题，为什么要用Object.defineProperty来添加value.__ob__而不是直接使用value.__ob__ = this
      // * 如果直接将this赋值，那么value.__ob__也会执行defineReactive这个方法
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
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
// * observe接受两个参数，第一个是value，也就是需要添加监听的对象, 任意类型都可以，第二个是一个布尔值，表明是不是根数据
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    // * 在这里先判断需要添加的数据是否不是一个Object或者说是一个VNode，满足一个就直接返回
    // * 所以说对于要观测的value，至少要是一个对象类型，并且不能是VNode
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // * shouldObserve用于控制对象是否需要添加监听, isServerRendering表示是否为服务端渲染, 并且监听对象必须要是一个数组或者一个对象(toString()后为[object object]这种)
    // * 最后还要判断他不是一个Vue实例，Vue实例的isVue为true
    // ! Observer实际上被定义为一个Class, 执行new Observer的时候就会执行下面的构造函数
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
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
  const dep = new Dep()

  // * Object.getOwnPropertyDescriptor该方法返回的是指定对象属性上的描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    // * 如果该属性存在，但是configurable为false, 那么就直接返回，因为property.configurable为false表示该属性不可修改
    // * 这种一般是主动设置，或者使用Object.freeze方法，冻结对象， 也可以使用Object.seal()将目标对象改为不可扩展, configurable设置为false
    // * 也就是凡是存在一个属性是不可配置的, 就不会添加监听了, 会直接返回

    // ! Object.freeze冻结整个对象，整个对象不能添加也不能删除并且不能修改原有的属性, 
    // ! 而Object.seal() 是封闭原有对象, 不能添加属性, 不能删除属性，但是可以修改原来存在的属性，但是不能使用Object.defineProperty设置访问属性
    return
  }

  // cater for pre-defined getter/setters
  // * 直接获取对象属性配置上的setter和getter属性
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    // * 如果满足没有getter或者存在setter并且参数只传了两个那么就会将obj[key]赋值给val暂存起来
    val = obj[key]
  }

  // * childOb是对val再一次递归观察
  let childOb = !shallow && observe(val)
  // * 因此，data下面定义的数据无论是对象还是数组，最终都会深入到最底下一层，去添加观察者，将整个对象化为一个响应式对象
  // * 所谓响应式对象，就是在对data下的对象或者数组，从上到下所有的属性都添加getter方法和setter方法
  // * 也就是获取值的时候触发getter, 设置值的时候触发setter
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // ! getter主要是 为了做依赖收集的事情
      /* 
        ! 总的来说，这个依赖收集，就是在render触发getter之后，会有一个当前正在计算的watcher(new Watcher的时候生成的)
        ! 然后在这里把watcher订阅到数据变化中, 通过dep.depend, 调用当前watcher的addDep, addDep会执行addSub
        ! 也就是当某个数据在触发getter进行依赖收集，就是收集当前正在计算的watcher，然后通过一通操作，把它(订阅者)push到watcher集合subs中
        ! 这个watcher(订阅者)在数据变化的时候，触发setter会通知订阅者做一些其他操作
      */
      // * 首先是拿到getter, 然后使用getter做计算，当然，没有getter就直接拿到这个值。毕竟getter属性主要是为了拿这个值
      const value = getter ? getter.call(obj) : val
      // TODO 下面就是依赖收集的过程
      if (Dep.target) {
        // TODO Dep的target就是Dep类的一个全局watcher, 是一个可选的静态属性
        // TODO Dep这个类主要是为了让数据和watcher之间建立一座桥梁
        dep.depend()
        if (childOb) {
          // * 如果子value是一个对象, 就会进来
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // ! setter主要是为了做派发更新
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
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
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
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
