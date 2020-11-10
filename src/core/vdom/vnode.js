/* @flow */

// * 此处为Vue的Virtual DOM定义的位置
// * 这个VNode实际上是棵树
// * 看起来他很多，但实际上比真实的dom，代价要小很多
export default class VNode {
  tag: string | void; // * 当前节点的标签名
  data: VNodeData | void; // * data 当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型。
  children: ?Array<VNode>; // * children子节点
  text: string | void; // * 节点的文本
  elm: Node | void; // * 当前虚拟节点所对应的真实DOM节点
  ns: string | void; // * 节点的命名空间
  context: Component | void; // rendered in this component's scope // * 编译作用域
  key: string | number | void; // * key值，用于标记这一个VNode
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context // * 所谓上下文就是当前vue实例, 如果是组件就是组件实例
    this.fnContext = undefined // * 函数式组件的作用域
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key // * 节点的key属性，被当做节点的标志，用以优化
    this.componentOptions = componentOptions // * 组件的options选项
    this.componentInstance = undefined // * 当前节点对应的组件的实例
    this.parent = undefined // * 当前节点的父节点
    this.raw = false // * 是否为原生HTML或只是普通文本，innerHTML的时候为true， textCOntent的时候为false
    this.isStatic = false // * 是否为静态节点
    this.isRootInsert = true // * 是否作为根节点插入
    this.isComment = false // * 是否是一个注释节点, 这个意思是就是说两边带了<-- -->这种
    this.isCloned = false // * 是否是一个克隆节点
    this.isOnce = false // * 是否存在v-once指令
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
// * 用于创建一个空的VNode
export const createEmptyVNode = (text: string = '') => {
  // * 新建一个vnode实例，不传递任何参数，constructor中的参数设置除默认的之外，都是undefined
  const node = new VNode()
  // * 将text设置为传入的值，如果没有，就是空字符串
  node.text = text
  // * isComment设置为true
  node.isComment = true
  // * 这个node实际上就是一个注释节点
  return node
}

export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
// * 将当前节点的所有内容都复制给一个新的节点
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
