/* @flow */

import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError,
  noop
} from '../util/index'

import { traverse } from './traverse'
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

import type { SimpleSet } from '../util/index'

let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  // * cb表示回调函数callback
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    // * 如果是渲染Watcher，那就在vm上添加一个_watcher, 并把Watcher实例指向vm._watcher
    if (isRenderWatcher) {
      // * 这里的this代表的是当前的watcher，也就是说，如果是渲染watcher，就会把当前的watcher赋值给vm._watcher, 也就是说这个vm._watcher表示他是一个渲染watcher
      vm._watcher = this
    }
    // * 将当前Watcher实例push到所有的_watchers中
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      // * 这里是保存了一遍options上的before, 也就是传入的 before函数
      /*
        before () {
          if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
          }
        }
      */
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    // * 将回调函数cb传给this.cb
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    // * 如果是开发环境，就将传入的expOrFn转换为字符串
    // * 实际上这个expression只是让你看一下是什么，并没有太大的用处，关键是下面的
    // * toString()并不改变原来的类型, 只会返回一个新的字符串
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    // * 如果expOrFn是一个函数，那就将这个函数赋值给Watcher的getter
    // * 否则就使用parsePath将expOrFn转换为一个函数在赋值给实例的getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // * 如果是lazy模式，那就不作任何操作，否则将this.get()返回值赋值给this.value
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // * 这里使用了一次getter
      // * 这个getter就是在mountComponent的时候传入的updateComponet
      // * 这里执行getter也就是执行updateComponent的逻辑, 当执行updateComponent的时候，就会执行vm._render方法
      // * 在执行vm._render的时候就会触发render方法，在其中计算出最后的VNode的过程中就会触发绑定在data、props等上面的getter属性
      // * getter属性触发，就会执行dep.depend()这个方法，在其内部触发dep.target.addDep(this)，也就是watcher的addDep方法

      // TODO 也就是说，render执行过程中，访问getter属性，最终就是将订阅者watcher添加到订阅者集合subs里面去，作为当前数据的桥梁
      // TODO 然后到最后会判断是否需要深层次的订阅, 完了之后，就会执行popTarget，将当前使用的订阅者watcher给pop出去，恢复之前的watcher栈，保持Dep(类)上面的target(watcher)是最初的状态
      // TODO 在派发更新的时候，执行vm._update方法patch出真实DOM和首次渲染，并不是完全相同的
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep (dep: Dep) {
    const id = dep.id
    // * 初始化进来的时候this.newDepIds和this.depIds都是新的Set数据结构，因此他们并不会存在当前dep的id
    // * 所以将id分别存入之后，就会触发dep.addSub(this), 这个addSub实际上就是往subs这个watcher集合里面，把当前的watcher给push进去
    // * 这个watcher就是数据的订阅者
    // ? 这里带new的表示是新的，不带new的表示是旧的, 在清除的地方，他们的区别，就体现出来了
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () {
    // * 清除依赖收集
    // * 主要是数据改变的时候，都会重新渲染，重新渲染的过程中就会重新去掉addDep这个方法
    // * 因此第一次渲染完，要清除掉，否则下一次进来重新执行addDep再添加进去
    // * 至于添加判断来确认添加过的东西不再添加而不是全部清除这样的方法为什么不用，后续再看
    let i = this.deps.length
    while (i--) {
      // * 把所有的deps和newDeps做一次比对 如果发现有不需要watcher的deps，就移除掉，取消订阅， 比如v-if="msg" v-else-if="msg1" 当切换到msg1之后，就不会再对msg做订阅了
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    // * 这个depIds就是堆newDepIds的一个保留
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    // * 这里也是一样deps就是堆newDeps的保留
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      // ? 表示是一个同步watcher, 一般情况下不是
      this.run()
    } else {
      // ? 一般的watcher就会进入到此处
      // ? this指向watcher实例
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      // * 首先通过get去求了一个新的值(在这里面会执行pushTarget, 但是之后就会执行popTarget，并不会改变原有的watcher栈)
      const value = this.get()
      // * 如果发现值不一样，或者是一个对象，或者this.deep为true, 就会执行下面的回调
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value * 设置一个新的值
        const oldValue = this.value
        this.value = value
        // TODO 对于渲染watcher来说, this.cb这个callback实际上是一个空函数, 它主要是要执行get再一次去求值
        // TODO 执行get的时候，就会触发getter, 对于一个渲染watcher就是lifecycle中的updateComponent, 然后触发render得到新的VNode再出发update去patch出真实节点更新DOM
        // TODO 对于user Watcher来说callback就是我们定义的那个函数handler(newVal, oldVal) {...} 这个就是他的cb
        if (this.user) {
          // ! 如果是userWatcher那么在执行回调的同时还有一个handleError, 所谓 userWatcher 就是 watch 属性下面定义的类型
          try {
            // * watch一个值的回调，就是执行的这个步骤，我们可以拿到一个新的值和一个旧的值，就是因为将新的值和旧的值都作为一个参数传递进来了
            // ? 因此在 userWatcher 中如果对他watch的值再一次进行更新，那么就会在 flushSchedulerQueue 执行的时候， 再一次触发 queueWatcher 
            // ? 但是这个时候，会进入那个容易造成bug的else中(因为 flushing 是 true), 到最后，就会在watcher队列中，在插入一个新的watcher
            // ? 但是实际上前面有一个 userWatcher 还没有消失 这个新的 userWatcher 又进去了， 并且他们拥有同一个id, 然后就进入循环了，不停的加入新的 userWatcher 并且都是同一个
            // ? 这就是那个条件 MAX_UPDATE_COUNT 的用处 标志了一个最大的循环值(id相同进入的那个判断中执行次数, id相同意已经有问题了， vue设置了一个最大问题执行值，来结束糟糕的代码)
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    // TODO 在计算属性的getter执行的过程中，因为要依赖 props 或者 data 上面的值, 那么这个计算属性的getter触发的时候, 实际上还会触发非计算属性的getter
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
