/* @flow */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  context: Component, // * vm实例
  tag: any, // * 标签
  data: any, // * VNode的data
  children: any, // * 子节点
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // * 如果data是一个数组，这个意思是data没有传，而数组表示的是第四个参数children
  // * isPrimitive用于判断参数是否属于 string, number, symbol, boolean 这四个类型
  // * 当data不存在的时候，就会将参数往前移动
  // * 由于第一个参数vm和最后一个参数alwaysNormalize是固定肯定会传入的，只有中间四个参数会有出入，因此这里少了一个data，就会将children和normalizationType往前移动一个位置，在把data设置为空
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  // * 这个isTrue只能用于判断Boolean，而不会把传入的值变成一个truely变量或者一个falsely变量进行判断
  if (isTrue(alwaysNormalize)) {
    // * true表示是自定义的render函数， false表示的是由template转换的render函数
    normalizationType = ALWAYS_NORMALIZE
  }
  // * 参数在createElement中进行处理，当参数都处理完毕之后，在调用_createElement方法进行真正的创建
  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // * 先对data做了一层校验，表明data并不能是响应式的
  // * isDef用于判断参数是否存在(不是undefined也不是null)，如果存在则返回true，不存在则返回false
  // * 当把data编程响应式的时候，会给data添加一个_ob_这个属性
  // * 一旦有这个属性，就会报警告，因为不允许VNode的data是响应式的data
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // * 接着判断是否存在一个data.is
  // * data.is在component.is的时候，这个is就是标签上会有一个is属性，这个is属性会指向你自定义的某个标签，在这里，判断他是否存在，如果存在，就会将原来的标签替换为is指向的标签
  // * 主要是在一些固定的组件内，你只能使用原生标签，而不能使用自定义的组件，这个时候就需要is去做转换，这里就是is转换的位置
  if (isDef(data) && isDef(data.is)) {
    // * data.is存在，就会将标签的名称换为data.is
    tag = data.is
  }
  // * 如果没有tag，也会返回一个空的VNode
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // * 对data的参数做一些校验，比如key不是一个基础类型，就会抛错
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  // * 插槽相关，后期再继续看
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // * 这里会判断，normalizationType的类型，如果是一个ALWAYS_NORMALIZE
  // * ALWAYS_NORMALIZE表示是自定义render
  // * 主要是将children变为一个一维数组，simpleNormalizeChildren仅扁平化第一层
  // * normalizeChildren递归扁平化所有层级，同时将连续的两个文本标签合并为一个，如果本身是一个非正常的标签，直接转换为文本标签
  if (normalizationType === ALWAYS_NORMALIZE) {
    // * 这里会对所有的children执行normalizeChildren
    // * 主要是有些时候children作为自定义的render，会只传递了一个text，而不是一个VNode，在这里，将会对children进行转化，转换为标准的VNode
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    // * 如果在实例上存在$vnode并且$vnode.ns存在，那么ns就是实例上面$vnode的ns，如果不存在，则返回字符串类型的tag
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // * isReservedTag用于判断tag是不是一个常规标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      // * 如果data存在并且有一个带native修饰符的on事件，则直接抛错
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      // * 然后这里实例化一个VNode
      // *  config.parsePlatformTagName检查tag是不是一个string，是就返回，不是则在编译阶段报错
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // * 在上面判断中，可以得到一个经历过component所有options并且合并了Vue构造函数的一个构造器
      // * 全局注册，就会走这里
      // component
      // * 组件VNode
      // * 如果这个tag是一个组件标签，虽然是string类型，但是也会走入这里
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      // * 如果是不认识的，就直接创建
      // * 也就是在开发过程中，如果你写了一个没有注册的组件，那么在element中，就会有一个纯粹的组件名的标签，而不会编译任何东西
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // * 全局组件
    // * 如果该标签直接就是一个导入的组件，直接进入此处，通过createComponent创建组件VNode
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
    // * vnode存在
  } else if (isDef(vnode)) {
    // * 如果命名空间ns存在，那就执行apply
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style)
  }
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
