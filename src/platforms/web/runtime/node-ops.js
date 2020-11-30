/* @flow */

// * 这里面都是定义的一些DOM相关的操作
import { namespaceMap } from 'web/util/index'

// * 实际上就是原生api, 然后修复了对带有Mutiple的select标签的问题
export function createElement (tagName: string, vnode: VNode): Element {
  const elm = document.createElement(tagName)
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple')
  }
  return elm
}

export function createElementNS (namespace: string, tagName: string): Element {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

export function createTextNode (text: string): Text {
  return document.createTextNode(text)
}

export function createComment (text: string): Comment {
  return document.createComment(text)
}

export function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild (node: Node, child: Node) {
  node.removeChild(child)
}

export function appendChild (node: Node, child: Node) {
  node.appendChild(child)
}

export function parentNode (node: Node): ?Node {
  return node.parentNode
}

export function nextSibling (node: Node): ?Node {
  return node.nextSibling
}

export function tagName (node: Element): string {
  return node.tagName
}

export function setTextContent (node: Node, text: string) {
  // * textContent 返回的是节点下面所有层级组合起来的一串文本, 一旦赋值, 其下所有的元素豆浆会替换成一个纯文本
  node.textContent = text
  /* 
  * textContent 会获取所有元素的内容，包括 <script> 和 <style> 元素，然而 innerText 只展示给人看的元素。
  * textContent 会返回节点中的每一个元素。相反，innerText 受 CSS 样式的影响，并且不会返回隐藏元素的文本，
  * 此外，由于 innerText 受 CSS 样式的影响，它会触发回流（ reflow ）去确保是最新的计算样式。（回流在计算上可能会非常昂贵，因此应尽可能避免。）
  * 与 textContent 不同的是, 在 Internet Explorer (小于和等于 11 的版本) 中对 innerText 进行修改， 
  * 不仅会移除当前元素的子节点，而且还会永久性地破坏所有后代文本节点。在之后不可能再次将节点再次插入到任何其他元素或同一元素中。
  */
}

export function setStyleScope (node: Element, scopeId: string) {
  node.setAttribute(scopeId, '')
}
