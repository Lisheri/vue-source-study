/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // * dep类主要的目的就是建立数据和watcher之间的桥梁
  static target: ?Watcher;
  // id属性主要用于计数, 每个dep对象都有, 所有dep对象公用同一个基础值, 每创建完一个dep对象, 都会让这个id自增, 初始值为0
  id: number;
  subs: Array<Watcher>; // * subs是一个订阅数据变化的watcher集合

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      // * 如果存在target, 这个target就是watcher, 那么就会使用watcher.addDep(this)
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    // 首先获取当前dep下的所有Watcher实例(使用slice浅拷贝第一层)
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      // * 如果config.async为false, 就为watcher排序
      subs.sort((a, b) => a.id - b.id)
    }
    // * 遍历所有的订阅者，触发其update方法实现更新
    for (let i = 0, l = subs.length; i < l; i++) {
      // * subs中的数据都是watcher的实例, 所以subs[i].update()就是Watcher类中的update
      // 调用update方法进行更新
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target 是用于存储当前正在执行的目标 watcher 对象, 并且他是全局唯一的, 同一时间, 只有一个Watcher正在被使用
Dep.target = null
// * watcher栈
const targetStack = []

// * 在pushTarget执行的时候将target这个watcher push到栈中
// * 在执行popTarget的时候，在将刚刚push到栈中的watcher 取出来
export function pushTarget (target: ?Watcher) {
  // * 将target(watcher) push到这个targetStack中
  targetStack.push(target)
  // * 将这个target给Dep.target
  Dep.target = target
}

export function popTarget () {
  // * 从栈中出来
  targetStack.pop()
  // * 将watcher栈的最顶上的元素赋值给Dep.target
  // * 也就是说要在popTarget的时候去拿到上一次push到watcher栈里面的东西
  /* 
    ! 为什么需要这样做? 主要是考虑到嵌套组件的渲染过程, 组件渲染会执行mountComponent这个东西，并且是先父后子，父组件mountComponet完成后执行get方法就会执行pushTarget
    ! 并且当儿子从mountComponent执行到pushTarget的时候，就会发现传入的target就是儿子的渲染watcher，在后面的过程中，Dep.target都会保持是他自己的渲染watcher, 直到儿子的渲染watcher走完了
    ! 然后在执行popTarget的时候，又会将这个取出来，再次赋值给Dep.target, 巧妙的利用栈结构来保持当前使用的Dep.target在儿子执行完之后，又恢复到父亲的Dep.target这个状态
  */
  Dep.target = targetStack[targetStack.length - 1]
}
