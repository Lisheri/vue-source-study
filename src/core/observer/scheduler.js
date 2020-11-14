/* @flow */

import type Watcher from './watcher'
import config from '../config'
import { callHook, activateChildComponent } from '../instance/lifecycle'

import {
  warn,
  nextTick,
  devtools,
  inBrowser,
  isIE
} from '../util/index'

export const MAX_UPDATE_COUNT = 100

const queue: Array<Watcher> = [] // * Watcher数组
const activatedChildren: Array<Component> = [] // * 激活的child
let has: { [key: number]: ?true } = {} // * 表示这个watcher是否重复添加
let circular: { [key: number]: number } = {} // * 循环更新用的
let waiting = false // * 标志位
let flushing = false // * 也是标志位
let index = 0 // * watcher的索引

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  // * 主要是将这个公共变量都重置一遍, 保证下一次进来的状态不会发生改变
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
export let currentFlushTimestamp = 0

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now()
  }
}

/**
 * Flush both queues and run the watchers.
 */
// * 每一次nextTick的时候，就会执行这个函数, 在这个函数中会遍历所有的queue, 遍历过程中如果发现有watcher会执行watcher
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow() // * 获取开始执行的时间戳
  flushing = true // * 在此处将flushing置为true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // * 根据先后顺序对watcher进行排序
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    // * 遍历这个queue 但是在遍历的过程中, queue的长度可能会发生变化
    watcher = queue[index] // * 当前 watcher 
    if (watcher.before) {
      watcher.before() // * options上面的before, options是 new Watcher的时候传入的第四个参数，渲染watcher中里面是beforeUpdate的回调函数
    }
    id = watcher.id
    has[id] = null // * 表示这一次tick已经更新过了，下一次进入update, 允许再次将当前订阅者加入到订阅者队列中
    watcher.run() // * 执行watcher.run()
    // TODO 包括为什么要每一次去计算queue.length就是在于watcher.run执行的时候，会触发一些回调
    // TODO 这些回调会再次执行queueWatcher, length就会发生改变
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      // * 这个判断是为了判断是不是存在无限循环更新，如果有 就直接会抛错, 主要就是执行 flushSchedulerQueue 时候又执行了 queueWatcher 在条件满足的时候就会像watcher队列queue中
      // * 添加新的watcher, 这种时候， 就可能会触发这里无限更新的bug
      // * 在watch属性(user watcher)下面定义一个当前值的更新会触发这个， 使用this.$on('hook:updated', () => {this.xxx = xxx})也会
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice() // * queue.slice()定义一个副本，这是一次简单的深拷贝, 这个queue是一个watcher队列

  resetSchedulerState() // * 每次执行完flushSchedulerQueue都会执行这个resetSchedulerState

  // call component updated and activated hooks
  // ? 这是给keepAlive下面两个钩子函数activated和deactivated用的
  callActivatedHooks(activatedQueue)
  // ! 这里就会执行updated这个钩子函数, updatedQueue表示的就是在queue这个watcher队列已经全部更新完成之后，用于表示更新完成的watcher
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    // * 不停地遍历queue，发现如果是一个_watcher(渲染watcher)并且他已经mounted过了，并且他还没有destroyed销毁, 就会触发updated
    // * 由于vm._watcher本身就是渲染watcher拷贝过来的，因此vm._watcher === watcher如果成立，那么就说明watcher是一个渲染watcher
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false
  activatedChildren.push(vm)
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
// * queueWatcher就是一个watcher队列，他将需要更新的watcher全部推入了watcher队列中
export function queueWatcher (watcher: Watcher) {
  // * 在new一个Watcher的时候, id是自增的，因此不同的watcher id是不同的
  const id = watcher.id
  // * has的键是number类型的, 用于判断是否添加过watcher
  // ? 主要是在同一时间有很多数据在更新，然后在更新数据的时候， 同时去更新了多个数据，但是他们对应的订阅者，是统一个渲染watcher，但是实际上每一个渲染watcher都会执行update
  // ? 执行update就会执行queueWatcher, 因此在同一个tick内，会多次触发同一个渲染watcher的update, 这样做的话，同一个watcher，就只会push一次到queue队列中
  if (has[id] == null) {
    // * 如果没有添加过，才会把这个id置为true, 才会执行下面的逻辑
    has[id] = true
    if (!flushing) {
      // ? flushing最开始标志为false, 因此就会进入到这个逻辑中
      // * 将watcher push到队列中
      queue.push(watcher)
    } else {
      // * 在执行 flushSchedulerQueue 下面的watcher.run()的时候又一次进入了queueWatcher的时候, 就会执行这个else下面的内容
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // * 先拿到queue这个队列的最后一个的索引
      let i = queue.length - 1
      // * 这里的index表示在执行 flushSchedulerQueue 的时候遍历的那个的索引
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      // * 当 flushSchedulerQueue 中遍历的索引大于 i 或者 watcher.id 大于 队列中第i个的id时, 就会将当前watcher插入到第 i+1 的位置上
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      // ? 这里的waiting也是为了保证 nextTick(flushSchedulerQueue) 这个逻辑只执行一次
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      // * 这个nextTick可以理解为就是一个异步的实现, 简单理解就是在下一个tick去执行flushSchedulerQueue
      // * 这里就是等待DOM改变，在下一次tick执行flushShedulerQueue
      nextTick(flushSchedulerQueue)
    }
  }
}
