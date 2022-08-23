/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
// 使用数组的原型创建一个新的对象, 对象的__proto__就是数组的原型
export const arrayMethods = Object.create(arrayProto)

// 修改数组元素的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 保存数组原方法
  const original = arrayProto[method]
  // * 改写原型上的方法，把它添加到 arrayMethods 上
  // 调用Object.defineProperty 重新定义数组的方法
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args) // * 首先拿到原始方法去调用一次, 拿到一个结果
    const ob = this.__ob__ // * 拿到数组对应的 __ob__(所有执行过Observer构造函数的都有__ob__)
    let inserted // * 定义了一个临时变量
    switch (method) {
      case 'push':
      case 'unshift':
        // * 如果是 push 或者 unshift 就是往数组最后或者最前面插入值的方法, 就把 inserted 的值置为 数组方法参数值
        inserted = args
        break
      case 'splice':
        // * 如果是 splice 那么这个inserted 就是 参数数组的第三个值, 也就是插入或者改变的值
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted) // * 对参数数组中的每一项添加一次响应式(当然, 这一项首先得是 Object)
    // notify change
    // * 通知订阅者更新
    ob.dep.notify()
    return result
  })
})
