/* @flow */

import VNode, { createTextVNode } from 'core/vdom/vnode'
import { isFalse, isTrue, isDef, isUndef, isPrimitive } from 'shared/util'

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep // * 也就是说只做了一层扁平化
// because functional components already normalize their own children.
// * 如果是template生成的render函数，就会使用该方法
// * 这里的children是一个类数组，在template转换的时候生成的
export function simpleNormalizeChildren (children: any) {
  for (let i = 0; i < children.length; i++) {
    // * 遍历类数组，如果发现每一个元素也是一个数组
    if (Array.isArray(children[i])) {
      // * 如果数组中还有数组，就扁平化
      // * 操作很骚，concat可以合并多个数组，如果是一个 arr.concat(arr2)，这个时候concat的this指向的是数组arr
      // * 在这里将this指向一个空的数组，可以将children做一个初步的扁平化
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
export function normalizeChildren (children: any): ?Array<VNode> {
  // * 如果children是一个基础类型(在Vue2.x中，只加入了当年除去null和undefined的基础类型，没有ES2020的bigInt, 只有number, string, boolean和symbol)，
  // * 就会使用children创建一个textVNode，将children代表的值，传入VNode的text属性中，并且将其放入一个空的数组中
  // * 如果children是一个数组，那么就会调用normalizeArrayChildren方法，对children做处理
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

// * 用于判断node是不是一个文本标签
function isTextNode (node): boolean {
  // * node.isComment是false才会返回true
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

// * normalizeArrayChildren比上面的normalizeChildren多做了很多次的处理，就是不仅仅只是一层的扁平化，而是递归的进行多次扁平化，然后都拍平到一个数组中
function normalizeArrayChildren (children: any, nestedIndex?: string): Array<VNode> {
  const res = []
  let i, c, lastIndex, last
  for (i = 0; i < children.length; i++) {
    c = children[i] // * current表示当前值
    // * isUndef()用于判断是不是null或者undefined，是则返回true
    // * 如果children[i],或者c是一个boolean值，则直接跳过当前循环
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1 // * lastIndex用于表示数组的最后一个下标
    last = res[lastIndex] // * last用于标识最后处理的节点
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          // * 如果最后处理的节点和当前处理的第一个节点都是一个文本标签，那么就会将最后一个和第一个合并为同一个，同时删除第一个
          res[lastIndex] = createTextVNode(last.text + (c[0]: any).text)
          c.shift()
        }
        // * 将cpush到结果数组中
        res.push.apply(res, c)
      }
    } else if (isPrimitive(c)) {
      // * 如果当前值是一个基础类型不是一个数组
      // * 同时上次处理的最后一个元素是一个文本标签
      if (isTextNode(last)) {
        // * 就会合并当前标签和上次处理的最后一个标签
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c)
      } else if (c !== '') {
        // * 这个说明C本身就是一个文本，所以直接转换为一个文本标签，毕竟在children内部，一般不会存在boolean、symbol、number，就算是这些，也会变为一个string，然后在制作成一个文本标签
        // * 就直接将当前值转换为一个文本标签，然后在push到res中
        // convert primitive to vnode
        res.push(createTextVNode(c))
      }
    } else {
      // * 最后就是正常情况的c，一个标准的VNode
      // * 判断当前值和最后一个值是不是一个文本标签
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        // * 如果是则直接上次处理的最后一个值和当前值合并
        res[lastIndex] = createTextVNode(last.text + c.text)
      } else {
        // * 这里会对V-for之类的做一个处理
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) && // * c的标签不能是空值
          isUndef(c.key) && // * c的key没有值
          isDef(nestedIndex)) { // * 存在nestedIndex，否则不做处理
          c.key = `__vlist${nestedIndex}_${i}__`
        }
        res.push(c)
      }
    }
  }
  return res
}
