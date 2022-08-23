/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 通过mergeOptions将入参mixin对象中的所有成员, 全部拷贝到Vue.options这个静态成员上
    // ? 因此通过Vue.mixin注册的混入, 是一个全局混入
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
