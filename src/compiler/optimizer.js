/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  // 首先判断是否传递AST, 没有就返回
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 标记root中的所有静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 标记root中的所有静态根节点
  markStaticRoots(root, false)
}

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node: ASTNode) {
  // 判断当前astNode是否是静态的
  node.static = isStatic(node)
  // 如果AST对象的type是1, 也就是说明描述的是元素, 所以需要处理子节点
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    // 判断是否保留标签(主要是判断不是组件), 这里主要是过滤掉组件, 插槽, 带有inline-template的元素
    // 不能将组件或者slot标记为静态节点, 否则会导致无法改变
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 遍历children
    for (let i = 0, l = node.children.length; i < l; i++) {
      // 当前儿子
      const child = node.children[i]
      // 递归查询子孙后代是否静态节点并标记
      markStatic(child)
      // 如果儿子不是静态的则设置为false
      if (!child.static) {
        node.static = false
      }
    }
    // 处理条件渲染中的AST对象, 和上面一样
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

// 标记静态根节点
function markStaticRoots (node: ASTNode, isInFor: boolean) {
  // 首先判断AST是否描述的是元素
  if (node.type === 1) {
    // 接着判断当前AST对象是否是静态的, 以及是否只渲染一次, 满足其一, 则以 isInFor 参数为其标记在for循环中是否静态
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 如果一个元素内只有文本节点, 此时这个元素不是静态的Root
    // Vue认为这种优化会带来负面的影响
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      // 标记静态根节点, 首先这个节点必须是静态的, 不能有子节点, 并且这个节点中不能只有一个文本类型的子节点
      // 也就是说如果一个节点只有一个文本节点, 此时这个节点不是静态根节点
      // Vue的解释是这种情况下优化成本大于收益
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    // 接下来和markStatic类似, 处理儿子们和条件渲染
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

function isStatic (node: ASTNode): boolean {
  // 首先判断AST对象的type属性
  // type为2表示表达式, 一定不是静态的
  if (node.type === 2) { // expression
    return false
  }
  // type为3表示文本节点, 一定是静态的
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings 非动态绑定
    !node.if && !node.for && // not v-if or v-for or v-else 不是v-if, v-for
    !isBuiltInTag(node.tag) && // not a built-in 非内置组件
    isPlatformReservedTag(node.tag) && // not a component 非组件
    !isDirectChildOfTemplateFor(node) && // 不是v-for的直接子节点
    Object.keys(node).every(isStaticKey) // node中全是静态标签
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
