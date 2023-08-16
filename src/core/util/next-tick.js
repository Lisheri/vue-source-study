/* @flow */
/* globals MutationObserver */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  // * 浅拷贝 callbacks 数组第一层
  const copies = callbacks.slice(0)
  callbacks.length = 0 // * 清空callbacks数组
  for (let i = 0; i < copies.length; i++) {
    // * 将 callbacks 数组(备份版)遍历并执行一遍
    copies[i]()
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
// 但是，当在重新绘制之前更改状态时，它存在一些细微的问题
// （例如＃6813，由外向内的过渡）。
// 此外，在事件处理程序中使用（宏）任务会导致一些奇怪的行为
// 无法规避的代码（例如＃7109，＃7153，＃7546，＃7834，＃8109）。
// 因此，我们现在再次在各处使用微任务。
// 这种折衷的主要缺点是存在一些方案
// 微任务的优先级过高，并且在两者之间触发
// 顺序事件（例如，具有解决方法的＃4521，＃6690）
// 甚至在同一事件冒泡之间（＃6566）。
// * 抛弃了2.5宏任务+微任务的实现方式，改换微任务实现
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:

// nextTick行为利用了微任务队列，可以通过本机Promise.then或MutationObserver对其进行访问。
// MutationObserver具有更广泛的支持，但是当在触摸事件处理程序中触发时，它在iOS> = 9.3.3的UIWebView中严重错误。触发几次后，它将完全停止工作...
// 因此，如果本地Promise可用，我们将使用它：
/* istanbul ignore next, $flow-disable-line */
// * isNative表示浏览器原生支持, 这里首先要保证Promise可以使用，并且是原生支持的Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop) // * 如果是IOS环境, 那么就在最后使用setTimeout这种宏任务去直接执行一个空函数
  }
  isUsingMicroTask = true // * 将是否使用微任务置为true
  // ? 如果以上Promise浏览器原生并不支持, 那么就会使用MutationObserver, 使用这个首先要排除IE，然后要判断IOS7.x版本下的MutationObserver
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks) // * 定义一个新的MutationObserver实例
  const textNode = document.createTextNode(String(counter)) // * 观察的DOM
  // * 观察的DOM为textNode, 观察DOM节点的  characterData  变化,  变化的时候, 就会执行 flushCallbacks

  // ? CharacterData 抽象接口（abstract interface）代表 Node 对象包含的字符。这是一个抽象接口，意味着没有 CharacterData 类型的对象。 
  // ? 它是在其他接口中被实现的，如 Text、Comment 或 ProcessingInstruction 这些非抽象接口。
  // ? 所以他监听的就是这个文本节点
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    // * 取余
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  // ! 因此微任务函数的触发，就是依靠 counter 的变化去触发DOM节点上data的改变，data改变的同时, 就会触发flushCallbacks
  isUsingMicroTask = true // * 只有使用MutationObserver来触发回调微任务, 才会将 isUsingMicroTask置为true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // * 如果上面两个都不支持, 就会使用setImmediate来执行flushCallbacks
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  // * 如果以上全部都不支持，就直接降级使用宏任务setTimeout来执行 flushCallbacks
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
// * 以上种种，主要是为了根据环境，来确定使用的微任务函数具体是哪一个

/**
 * @params cb 传入的回调函数
 * @params ctx 指向当前vue组件的实例
 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    // * 使用try catch是为了不让回调函数的报错影响后续的执行
    if (cb) {
      try {
        cb.call(ctx) // * 执行传入的回调函数
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      // * 给Promise用的判断
      _resolve(ctx)
    }
  })
  if (!pending) {
    // * 只要没有进入过这里面, 那么pending一定是false
    pending = true
    // * 执行微任务函数, 实际上就是执行上面的callbacks数组中所有的函数, 也就是执行传入的cb
    // * 当然, 微任务是一个异步回调, 也就是说，他会在下一个tick，去执行cb
    // * 所以每一次到这里，都不会立即执行，而是等待这一次收集完成，timerFunc中的回调函数触发，才会去执行其中的 callback 数组下所有的任务
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    // * 如果没有回调函数，但是存在Promise对象, 那么就会将Promise的resolve 赋值给 _resolve
    // * 不传递cb, 那么this.$nextTick就会变成一个Promise对象，那么就可以使用 this.$nextTick.then(() => {定义函数})
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
