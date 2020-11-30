/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index' // 下面所有的
import platformModules from 'web/runtime/modules/index'  // 同样是下面所有的, 这里是和平台相关的modules

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

// * patch方法调用createPatchFunction返回的是一个函数
// * 传入的两个参数，nodeOps和modules都是和平台相关的，web和weex有不同的处理方式
// * 通过这种叫函数柯里化(curry): 只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。
// * 如果我们自己去写patch方法，而不用柯里化的技巧，我们就需要使用大量的判断，来分析不同的平台使用不同的方法。
// * modules也是在不同的case做不同的事情，也是分开的
// * 这一步过后，返回需要的patch，都已经没有平台差异化了，有差异化的参数，只是这两个nodeOps和modules
export const patch: Function = createPatchFunction({ nodeOps, modules })
