/* @flow */

import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import { normalizeScopedSlots } from '../vdom/helpers/normalize-scoped-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'

export function initRender (vm: Component) {
  // * 此处的vm指向Vue实例
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  // * 以下两个方法，只有最后一个参数不一样，这个_c是给编译生成的render函数所使用的方法
  // * 但是这两个方法最终都会调用createElement()这个函数
  // * _c对编译生成的render函数进行转换(模板编译的render专用h)
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // * 这个vm.$createElement是给手写的render函数提供了一个创建VNode的方法
  // * 也就是createElement方法，详情见官方文档, 参数a表示标签， b代表一些配置，c是子节点的插值
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}

export let currentRenderingInstance: Component | null = null

// for testing only
export function setCurrentRenderingInstance (vm: Component) {
  currentRenderingInstance = vm
}

export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  // * 安装渲染相关的帮助方法
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }
  // * _render方法的定义，返回的是一个VNode
  Vue.prototype._render = function (): VNode {
    const vm: Component = this // * 依然是使用vm代替this
    // 这个render是用户定义或模板编译出来的
    const { render, _parentVnode } = vm.$options
    // * 如果存在父节点
    // ! 插槽相关，先不慌
    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    // * 取出来之后赋值给vm.$vnode, 它实际上就是占位符的VNode，也就是父的VNode
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm
      // * 利用render.call去触发render方法
      // * vm._renderProxy在生产环境下就是vm，也就是指向当前实例, 开发环境是一个Proxy对象，内部有一个has配置，用于检查是否在VNode上存在一些没有定义在data，并且也不是Vue的私有成员的，但是被使用了的情况，如果有则抛错
      // * renderProxy的定义也发生在initMixin的过程中
      // * 这个render.call实际上就是createElement的返回值
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      // * 继续处理一些开发环境的错误，并且做了一些降级
      if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    // * 如果Vnode是一个数组并且长度为1，那就把VNode的第一个取出来，将其赋值给自己，把自己变成一个对象
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      // * 这里是说如果VNode是一个数组并且，vnode并不继承自VNode，在这里就会抛错。
      // * 因为这里是在初始化render函数，所以这里渲染的VNode代表的是根节点，根节点只能有一个，在上面已经将单个根节点从数组中取出来变成了一个虚拟节点对象
      // * 所以到这里就是由于出现了两个极其以上的根节点，因此会抛错
      // * 这个VNode实际上就是一个VirtualDom，是通过createElement这个方法返回生成的
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      // * 这里的意思是如果vnode不是一个VNode继承下来的，也就是说并不是一个虚拟节点，在这里，就执行createEmptyVNode来创建一个空的VirtualDom
      vnode = createEmptyVNode()
    }
    // set parent
    // * 最终会将渲染VNode的parent指向占位符_parentVnode, 这个占位符Vnode就是父的Vnode
    vnode.parent = _parentVnode
    // * 将最后得到的vnode返回出去，这就是vm._render()方法返回的结果
    return vnode
  }
}
