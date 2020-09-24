import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    // * 必须通过new 方法去实例化Vue，否则报错
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
// * 每一个mixin就是往vue的原型上混入一些定义的方法。
// * 之所以不使用ES6来写底层，ES6实现效果比较难写，ES5可以往原型上直接挂载方法，并且将这些方法拆分到不同的文件下，方便代码管理。而不是在一个大文件下定义所有的方法
// * 可以学习一下这样的编程方式。
// * 在不同的文件中定义原型上的方法
// * 在整个import Vue的过程中，就已经做了初始化，定义了基本上所有的全局方法

// ! Vue的初始化过程，先是通过一系列的mixin方法，给原型挂载很多原型方法，又通过global-api挂载了很多静态方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
