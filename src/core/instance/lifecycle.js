/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import { mark, measure } from '../util/perf'
import { createEmptyVNode } from '../vdom/vnode'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'
import { toggleObserving } from '../observer/index'
import { pushTarget, popTarget } from '../observer/dep'

import {
  warn,
  noop,
  remove,
  emptyObject,
  validateProp,
  invokeWithErrorHandling
} from '../util/index'

export let activeInstance: any = null
export let isUpdatingChildComponent: boolean = false

export function setActiveInstance(vm: Component) {
  // * 在组件渲染的过程中，之所以将vm作为activeInstance，就是因为组件是作为当前实例的儿子，因此，会把当前实例当成父级vm实例，保存下来
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}

export function initLifecycle (vm: Component) {
  //  * 建立父子关系
  // * 组件从VNode转换为real DOM的时候，执行以下内容就是在__patch__的过程中, 因此activeInstance就是当前vm实例
  const options = vm.$options

  // locate first non-abstract parent
  // * 由于options合并过，因此这个options包含了Vue的options以及原来的五个成员，parent就代表当前层级的vm实例
  // ? 到50行为止主要目的是为了找到当前vue实例(组件)的父组件, 然后将当前实例添加到当前组件的父组件的$children中
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    // * parent是当期实例vm，因为子组件的创建是基于当前组件的vm创建的
    // * 在这里会见将子组件的vmpush到parent的$children中
    // * 正因为如此，我们才可以在父亲中通过this.$children去操作子组件
    parent.$children.push(vm)
  }

  // * 在这里将parent也就是当前组件的vm，赋值给vm.$parent
  // * 所以才可以在子组件中通过this.$parent去直接操作父组件
  vm.$parent = parent
  // * 在这里做一步判断，判断parent是否存在，如果不存在，说明当前组件就是顶级组件，那么当前组件vm实例的$root就是当前组件，否则就取父节点的$root
  vm.$root = parent ? parent.$root : vm

  // * 初始化当前组件的$children和$refs
  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
  // * 到此为止，生命周期初始化完成
}

export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    // * update是Vue的私有方法，他所做的事情，就是把VNode渲染为一个真实的DOM，它被调用的时机有两个，一个是首次渲染的时候，一个是数据更新的时候
    const vm: Component = this // * 当前组件的实例
    const prevEl = vm.$el // * 指向真实DOM
    const prevVnode = vm._vnode // * 上一次的VNode，作对比时使用。
    /* 以上三个变量在首次渲染的时候，都是空值，暂时用不上 */
    // * 子组件patch的时候执行这个，会将子组件的vm赋值给activeInstance
    // * js的执行是同步的，而组件的创建就是一个深度遍历的过程，在父亲创建的时候如果有组件的创建，就会在父亲patch的时候进入创建组件的部分，然后组件创建的时候内部还有，也会继续走进去，走到这里来，会将父亲的vm一级一级传下去
    const restoreActiveInstance = setActiveInstance(vm)
    // * 在这里将当前节点的vnode赋值给_vnode
    // * $vnode是一个占位符Vnode，而_vnode是一个渲染vnode负责渲染的，所谓占位符，也就是那个组件名字的标签，比如一个组件叫做HelloWorld, <hello-world />这就是一个占位符
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    // * 首次渲染
    if (!prevVnode) {
      // initial render
      // * 子组件渲染的时候会再次调用patch，子组件创建的时候$el是undefined, vnode代表自己的虚拟dom， hydrating是false
      // * 首次执行__patch__的时候，第一个参数传入的是真实DOM, 第二个是渲染生成的vnode，后面两个都是false
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    // * 等待整个__patch__执行完了，才会执行setActiveInstance返回的那个闭包函数，将activeInstance设置为null
    // * 也就是说在整个__patch__的过程中，activeInstance都是vm实例
    // * 并且在这里并不一定是设置为空值，设置为空值是在最外层，而实际上，他应该恢复到上一级的实例
    // * 始终保持activeInstance和prevActiveInstance是一个父子关系 
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }

  Vue.prototype.$forceUpdate = function () {
    // * 调取$forceUpdate的时候会去执行渲染watcher的update()
    // * 也就是会执行这个vm._update(vm._render(), hydrating), 去强制update一次
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }

  Vue.prototype.$destroy = function () {
    // * 组件销毁会执行这个函数，也就是说在组件销毁之前，会先执行beforeDestroy
    const vm: Component = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      // * dom的移除, 将父子关系移除
      remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    // * 通过将patch方法的第二个参数vnode传递为null，进入patch中一个递归销毁逻辑，递归的绝后
    vm.__patch__(vm._vnode, null)
    // * 销毁完了，就会执行destroyed
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    // * 取消挂载
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      // * 将该节点从VDOM树上面移除
      vm.$vnode.parent = null
    }
  }
}

export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  // * 首先使用vm.$el将传入的el做一次缓存
  vm.$el = el
  // * 如果本身就没有传入一个render函数，并且template也没有转换为一个render函数
  if (!vm.$options.render) {
    // * 首先创建一个空的虚拟节点
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      // * 在开发环境中抛出警告，如果定义了template并且template的第一个值不是#，定义了el或者执行mountComponent时候传入了el，则抛出警告
      // * 这个警告表明使用的runtime-only版本，但是又使用了template，而不是渲染函数render
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  // * 在此处执行beforeMount
  // * 和mounted不同的是，beforeMount这个钩子函数，是先父后子的
  // * 因为mountComponent的执行，是一层一层向内部执行的
  callHook(vm, 'beforeMount') 

  let updateComponent
  /* istanbul ignore if */
  // * 如果开发环境配置了performance，则使用mark = window.performance.mark()
  // * window.performance.mark()用于记录一个传入的名称从某一时刻到记录时刻的毫秒数
  // * 通过一个给定的名称，将该名称（作为键）和对应的DOMHighResTimeStamp（作为值）保存在一个哈希结构里。该键值对表示了从某一时刻（注：某一时刻通常是 navigationStart 事件发生时刻）到记录时刻间隔的毫秒数。
  // * 通常用来多次记录时间间隔
  // * 上下两个实际上没有太大的区别，只是第一个部上了两个性能埋点，用于测量vnode渲染花了多少时间，以及vm.update()执行花了多少时间
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      // * Vue提供的性能埋点，文档有介绍
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      // * measure表示window.performance.measure()，同时将前面的startTag和endTag记录的时间节点清除
      // * window.performance.measure(name, start, end)用于创建一个名为name, 测量开始标志为start，测量结束标志位end的一次测量
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    // * 定义了一个updateComponent函数，在函数中调用vm._update(vm._render(), hydrating)
    // * 第一个参数是通过vm._render()来渲染出的一个VNode，第二个参数和服务端渲染相关
    // * 在Watcher这个渲染观察者的constructor中，调用this.get()中就会使用到updateComponent，然后执行vm._render()渲染一个vNode
    // * 在通过vm._update将其挂载出来
    updateComponent = () => {
      // * 通过vm_render()返回了一个VNode，这是顶层的一个VirtualDom节点
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // * 通过new Watcher来执行上面定义的updateComponent, 这里的Watcher是一个渲染Watcher
  // * Watcher是和响应式原理相关的一个类，他是一个观察者，在Vue中有很多自定义的Watcher也有这样的渲染Watcher
  // * 此处就是一个渲染Watcher
  // * 此处向Watcher传入五个参数，也是Watcher类的constructor接收的五个参数，分别为
  /**
   * @param vm  当前Vue实例
   * @param expOrFn 此处传入函数或其他情况， updateComponent表示一个函数
   * @param cb 回调函数 此处使用noop空函数
   * @param options 一些配置
   * @param isRenderWatcher 是否为渲染Watcher，此处为true
   */
  // * 在watcher初始化的时候，先执行一次beforeUpdate
  // * 并且在执行beforeUpdate的时候，这个时候数据更新已经完成，只是还没有更新视图
  // TODO updateComponent是作为渲染Watcher的getter传入的
  // TODO 对于渲染watcher而言，他的回调是noop，他的getter是updateComponent
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    // * 执行mounted的时期有两个，第一个就是此处，如果实例初始化的时候没有$vnode说明这是一个根节点，在mountComponent中就会触发mounted周期的函数
    callHook(vm, 'mounted')
  }
  return vm
}

export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  // * updateChildComponent方法主要就是对props、 listeners、 parentVnode 和 renderChildren 的更新
  // * 该方法主要对子组件传入的 props、 事件 等做更新
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  const newScopedSlots = parentVnode.data.scopedSlots
  const oldScopedSlots = vm.$scopedSlots
  
  /* 
    * $key： 表示插槽内容是否在更新时复用
    * $stable： 插槽的渲染函数是否需要每次重新计算
    * name: fn:  表示对应作用域插槽的渲染函数
  */
 
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  )

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  const needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  // update listeners
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}

export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}

export function callHook (vm: Component, hook: string) {
  // * callHook接收两个参数，第一个是vue实例，第二个是生命周期
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const handlers = vm.$options[hook] // * 这个handlers是一个数组, vm.$options经历过合并，将相同生命周期的方法合并到一起
  // * 这个合并很好理解，比如组件内部有created方法，同时组件引入一个mixin中也有一个created方法，这个时候，会将组件的created方法和mixin中的created方法进行合并，当然这个合并就是按顺序执行两个方法
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    // * 通过$emit触发$on的hook方法
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
