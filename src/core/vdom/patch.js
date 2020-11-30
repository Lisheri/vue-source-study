/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

import VNode, { cloneVNode } from './vnode'
import config from '../config'
import { SSR_ATTR } from 'shared/constants'
import { registerRef } from './modules/ref'
import { traverse } from '../observer/traverse'
import { activeInstance } from '../instance/lifecycle'
import { isTextInputType } from 'web/util/element'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  makeMap,
  isRegExp,
  isPrimitive
} from '../util/index'

export const emptyNode = new VNode('', {}, [])

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

function sameVnode (a, b) {
  return (
    // * 都没有写key, 大家都是 undefined 也是相等的, 这是一个前提条件
    a.key === b.key && (
      (
        // * 这里用于判断普通节点, 因此首先判断他们的 tag 是否相等
        a.tag === b.tag &&
        a.isComment === b.isComment && // * 是否同时是注释节点
        isDef(a.data) === isDef(b.data) && // * 是否同时定义了data
        sameInputType(a, b) // * 是否是一个相同的input类型
      ) || (
        // * isAsyncPlaceholder 表示是异步占位符节点
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error) // * 表示是一个正确的异步注释节点
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

// * backend是一个对象，里面有个两个键值对，分别是nodeOps和modules
// * 这里这个backend接收的参数，是来自于patch定义的时候，传入的nodeOps和modules
export function createPatchFunction (backend) {
  let i, j
  // * 全程是callbacks
  const cbs = {}

  const { modules, nodeOps } = backend

  // * 此处的hooks指代生命周期, 主要是[create, activate, remove, update, destroy]
  for (i = 0; i < hooks.length; ++i) {
    // * 在cbs中添加内容，键名为hooks中的每一项，键值为空数组
    cbs[hooks[i]] = []
    // * 遍历modules
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        // * 在这个cbs对象中，每一个update， create, destroy中包含了所有的update, create, destroy
        // * 也就是说在patch的过程中，会执行各个阶段的钩子
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  function emptyNodeAt (elm) {
    // * 该方法创建一个新的VNode，tag就是以前的node也就是真实DOM的tag，然后data和children都是空值，文本为undefined，对应的真实DOM就是该真实DOM
    // * 说白了就是将一个真实DOM转换为Virtual DOM
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove () {
      if (--remove.listeners === 0) {
        removeNode(childElm)
      }
    }
    remove.listeners = listeners
    return remove
  }

  function removeNode (el) {
    const parent = nodeOps.parentNode(el)
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)
    }
  }

  function isUnknownElement (vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some(ignore => {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    )
  }

  let creatingElmInVPre = 0

  // * createElm只有一个作用，就是将VNode挂载到真实的DOM上
  // * 组件更新时, 创建新的elm传入的参数是 当前vnode, 空数组[], 父节点, 当前节点所在父亲节点的儿子节点数组中的下一个
  function createElm (
    vnode,
    insertedVnodeQueue, // * 除此渲染时执行createElm为[]
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    // * vnode.elm代表该Virtual DOM 对应的真实DOM节点 初次渲染的时候对应的是挂载的#app
    // * 但是初次渲染时候，没有ownerArray，因此并不会进入这个逻辑
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render! 这个vnode被用在了以前的渲染中
      // now it's used as a new node, overwriting its elm would cause 现在他作为一个新的vnode，覆盖它对应的真实dom用作插入参考节点时将会导致潜在的补丁错误
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it. 相反，我们在为节点创建关联DOM元素之前，按需克隆该节点
      // * 此处将会克隆一个vnode来覆盖vnode
      vnode = ownerArray[index] = cloneVNode(vnode)
    }

    // * isRootInsert表示是否作为根节点插入，默认为true
    // * 初始状态nested不存在，因此，也是true
    vnode.isRootInsert = !nested // for transition enter check
    // * createComponent是创建一个组件节点，因此初次渲染时这里也是返回false
    // * 如果在组件节点内部还有组件节点，就会执行这个createComponent去执行
    // * 同时，子组件的插入，并不会在这里完成，而是在他父亲执行这个createComponent的时候，执行完了init方法后去进行插入
    
    // ! 有一点很重要，就是执行createComponent的时候，是在父组件渲染的时候，发现内部存在组件标签，才会执行这个
    // ! 所以说在渲染子组件时，createComponent执行过程中，这个parentElm是存在的，他就是父组件的vm.$el本身或者说他是body
    // ! 然后插入顺序是先子后父，因此到子组件i()执行完之后，子组件中所有的节点都已经插入完成，$children已经完成了深层的插入
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    // * 往后则是普通节点，会从叶子等级的子孙进行插入
    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag // * 初次渲染是一个div
    if (isDef(tag)) { 
      if (process.env.NODE_ENV !== 'production') {
        // * 这里是一个检测，如果在模板里写了一个组件，但是没有注册
        if (data && data.pre) {
          creatingElmInVPre++
        }
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }

      // * 查看vnode上是否存在命名空间，如果有，则创建元素并赋予命名空间，如果没有，则单纯的创建元素
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      setScope(vnode)

      /* istanbul ignore if */
      if (__WEEX__) {
        // * weex平台的逻辑
        // in Weex, the default insertion order is parent-first.
        // List items can be optimized to use children-first insertion
        // with append="tree".
        const appendAsTree = isDef(data) && isTrue(data.appendAsTree)
        if (!appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue)
          }
          insert(parentElm, vnode.elm, refElm)
        }
        createChildren(vnode, children, insertedVnodeQueue)
        if (appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue)
          }
          insert(parentElm, vnode.elm, refElm)
        }
      } else {
        // * 如果这个vnode还有子节点，就会创建子节点
        createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        // * 参数依次代表 父节点， 当前vnode对应的真实DOM, 参考节点
        insert(parentElm, vnode.elm, refElm)
        
        // ! 也就是说，整个createElm的过程，是一层一层先插入最底层的子节点，最后在插入父节点
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        creatingElmInVPre--
      }
      // * 往后都是tag不存在的情况
    } else if (isTrue(vnode.isComment)) {
      // * 如果是注释节点，那么也创建一个注释节点, 然后插入到父节点中
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      // * 否则就创建一个文本节点，然后插入到父节点中
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    // * 首先要判断组件的vnode是否存在data
    let i = vnode.data
    if (isDef(i)) {
      // * keep-alive的逻辑
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      // * 这种写法是判断i.hook是否存在，同时将i.hook赋值给i，以及hook中是否存在init方法，如果有，i就是hook中的init方法
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // * 这时的i已经是init了
        // * 在外层组件init的过程中，会对内部的组件标签等进行render和patch
        i(vnode, false /* hydrating */)
      }
      // * 到这里，组件的所有init方法都已经执行完成了，也就是说patch已经执行完成了
      // * 子组件的vm上面已经有了$el，但是子组件还没有挂载上去
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      // * 到此处，子组件的patch就已经走完了
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue)
        // * 到这里执行完之后，子组件就已经完成了插入，父组件中就可以看到子组件了
        // * 这个insertedVnodeQueue在patch的过程中，会不停的插入带有当前组件的内容。并且组件patch的过程是一个先子后父的过程，因此最底下的儿子包含的内容，会在层次高的父亲的前面
        insert(parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    // * insertedVnodeQueue在不停的扩充
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
      vnode.data.pendingInsert = null
    }
    // * 在执行initComponent的时候，就会将vnode.componentInstance.$el赋值给vnode.elm
    vnode.elm = vnode.componentInstance.$el
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
      setScope(vnode)
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode)
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode)
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    let innerNode = vnode
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode)
        }
        insertedVnodeQueue.push(innerNode)
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm)
  }

  function insert (parent, elm, ref) {
    // * 执行insert首先要父节点存在
    if (isDef(parent)) {
      if (isDef(ref)) {
        // * 如果有参考节点，并且参考节点的父节点和当前节点的父节点相等，那么就将当前节点插入到参考节点前
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        // * 如果没有参考节点，则直接将子节点插入父节点, 比如说遍历儿子时的参考节点，都是null
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // * 对节点的key做校验
        checkDuplicateKeys(children)
      }
      // * 遍历children，然后每一次都调用createElm方法
      // * 同时将当前节点的elm作为父节点，插入进去
      // * 实际上是一个递归
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
      }
    } else if (isPrimitive(vnode.text)) {
      // * 如果vnode.text是一个基础类型，也就是string number symbol boolean
      // * 那就直接调用appendChild方法，将这个节点插入进去就可以了
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
    }
  }

  function isPatchable (vnode) {
    // * vnode.componentInstance 这个东西存在的话, 说明当前vnode是一个 组件vnode
    // * 如果是渲染vnode, 是没有这个的, 但如果他又是渲染vnode 又是 组件vnode, 就会不断的循环, 直到找到他真正的渲染vnode, 并且不是一个组件vnode
    // * 然后判断这个vnode是否存在tag标签, 如果有说明可以被挂载
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    let i
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i)
    } else {
      let ancestor = vnode
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i)
        }
        ancestor = ancestor.parent
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i)
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx)
    }
  }

  function invokeDestroyHook (vnode) {
    // * 通过这个方法，递归的去销毁子组件
    // * 不停的执行销毁工作
    let i, j
    const data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode)
      // * 这个cbs包含了组件的所有生命周期函数(合并过后的)
      // * 从这里开始执行销毁工作，一层一层到最底下的销毁工作完成了，才会退出递归
      // * 因此，最底层的destroy最先完成，退出递归
      // * 所以使用destroyed这个钩子函数的时候，儿子比爹先执行。越顶层越后执行销毁钩子(并不是后执行销毁，仅仅只是后执行销毁钩子，然后最后清空，销毁开始还是很早的)
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j])
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch)
          invokeDestroyHook(ch)
        } else { // Text node
          removeNode(ch.elm)
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i
      const listeners = cbs.remove.length + 1
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners)
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm)
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm)
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm)
      } else {
        rm()
      }
    } else {
      removeNode(vnode.elm)
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    // * 最后两个参数是 [] 、 false
    let oldStartIdx = 0 // * 存储旧的节点开始的位置, 初始值是0
    let newStartIdx = 0 // * 存储新的节点开始的位置, 初始值是0
    let oldEndIdx = oldCh.length - 1 // * 存储旧的节点结束的位置
    let oldStartVnode = oldCh[0] // * 存储旧的节点开始的那个vnode
    let oldEndVnode = oldCh[oldEndIdx] // * 存储旧的节点结束的那个vnode
    let newEndIdx = newCh.length - 1 // * 存储新的节点结束的位置
    let newStartVnode = newCh[0] // * 存储新的节点开始的那个vnode
    let newEndVnode = newCh[newEndIdx] // * 存储新的节点结束的那个vnode
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // * 加入这些判断, 都是为了迅速的找到一个组件更新的最优解
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right // * 旧的开始和新的结束做相等判断
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left // * 旧的结束和新的开始做相等判断
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }

  function checkDuplicateKeys (children) {
    const seenKeys = {}
    for (let i = 0; i < children.length; i++) {
      const vnode = children[i]
      const key = vnode.key
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            `Duplicate keys detected: '${key}'. This may cause an update error.`,
            vnode.context
          )
        } else {
          seenKeys[key] = true
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i]
      if (isDef(c) && sameVnode(node, c)) return i
    }
  }

  // * 在新旧节点相同的情况下, 执行该方法, 传入参数依次为 旧的vnode 新的vnode [] null null false
  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // * 组件更新直接跳过这里, ownerArray 为 null
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode)
    }

    // * 由于其新旧节点相同, 因此这里直接就是拿到旧节点的 dom节点, 赋值给新节点的vnode.elm, 并且用一个变量elm来保存
    // * vnode.elm 在组件更新的时候是一个undefined, 因为他还没有走完整个patch, 还没有转换为一个真实的DOM节点
    const elm = vnode.elm = oldVnode.elm

    // ? 异步组件
    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    // ? static
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    // * 如果这个 vnode 存在data, 并且 data 上有 hook 并且这个 hook 还是一个 perpatch hook, 说明这个 vnode 是一个组件vnode, 那么就执行 hook上的 perpatch(oldVnode, vnode)
    // * 执行 perpatch 主要是为了执行其下面的 updateChildComponent 对传入子组件的 props, 事件等做更新
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    // * 这里是获取新旧节点的children, 如果有 children 那肯定是普通vnode, 而不是组件vnode, 因为 组件vnode 的 children 是 undefined
    const oldCh = oldVnode.children
    const ch = vnode.children
    // * 如果vnode上定义了data 并且 是一个可挂载的节点, 就会执行 update 钩子
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) {
      // ? 如果没有 text 就执行这里的逻辑
      if (isDef(oldCh) && isDef(ch)) {
        // * 同时存在新旧 children 并且他们不等, 那就会执行 updateChildren方法, 实际上是在递归的去做 patchVnode 这个流程
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // * 如果新 vnode 有 children
        if (process.env.NODE_ENV !== 'production') {
          // * 开发环境排除children中重复的key值, 如果有重复就直接报错 
          checkDuplicateKeys(ch)
        }
        // * 如果 新的节点没有定义text, 但是旧的节点有text, 那么久会将老的dom节点下的所有节点都替换成'', 就是变成一个空的节点
        // * (这里的elm看起来像是新的dom, 实际上他是老的, 只不过暂时把新的也指向了老的)
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // * 只有老的节点有children, 而新的节点没有children, 那么就要把老的给删了
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // * 如果又没有老的, 也没有新的, 并且新的没有定义text, 老的定义了text, 那么久要把老的text置为空
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // ? 如果他们两个的text不同, 则执行这里的逻辑, 把新的text值赋给老的text
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      // * 在这里会调用 postpatch 钩子
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    // * 这里的queue在之前子组件的初始化过程中，会不断的插入内容，并且是一个深度递归，先子后父的过程，最底下的儿子的一些东西会在最前面，是一个数组
    // * 执行这个insert方法的时候，就会调用mounted周期，传入的是子组件的实例
    // * 也就是说，儿子的mounted会比爹先执行，如果同时初始化一个儿子嵌套儿子嵌套儿子的组件，同时使用了eventBus进行一些调用，需要注意儿子组件的mounted周期，会比他的父亲先执行
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue
    } else {
      for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
      }
    }
  }

  let hydrationBailed = false
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  const isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key')

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    let i
    const { tag, data, children } = vnode
    inVPre = inVPre || (data && data.pre)
    vnode.elm = elm

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true
      return true
    }
    // assert node match
    if (process.env.NODE_ENV !== 'production') {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */)
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue)
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue)
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true
                console.warn('Parent: ', elm)
                console.warn('server innerHTML: ', i)
                console.warn('client innerHTML: ', elm.innerHTML)
              }
              return false
            }
          } else {
            // iterate and compare children lists
            let childrenMatch = true
            let childNode = elm.firstChild
            for (let i = 0; i < children.length; i++) {
              if (!childNode || !hydrate(childNode, children[i], insertedVnodeQueue, inVPre)) {
                childrenMatch = false
                break
              }
              childNode = childNode.nextSibling
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true
                console.warn('Parent: ', elm)
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children)
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        let fullInvoke = false
        for (const key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true
            invokeCreateHooks(vnode, insertedVnodeQueue)
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class'])
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text
    }
    return true
  }

  function assertNodeMatch (node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || (
        !isUnknownElement(vnode, inVPre) &&
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  // * 当柯里化之后，返回的这个patch，执行这个patch函数的时候，平台差异化的东西，都已经在之前就磨平了
  // * 不管是weex还是web，都是使用这四个参数，而nodeOps和modules的差异，在闭包的最外层函数上，已经处理完了
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    // * 如果vnode不存在
    // * 如果vnode和oldVnode都不存在，则直接返回
    // * 这是销毁的时候的逻辑，首次渲染并不会执行
    if (isUndef(vnode)) {
      // * 如果之前的vnode存在，那么久执行invokeDestroyHook，销毁之前的Vnode
      // * 在$destroy中，执行销毁逻辑，将vnode传递为null
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    // * 该变量表示是否初始化patch, 默认为false
    // * 这两个也是为了后面用insert钩子使用
    let isInitialPatch = false
    const insertedVnodeQueue = []

    // * 第一次的时候oldVnode指向外层挂载el，一般是div#app
    // * 子组件创建的时候，oldVnode是undefined，因此进入
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      // * 用于判断oldVnode是不是一个真实dom，显然初次加载的时候,oldVnode是一个真实DOM
      // * 当组件更新的时候, 重新执行__patch__方法时，传入的oldVnode和vnode都是 virtualDOM, 显然这里是false
      const isRealElement = isDef(oldVnode.nodeType)
      // * sameVnode方法用于对 oldVnode 和 vnode作对比, 判断是走哪个逻辑
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // ? 如果他们是相同的vnode, 那就会执行 patchVnode 这个方法
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        // ? 如果新旧节点不同, 那就分成三个步骤: ①创建新的节点 ②更新父的占位符节点 ③删除旧的节点
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            // * 服务端渲染(SSR)才会进来
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          // * hydrating是false，因此也不会进来
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // * 所以初次渲染，直接走到这里
          // * 将真实的DOM转换为一个Virtual DOM
          // * 同时以后通过oldVnode.elm可以直接拿到该VNode对应的Real DOM
          oldVnode = emptyNodeAt(oldVnode)
        }

        // ? ①创建新的节点
        // ? 首先通过旧节点的dom, 拿到父亲的dom节点
        // replacing existing element
        // * 初次渲染的时候，这个elm，就是vue首次挂载的时候选择那个#app
        const oldElm = oldVnode.elm
        // * 这个parentNode就是body
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm) // * nextSibling 返回其父节点的 childNodes 列表中紧跟在其后面的节点, 也就是他的下一个兄弟节点
        )

        // update parent placeholder node element, recursively
        // * 首先初次渲染时这里没有父节点
        // * 这里的 vnode 是一个 渲染vnode, 也就是组件的根 vnode, vnode.parent 是一个占位符节点
        if (isDef(vnode.parent)) {
          // * 如果能拿到占位符节点, 就将它定义为祖先, 用 ancestor 保存
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode) // * 判断 vnode 是否是可挂载的
          while (ancestor) {
            // * cbs 中是一些生命周期的回调函数
            // * 首先执行destroy这个钩子
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            // * 将占位符节点的 elm 指向新的 elm, 这个 vnode.elm 是在前面创建新节点的时候拿到的
            // TODO 这里是做一个更新, 因为新的dom已经发生了变化, 他的引用也要相应的变化, 指向新的节点去
            ancestor.elm = vnode.elm
            if (patchable) {
              // * 如果当前 vnode 是一个可挂载的 vnode, 就会执行下面一系列的钩子函数
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor)
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]()
                }
              }
            } else {
              registerRef(ancestor)
            }
            // * 然后向上递归寻找, 如果这个组件既是一个占位符节点又是一个渲染Vnode(比如说一个组件的根节点是引用的另一个组件, 比如说a-card), 他就满足这种情况
            // * 接下来他会一直往上找, 直到找一个真正的占位符节点, 对他所有的parent节点都做上面的更新, 直到找不到为止
            ancestor = ancestor.parent
          }
        }

        // destroy old node 销毁旧的节点
        // * 因为新创建了一个节点，而之前还有一个旧的节点，这里就是删除旧的节点, 如果不删除就两个都存在了, 因此要把旧的节点给删掉
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    // * 这里就是调用了一些钩子函数，之后在看
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}
