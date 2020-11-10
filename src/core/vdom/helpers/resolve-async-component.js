/* @flow */

import {
  warn,
  once,
  isDef,
  isUndef,
  isTrue,
  isObject,
  hasSymbol,
  isPromise,
  remove
} from 'core/util/index'

import { createEmptyVNode } from 'core/vdom/vnode'
import { currentRenderingInstance } from 'core/instance/render'

function ensureCtor (comp: any, base) {
  // ? base就是Vue.$options._base，而Vue.$options._base = Vue
  // * 此处主要是保障不管是es模块还是通过CommonJS加载的模块，都可以正确的拿到一个component
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default
  }
  // * 判断comp是不是一个对象，如果是一个对象，就通过Vue.extend(comp)返回一个构造器
  // * 当然本身是一个构造器就直接返回
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

export function createAsyncPlaceholder (
  factory: Function,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag: ?string
): VNode {
  const node = createEmptyVNode()
  node.asyncFactory = factory
  node.asyncMeta = { data, context, children, tag }
  // * 返回了一个空的注释节点
  return node
}

export function resolveAsyncComponent (
  factory: Function,
  baseCtor: Class<Component>
): Class<Component> | void {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    // * 异步组件加载，执行forceRender方法的时候，执行$forceUpdate又会重新回到这个方法，走到这里，就会发现上一次已经保留了resolved, 也就是这个异步组件的构造器
    // * 到此就直接返回异步组件的构造器
    return factory.resolved
  }
  // ! 上面都是高级异步组件的东西， 暂时先不急

  // * render的时候执行$createElement在该函数中执行createComponent然后创建组件，加载异步组件，进入此处，因此这个理的owner代表当前Vue实例的this
  const owner = currentRenderingInstance // * currentRenderingInstance这个东西在render执行过程中，就变成了Vue实例的this, 
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // * 最开始是没有定义owners的，因此初始化加载的时候并不会进入这里面
    // already pending
    factory.owners.push(owner)
  }

  // ! loadingComp也是高级组件的东西
  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    // * 初始状态并没有owner这个东西，因此会进入此处中
    // * 如果有很多异步组件，下面的步骤只需要执行一次就可以了，剩下的都只需要走上面那个已经定义factory上的owners的步骤，往里面push一点东西就ok
    // * 因此这个factory.owners是一个数组，他会一直使用
    const owners = factory.owners = [owner]
    let sync = true
    let timerLoading = null
    let timerTimeout = null

    // * 组件销毁的时候移除owners数组中的owner, 也就是当前owner
    ;(owner: any).$on('hook:destroyed', () => remove(owners, owner))

    const forceRender = (renderCompleted: boolean) => {
      // * 遍历所有的owners也就是组件的this对象，让所有已经加载过的异步组件，都执行一次$forceUpdate()方法，强制更新一次
      // * 当执行vm._update的时候，又会去执行createComponent方法，又会进入到resolveAsyncComponent
      for (let i = 0, l = owners.length; i < l; i++) {
        (owners[i]: any).$forceUpdate()
      }

      if (renderCompleted) {
        // * 这里表示已经将异步组件加载完成，返回一个空的标签之后,就是一个true
        // * 清除两个定时器
        owners.length = 0
        if (timerLoading !== null) {
          clearTimeout(timerLoading)
          timerLoading = null
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout)
          timerTimeout = null
        }
      }
    }

    // * once通过闭包去返回一个函数，在返回的函数内部执行传入的参数，在闭包外层使用一个参数通过闭包不会清楚内部变量的特效控制在闭包内部是否执行传入的函数
    // * 这个resolve就是在异步组件加载完成后，生成一个注释节点后，执行的方法，res就是加载方法返回的一个包含了组件定义的options
    const resolve = once((res: Object | Class<Component>) => {
      // cache resolved
      // ? baseCtor就是Vue.$options._base
      // ? factory.resolved保留是异步组件的构造器
      factory.resolved = ensureCtor(res, baseCtor)
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      // * 执行resolve的时候外层函数已经执行过一次了，因此这里的sync是一个false，将会进入该判断，执行forceRender
      if (!sync) {
        forceRender(true)
      } else {
        owners.length = 0
      }
    })

    const reject = once(reason => {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      )
      if (isDef(factory.errorComp)) {
        factory.error = true
        forceRender(true)
      }
    })
     // * 这个factory就会走异步加载的那个方法, 也就是普通异步加载时的方法, 返回值为异步组件的所有配置(指的是异步组件加载方法，而不是factory函数执行的返回值，该函数执行的返回值是一个空节点)
     // * 在使用Promise加载异步组件的时候, 执行factory就会进入Promise异步组件加载的then方法中, 然后执行() => import(xxx) 这种异步组件加载方法, 这里的res会返回一个promise对象
     // ! Vue做Promise异步组件，有一点就是为了配合webpack这个语法糖，对import方法做支持

     // * 高级异步组件，会提供组件加载延迟多久，然后加载中使用的组件，加载失败使用的组件，加载最高延迟时间timeOut，当timeOut结束之后，就会使用加载失败的组件
     // * 高级异步组件, 也会返回一个Object，但是，并不是Promise，因此没有then，也没有catch

     // TODO 高级异步组件的加载，会先进入注释节点，然后触发forceRender重新回到这个方法中，由于之前将loading设置为true过，因此会加载出loading组件
     // TODO 但是又触发forceRender 重新进入了该方法中，并不会影响之前loading的渲染，同时执行res.component.then(resolved, reject)的时候
     // TODO 在这个时候，就会存在一个factory.resolved，将会渲染之前定义的我们需要的高级异步组件
     // TODO 同时在上面的步骤中，如果第二次回到该方法中，还是没有factory.resolved，那么就会触发loading的倒计时和timeout的倒计时，当loading的异步倒计时开始后
     // TODO 就会加载loading组件，让timeout倒计时开始后，也就是走到了最后一步，直接加载timeout带来的errorComp这个失败状态下的组件
    const res = factory(resolve, reject)

    if (isObject(res)) {
      // * Promise方法加载异步组件会进入如下判断中
      // * isPromise用于判断参数是否定义，是否存在then和catch并且是一个function
      if (isPromise(res)) {
        // () => Promise
        // * 还是和一般异步组件加载一样，第一次factory是不存在resolved的
        if (isUndef(factory.resolved)) {
          // * 这里的then就是Promise.then方法，因此resolve就会触发,然后会给factory.resolved赋值，之后就和一般异步组件加载相同了, 通过一次forceUpdate重新进入到此处，在上面执行resolveAsyncComponent方法的时候，就会得到组件的构造器
          res.then(resolve, reject)
        }
      } else if (isPromise(res.component)) {
        // * res.component是加载的异步组件，并且是一个Promise
        // * 在这里又会执行resolve
        res.component.then(resolve, reject)

        if (isDef(res.error)) {
          // * 如果定义了res.error，就会给factory.errorComp通过ensureCtor方法，返回一个继承了Vue基础配置的一个error组件的构造器
          factory.errorComp = ensureCtor(res.error, baseCtor)
        }

        if (isDef(res.loading)) {
          // * 如果定义了loading，就会将loading时的组件，一样通过ensureCtor这个方法，转换为一个合并了Vue基本配置的一个构造器
          factory.loadingComp = ensureCtor(res.loading, baseCtor)
          if (res.delay === 0) {
            // * 如果延迟时间已经是0了，那么factory.loading就会置为true
            // * 如果factory.loading是true, 那么第一次执行resolveAsyncComponent就不再是像之前一样返回一个注释节点，而是返回一个loadingComp也就是加载状态的组件去渲染
            factory.loading = true
          } else {
            // * 如果设置了延迟时间，那么第一次执行resolveAsyncComponet执行过后还是undefined, 最后渲染一个注释节点，直到下面的setTimeOut执行完后, 就会通过loading为true
            // * 同时触发forceRender重新执行$forceUpdate重新进入此处，渲染一个loadingComp节点
            // * 而如果重新进入此处，并且存在factory.resolved, 就会渲染resolved了
            timerLoading = setTimeout(() => {
              timerLoading = null // * 清除定时器，该定时器只执行一次
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true
                forceRender(false)
              }
            }, res.delay || 200)
          }
        }

        if (isDef(res.timeout)) {
          // * 如果上面的都走完了，就会执行下面的步骤，在timeout都走完了，还是没有factory.resolved，那么就会执行reject方法，这里会将factory.error置为true，然后最后渲染出error组件
          // * 一旦渲染了error就不会在去渲染resolved了
          timerTimeout = setTimeout(() => {
            timerTimeout = null
            if (isUndef(factory.resolved)) {
              reject(
                process.env.NODE_ENV !== 'production'
                  ? `timeout (${res.timeout}ms)`
                  : null
              )
            }
          }, res.timeout)
        }
      }
    }

    sync = false
    // return in case resolved synchronously
    // * 异步组件在这里，没有loading也没有loadingComp，因此返回一个undefined
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}
