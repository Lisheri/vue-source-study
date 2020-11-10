/* @flow */

import VNode from './vnode'
import { resolveConstructorOptions } from 'core/instance/init'
import { queueActivatedComponent } from 'core/observer/scheduler'
import { createFunctionalComponent } from './create-functional-component'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject
} from '../util/index'

import {
  resolveAsyncComponent,
  createAsyncPlaceholder,
  extractPropsFromVNodeData
} from './helpers/index'

import {
  callHook,
  activeInstance,
  updateChildComponent,
  activateChildComponent,
  deactivateChildComponent
} from '../instance/lifecycle'

import {
  isRecyclableComponent,
  renderRecyclableComponentTemplate
} from 'weex/runtime/recycle-list/render-component-template'

// inline hooks to be invoked on component VNodes during patch
// * 这是每一个组件都会有的hook
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    // * 如果data下面有keepalive，则走下面的逻辑
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // * 组件创建过程中，activeInstance就代表当前层级的vm实例，等__patch__执行完毕后，activeInstance就会清空变为null
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      // * 然后这里手动调用子组件实例上的$mount方法
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },

  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      // * 执行完了insert，才会把_isMounted设置为true
      // * 也就是说，首次渲染，只会执行mounted，当再次去更新，重新渲染，才会执行updated
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted')
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },

  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}

// * hooksToMerge实际上就是[init, prepatch, insert, destroy]
const hooksToMerge = Object.keys(componentVNodeHooks)

/**
 * 
 * @param {*} Ctor // ! 是一个组件类型的类，也可以是函数，对象，也可以是空类型
 * @param {*} data // ! 使用一个VNodeData类型
 * @param {*} context // ! 也就是当前vm实例
 * @param {*} children // ! 儿子组件VNode
 * @param {*} tag // ! 标签
 */
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  // * Ctor是一个必须参数，如果Ctor传入但是不存在，这里将直接返回
  // TODO 实际上这里的Ctor构造器，就是import组件的时候生成的
  // TODO Ctor经过vue-router之后，添加了较多属性，比如说beforeCreate，beforeDestroy等
  if (isUndef(Ctor)) {
    return
  }

  // * 由于前面在init合并过options，所以在这里通过context访问的$options._base就是Vue下的options的_base，也就是Vue
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    // ! 全局注册状态下的Ctor是一个构造器(也就是一个函数，所以不满足)，typeOfCtor是function, 因此并不会进入这个逻辑
    // * 如果Ctor(constructor)是一个对象，那么就会使用Vue上的entend方法，将Ctor转换为一个新的构造器
    // * 实际上是将当前组件做了一次缓存
    // TODO 在这个extend中，会将Ctor和Vue的options做一次合并
    // ! 这是一个重点，组件的构造器，是继承自Vue的，基本上继承了Vue的所有能力
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  // * 如果这个构造器并没有返回一个函数，那么就会报一个错误，表示组件定义有问题, 因为异步组件本身就是一个构造器，而一般组件在上述过程中会转换为一个构造器，因此不是构造器就是上面的步骤报错了而没有执行完
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component 异步工厂，也就是表示异步组件使用的是异步工厂模式
  let asyncFactory
  // * 由于异步组件是一个工厂函数, 所以并不会有cid这种东西
  // * 这个isUndef(x:any): boolean返回一个布尔值，表明传入的参数是否为undefined或者null，满足其一，则为true否则就是false
  if (isUndef(Ctor.cid)) {
    // * 这里实际上相当于将Ctor备份了一遍
    asyncFactory = Ctor
    // ? baseCtor就是Vue.$options._base
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
    // ! 当在其中通过forceRender执行$forceUpdate的时候，就会重新回到以上方法中，而在第二次执行的时候就会保留一个resolve指向异步组件的构造器，而在强制更新的时候，就将这个构造器返回出来
    // ! 因此下面的就不会再执行了
    // ! 到此为止，就得到了异步组件的构造器，后面的方法，就和同步一毛一样了

    // TODO 最玄妙的地方就在于，首次加载，这个Ctor构造器会自动返回一个undefined，并且渲染出一个空标签，然后将异步组件的$options返回给结果，拿到结果后，执行定义的resolve，再次进入resolveAsyncComponent
    // TODO 然后在其中通过一次forceRender去触发所有异步组件的强制更新(forceUpdate)
    // TODO 强制更新完之后，会保留一个异步组件的构造器，这个时候再次回到resolveAsyncComponent，然后将上一次保留的构造器直接返回, 将异步组件的构造器赋值给Ctor
    // TODO 在这一次forceUpdate过程中，继续向后执行，就和同步组件加载一模一样了，最后返回一个异步组件的VNode
    // TODO 初级异步组件加载到以上步骤结束
    if (Ctor === undefined) {
      // * 初级异步组件加载上面返回值为undefined，就会执行下面的方法
      // * 以下方法会返回一个空的注释节点，也就是说异步组件加载第一次会返回一个空的注释节点
      // * 这实际上是一个同步的加载过程，当这个加载过程结束之后，就会去执行一个resolve，这个resolve就是在resolve-async-component下面定义的resolve函数
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // * 这里要对一些options重新计算，因为可能会被全局混入影响
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  // * 这里是v-model的问题，对v-model的判断
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  // * 将props处理为propsData
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component 函数组件
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on // * 对自定义事件的处理
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // install component management hooks onto the placeholder node
  // * 安装一些组件的钩子
  // * 之前在patch的过程中也有，在不同的阶段会执行不同的钩子
  // ! 这里也比较重要，组件的VNode的data上面有一些hook，这些hook都merge了通用的hook

  // TODO 一般情况下执行之前data只有一个on
  installComponentHooks(data)

  // return a placeholder vnode
  // * 最后就是使用处理过后的Ctor，和propsData等生成一个VNode, 前面的所有步骤，都是在对生成组件VNode的一些参数做处理
  const name = Ctor.options.name || tag
  // * 当然这个组件的VNode会使用vue-component-开头做一个标识, 然后会传入data,然后第三四五个参数都是空
  // * 这里很重要，组件VNode初始化的时候，children都是空值, text和element也是空值
  // * 但是组件有一个componentOptions对象，这里面包含了他的Ctor(constructor), propsData, listeners(事件), tag和children
  // ! 最后就是组件的VNode没有children，但是多了componentOptions对象
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  // Weex specific: invoke recycle-list optimized @render function for
  // extracting cell-slot template.
  // https://github.com/Hanks10100/weex-native-directive/tree/master/component
  /* istanbul ignore if */
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}

export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any // activeInstance in lifecycle state
): Component {
  // * 这里的parent实际上是当前vm的一个实例
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode, // * 占位符VNode
    parent
  }
  // check inline-template render functions 暂时先跳过该逻辑
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  // * 这里的conponentOptions就是之前创建vnode的时候，传入的第三个参数，内部有Ctor(完全继承了一个Vue的组件的构造器), propsData, listeners, tag和children
  // * 所以这里执行Ctor的时候，实际上执行的就是之前在extends中定义的sub的构造函数，因为这个Ctor就是sub
  // * 因此这里直接就是相当于 Vue._init(options)
  // * options在这里传入的时候，一共有五个成员_isComponent, _parentVnode, parent, render, staticRenderFns
  // * 最后这里返回的是继承自初始化完成的组件vm的sub
  // TODO 通俗的说，执行完这个函数之后，返回的是初始化完成的子组件的vm实例
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data: VNodeData) {
  // * 这里就是遍历通用钩子，然后将通用钩子和当前的钩子做一次比较，如果不等，就会将通用钩子和当前钩子合并
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      // * 这个合并的过程就是如果钩子中有了这个key，那就将通用的函数和钩子中的函数放在一起，先后顺序执行，然后将_merged设置为true表示已经合并过了
      // * 本质上就是让data上的hook里面有组件通用的钩子
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

function mergeHook (f1: any, f2: any): Function {
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data: any) {
  const prop = (options.model && options.model.prop) || 'value'
  const event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value
  const on = data.on || (data.on = {})
  const existing = on[event]
  const callback = data.model.callback
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing)
    }
  } else {
    on[event] = callback
  }
}
