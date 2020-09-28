/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      // * 如果没有el并且是在生产环境，则抛出异常，返回一个创建的div，否则返回挂载的el对象
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    // * 如果el不是字符串，则直接返回el
    // * 使用flow限制只能是字符串或者是一个dom对象，在编译阶段就避免了其他类型，因此这里可以直接返回
    return el
  }
}
