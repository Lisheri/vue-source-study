/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

// * 初始化全局静态属性的时候，将会执行initGlobalAPI, 在这个时候，会执行initAssetRegisters，注册三个全局的函数
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    // * 首先将component filter和directive挂载到Vue上
    // * 在这里Vue扩展了三个全局函数， component filter 和 directive
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        // * isPlainObject表示是一个普通对象,判断方式为toString()之后是一个[object Object]
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          // * 将definition转换为一个构造器，extend将会基于Vue初始化一次，增加definition上的配置后返回一个完全继承Vue的构造器
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // * 然后在这里将继承自Vue的构造器————definition返回给全局的Vue的options下面的[type]s的id
        // * 这里的type就是component, filter 和 directive

        // * 对于组件注册，就是在Vue.options.components上增加了一个id，这个id就是组件的名字(标签名)，他的属性就是继承自Vue的新的构造器————definition
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
