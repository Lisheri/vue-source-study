/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // * 可以看到mixin是用来合并options用的
    // * 这里的this是大的Vue, 也就是Vue这个构造函数的this
    // * 这个方法和组件在init时使用的方法一致，只是这样会将全局的mixin中的对象，合并到Vue.prototype.options中
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
