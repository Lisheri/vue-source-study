/* @flow */

import { toArray } from '../util/index'

/**
 * 
 * @param {*} Vue Vue构造函数
 * 用于注册Vue.use静态方法
 */
export function initUse (Vue: GlobalAPI) {
  // 增加一个静态成员use
  Vue.use = function (plugin: Function | Object) {
    // 定义一个常量, 这个常量代表安装的插件
    // 此处的this指向Vue构造函数本身(普通函数, 谁调用指向谁, use方法被Vue构造函数调用, 直接指向Vue构造函数(类, 上面有静态成员))
    // 直接获取构造函数上的_installedPlugins, 如果有的话直接返回, 如果没有就定义出来并且初始化成一个空数组
    // 这个属性就记录了安装的所有插件
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 表示Vue上当前插件注册过, 直接返回, 防止重复注册
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 注册插件过程
    // 去除数组中的第一个元素(插件本身)
    const args = toArray(arguments, 1)
    // 将Vue构造函数插入到第一个元素的位置
    args.unshift(this)
    // ! 其实下面两个操作就是在做一件事情, 约束install方法的调用格式
    // ! 插件的install方法或者插件本身就是install方法, 他们的第一个参数其实就是Vue构造函数, 而后续参数则是通过Vue.use接收到的除插件本身以外的其余参数
    // 如果插件的install属性存在并且是一个function, 那么直接调用该插件的install方法, this指向当前插件, 参数第一个扩展为Vue构造函数
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 如果插件本身就是一个function, 那么直接调用, this指向null, 第一个参数扩展为Vue构造函数
      plugin.apply(null, args)
    }
    // 将插件推送到数组中, 表示已经注册完成
    installedPlugins.push(plugin)
    // 返回Vue构造函数, 便于链式调用
    return this
  }
}
