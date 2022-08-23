/*!
 * Vue.js v2.6.12
 * (c) 2014-2022 Evan You
 * Released under the MIT License.
 */
/*  */

const emptyObject = Object.freeze({});

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive.
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString;

function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  const n = parseFloat(String(val)); // ? 如果不是数字或者不是字符串数字，都会返回NaN通不过第一个判断
  // * isFinite用于判断目标是不是一个有限值
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  const n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  const map = Object.create(null);
  const list = str.split(',');
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 */
const isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if an attribute is a reserved attribute.
 */
const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array.
 */
function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty; // * 返回一个boolean值表明自身属性中是否会有目标键
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  const cache = Object.create(null); // * 创建一个空数组
  return (function cachedFn (str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g;
const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
});

/**
 * Capitalize a string.
 */
const capitalize = cached((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cached((str) => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
});

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    const l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length;
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

const bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  let i = list.length - start;
  const ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  const res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
const no = (a, b, c) => false;

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
const identity = (_) => _;

/**
 * Generate a string containing static keys from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) return true
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a);
      const isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
function looseIndexOf (arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  let called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

const SSR_ATTR = 'data-server-rendered';

const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

/*  */



var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  const c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
// * source 属性返回一个值为当前正则表达式对象的模式文本的字符串，该字符串不会包含正则字面量两边的斜杠以及任何的标志字符。
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`);
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.');
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

// can we use __proto__?
const hasProto = '__proto__' in {};

// Browser environment sniffing
// * inBrowser判断是否是在浏览器中
const inBrowser = typeof window !== 'undefined';
const inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
const weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
const UA = inBrowser && window.navigator.userAgent.toLowerCase();
const isIE = UA && /msie|trident/.test(UA);
const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
const isEdge = UA && UA.indexOf('edge/') > 0;
const isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
const isPhantomJS = UA && /phantomjs/.test(UA);
const isFF = UA && UA.match(/firefox\/(\d+)/);

// Firefox has a "watch" function on Object.prototype...
const nativeWatch = ({}).watch;

let supportsPassive = false;
if (inBrowser) {
  try {
    const opts = {};
    Object.defineProperty(opts, 'passive', ({
      get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
let _isServer;
const isServerRendering = () => {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
// * 用于检测浏览器是否支持一些原生方法如Proxy
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

const hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

let _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set   {
    
    constructor () {
      this.set = Object.create(null);
    }
    has (key) {
      return this.set[key] === true
    }
    add (key) {
      this.set[key] = true;
    }
    clear () {
      this.set = Object.create(null);
    }
  };
}

/*  */

let warn = noop;
let tip = noop;
let generateComponentTrace = (noop); // work around flow check
let formatComponentName = (noop);

{
  const hasConsole = typeof console !== 'undefined';
  const classifyRE = /(?:^|[-_])(\w)/g;
  const classify = str => str
    .replace(classifyRE, c => c.toUpperCase())
    .replace(/[-_]/g, '');

  warn = (msg, vm) => {
    const trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg}${trace}`);
    }
  };

  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = (vm, includeFile) => {
    if (vm.$root === vm) {
      return '<Root>'
    }
    const options = typeof vm === 'function' && vm.cid != null
      ? vm.options
      : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm;
    let name = options.name || options._componentTag;
    const file = options.__file;
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : '')
    )
  };

  const repeat = (str, n) => {
    let res = '';
    while (n) {
      if (n % 2 === 1) res += str;
      if (n > 1) str += str;
      n >>= 1;
    }
    return res
  };

  generateComponentTrace = vm => {
    if (vm._isVue && vm.$parent) {
      const tree = [];
      let currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map((vm, i) => `${
          i === 0 ? '---> ' : repeat(' ', 5 + i * 2)
        }${
          Array.isArray(vm)
            ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)`
            : formatComponentName(vm)
        }`)
        .join('\n')
    } else {
      return `\n\n(found in ${formatComponentName(vm)})`
    }
  };
}

/*  */

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
class Dep {
  // * dep类主要的目的就是建立数据和watcher之间的桥梁
  
  
   // * subs是一个订阅数据变化的watcher集合

  constructor () {
    this.id = uid++;
    this.subs = [];
  }

  addSub (sub) {
    this.subs.push(sub);
  }

  removeSub (sub) {
    remove(this.subs, sub);
  }

  depend () {
    if (Dep.target) {
      // * 如果存在target, 这个target就是watcher, 那么就会使用watcher.addDep(this)
      Dep.target.addDep(this);
    }
  }

  notify () {
    // stabilize the subscriber list first
    // * 这是一层简单的深拷贝
    const subs = this.subs.slice();
    if ( !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      // * 如果config.async为false, 就为订阅者排序
      subs.sort((a, b) => a.id - b.id);
    }
    // * 遍历所有的订阅者，为他们进行更新
    for (let i = 0, l = subs.length; i < l; i++) {
      // * subs中的数据都是watcher的实例, 所以subs[i].update()就是Watcher类中的update
      subs[i].update();
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
// * watcher栈
const targetStack = [];

// * 在pushTarget执行的时候将target这个watcher push到栈中
// * 在执行popTarget的时候，在将刚刚push到栈中的watcher 取出来
function pushTarget (target) {
  // * 将target(watcher) push到这个targetStack中
  targetStack.push(target);
  // * 将这个target给Dep.target
  Dep.target = target;
}

function popTarget () {
  // * 从栈中出来
  targetStack.pop();
  // * 将watcher栈的最顶上的元素赋值给Dep.target
  // * 也就是说要在popTarget的时候去拿到上一次push到watcher栈里面的东西
  /* 
    ! 为什么需要这样做? 主要是考虑到嵌套组件的渲染过程, 组件渲染会执行mountComponent这个东西，并且是先父后子，父组件mountComponet完成后执行get方法就会执行pushTarget
    ! 并且当儿子从mountComponent执行到pushTarget的时候，就会发现传入的target就是儿子的渲染watcher，在后面的过程中，Dep.target都会保持是他自己的渲染watcher, 直到儿子的渲染watcher走完了
    ! 然后在执行popTarget的时候，又会将这个取出来，再次赋值给Dep.target, 巧妙的利用栈结构来保持当前使用的Dep.target在儿子执行完之后，又恢复到父亲的Dep.target这个状态
  */
  Dep.target = targetStack[targetStack.length - 1];
}

/*  */

// * 此处为Vue的Virtual DOM定义的位置
// * 这个VNode实际上是棵树
// * 看起来他很多，但实际上比真实的dom，代价要小很多
class VNode {
   // * 当前节点的标签名
   // * data 当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型。
   // * children子节点
   // * 节点的文本
   // * 当前虚拟节点所对应的真实DOM节点
   // * 节点的命名空间
   // rendered in this component's scope // * 编译作用域
   // * key值，用于标记这一个VNode
  
   // component instance
   // component placeholder node

  // strictly internal
   // contains raw HTML? (server only)
   // hoisted static node
   // necessary for enter transition check
   // empty comment placeholder?
   // is a cloned node?
   // is a v-once node?
   // async component factory function
  
  
  
   // real context vm for functional nodes
   // for SSR caching
   // used to store functional render context for devtools
   // functional scope id support

  constructor (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context; // * 所谓上下文就是当前vue实例, 如果是组件就是组件实例
    this.fnContext = undefined; // * 函数式组件的作用域
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key; // * 节点的key属性，被当做节点的标志，用以优化
    this.componentOptions = componentOptions; // * 组件的options选项
    this.componentInstance = undefined; // * 当前节点对应的组件的实例
    this.parent = undefined; // * 当前节点的父节点
    this.raw = false; // * 是否为原生HTML或只是普通文本，innerHTML的时候为true， textCOntent的时候为false
    this.isStatic = false; // * 是否为静态节点
    this.isRootInsert = true; // * 是否作为根节点插入
    this.isComment = false; // * 是否是一个注释节点, 这个意思是就是说两边带了<-- -->这种
    this.isCloned = false; // * 是否是一个克隆节点
    this.isOnce = false; // * 是否存在v-once指令
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child () {
    return this.componentInstance
  }
}
// * 用于创建一个空的VNode
const createEmptyVNode = (text = '') => {
  // * 新建一个vnode实例，不传递任何参数，constructor中的参数设置除默认的之外，都是undefined
  const node = new VNode();
  // * 将text设置为传入的值，如果没有，就是空字符串
  node.text = text;
  // * isComment设置为true
  node.isComment = true;
  // * 这个node实际上就是一个注释节点
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
// * 将当前节点的所有内容都复制给一个新的节点
function cloneVNode (vnode) {
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
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

const arrayProto = Array.prototype;
// * Object.create(obj)是使用现有对象来提供新创建对象的__proto__, 也就是说arrayMethods.__proto__ = arrayProto
const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method];
  // * 这个 original 代表的是数组原型上原来的 push、 pop 等方法
  // * 改写原型上的方法，把它添加到 arrayMethods 上
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args); // * 首先拿到原始方法去调用一次, 拿到一个结果
    const ob = this.__ob__; // * 拿到数组对应的 __ob__(所有执行过Observer构造函数的都有__ob__)
    let inserted; // * 定义了一个临时变量
    switch (method) {
      case 'push':
      case 'unshift':
        // * 如果是 push 或者 unshift 就是往数组最后或者最前面插入值的方法, 就把 inserted 的值置为 数组方法参数值
        inserted = args;
        break
      case 'splice':
        // * 如果是 splice 那么这个inserted 就是 参数数组的第三个值, 也就是插入或者改变的值
        inserted = args.slice(2);
        break
    }
    if (inserted) ob.observeArray(inserted); // * 对参数数组中的每一项添加一次响应式(当然, 这一项首先得是 Object)
    // notify change
    // * 通知订阅者更新
    ob.dep.notify();
    return result
  });
});

/*  */

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
let shouldObserve = true;

function toggleObserving (value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
class Observer {
  
  
   // number of vms that have this object as root $data

  constructor (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    // * def方法为value对象下的'__ob__'使用Object.defineproperty(value, '__ob__', {value: val(这个val就是this), enumerable: !!enumerable(此处没有传递，因此最后为false), writable: true, configurable: true})
    // * 总的来说就是增加value.__ob__, 并且属性值指向当前实例 然后添加了一些属性, 默认为不可枚举
    // * 主要是为了方便相同组件的data或者props有一次进入initState中，然后进入observe方法，对已经监听过的对象，就不用再来重新设置监听了，直接使用value.__ob__就可以了
    // ? 至于为什么要使用Object.defineProperty而不是直接使用value.__ob__ = this, 后面再看
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      // * value是一个数组
      if (hasProto) {
        // * 浏览器上有原型，因此非服务端渲染, 就会 使用这个 protoAugment
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      // * 这个方法主要是当value是一个数组的时候，将value下面的每一个成员递归观察起来,也就是执行observe(value[i])
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      // * 到这里，就解决了上面的问题，为什么要用Object.defineProperty来添加value.__ob__而不是直接使用value.__ob__ = this
      // * 如果直接将this赋值，那么value.__ob__也会执行defineReactive这个方法
      defineReactive(obj, keys[i]);
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      // * 也就是说数组添加响应式，只针对数组下面是一个对象的条目，如果数组的成员是值类型就不会添加响应式
      observe(items[i]);
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  // ! 这里虽然将所有数组的__proto__都修改为了 src, 这个src是只有'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse' 这7个方法的对象
  // ! 但是 src也就是 arrayMethods 创建的时候, 这个对象的__proto__就已经指向了Array.prototype, 因此, 尽管响应式数组的第一层方法已经改变，但其他所有的方法，都还在第二层__proto__上面
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
// * observe接受两个参数，第一个是value，也就是需要添加监听的对象, 任意类型都可以，第二个是一个布尔值，表明是不是根数据
function observe (value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    // * 在这里先判断需要添加的数据是否不是一个Object或者说是一个VNode，满足一个就直接返回
    // * 所以说对于要观测的value，至少要是一个对象类型，并且不能是VNode
    return
  }
  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // * shouldObserve用于控制对象是否需要添加监听, isServerRendering表示是否为服务端渲染, 并且监听对象必须要是一个数组或者一个对象(toString()后为[object object]这种)
    // * 最后还要判断他不是一个Vue实例，Vue实例的isVue为true
    // ! Observer实际上被定义为一个Class, 执行new Observer的时候就会执行下面的构造函数
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  const dep = new Dep();

  // * Object.getOwnPropertyDescriptor该方法返回的是指定对象属性上的描述符
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    // * 如果该属性存在，但是configurable为false, 那么就直接返回，因为property.configurable为false表示该属性不可修改
    // * 这种一般是主动设置，或者使用Object.freeze方法，冻结对象， 也可以使用Object.seal()将目标对象改为不可扩展, configurable设置为false
    // * 也就是凡是存在一个属性是不可配置的, 就不会添加监听了, 会直接返回

    // ! Object.freeze冻结整个对象，整个对象不能添加也不能删除并且不能修改原有的属性, 
    // ! 而Object.seal() 是封闭原有对象, 不能添加属性, 不能删除属性，但是可以修改原来存在的属性，但是不能使用Object.defineProperty设置访问属性
    return
  }

  // cater for pre-defined getter/setters
  // * 直接获取对象属性配置上的setter和getter属性
  const getter = property && property.get;
  const setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    // * 如果满足没有getter或者存在setter并且参数只传了两个那么就会将obj[key]赋值给val暂存起来
    val = obj[key];
  }

  // ? childOb是对val再一次递归观察, 这里如果发现 给对象添加响应式的 那一项 同样是一个对象
  // ? 就会执行 observe(val) 因为这个函数只有当接收的对象是一个Object, 并且不是一个VNode才会继续下去
  // ? 执行这个函数的时候就会去执行 Observe 类的构造函数, 然后就会触发 defineReactive 或者 observeArray
  let childOb = !shallow && observe(val);
  // * 因此，data下面定义的数据无论是对象还是数组，最终都会深入到最底下一层，去添加观察者，将整个对象化为一个响应式对象
  // * 所谓响应式对象，就是在对data下的对象或者数组，从上到下所有的属性都添加getter方法和setter方法
  // * 也就是获取值的时候触发getter, 设置值的时候触发setter
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // ! getter主要是 为了做依赖收集的事情
      /* 
        ! 总的来说，这个依赖收集，就是在render触发getter之后，会有一个当前正在计算的watcher(new Watcher的时候生成的)
        ! 然后在这里把watcher订阅到数据变化中, 通过dep.depend, 调用当前watcher的addDep, addDep会执行addSub
        ! 也就是当某个数据在触发getter进行依赖收集，就是收集当前正在计算的watcher，然后通过一通操作，把它(订阅者)push到watcher集合subs中
        ! 这个watcher(订阅者)在数据变化的时候，触发setter会通知订阅者做一些其他操作

        ! 换句话说，如果在Vue的代码中，将依赖收集也就是 dep.depend() 这一步给注释掉，那么响应式对象就不会做依赖收集, 
        !在 watcher 集合 subs 中也不会存在一个需要更新watcher, 那么触发setter的时候, 这个watcher也就不会执行update了

        ! 同时 Vue.set() 的触发 最终也是使用 ob.dep.notify() 来更新 subs 下面的所有watchers
      */
      // * 首先是拿到getter, 然后使用getter做计算，当然，没有getter就直接拿到这个值。毕竟getter属性主要是为了拿这个值
      const value = getter ? getter.call(obj) : val;
      // TODO 下面就是依赖收集的过程
      if (Dep.target) {
        // TODO Dep的target就是Dep类的一个全局watcher, 是一个可选的静态属性
        // TODO Dep这个类主要是为了让数据和watcher之间建立一座桥梁
        dep.depend();
        if (childOb) {
          // * 如果子value是一个对象, 就会进来
          // ! 执行dep.depend() 去收集依赖
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // ! setter主要是为了做派发更新
      // ! 在触发响应式对象成员更新的时候就会触发set方法，到最后执行 dep.notify() 就是在做通知，可以更新了
      // * 首先会先拿到原来的值
      const value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      // * 然后将新的值和旧的值作对比，如果他们相等或者新的值立即发生变化并且旧的值被取代，都会立即返回
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ( customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      // * 如果原来的对象上面存在getter但是没有setter就直接返回
      if (getter && !setter) return
      if (setter) {
        // * 这两个操作都是将新的值给赋值给旧的值
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      // * 如果新的值使用一个对象，那么就会触发observe将新的值变成一个响应式的值
      childOb = !shallow && observe(newVal);
      // ! dep.notify()就是派发更新的过程
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  // * set函数接收三个参数，第一个可以是数组也可以是Object，第二参数是任意类型，第三个参数也是任意类型
  if (
    (isUndef(target) || isPrimitive(target))
  ) {
    // * 第一个参数如果是基础类型或者是undefined, 那么就会有一个警告，因为对于基础类型或者不传入第一个参数，这个方法都没有任何意义
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target)}`);
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // ? isValidArrayIndex 确保 key 是一个大于等于0的整数数字
    target.length = Math.max(target.length, key); // * 首先修改数组的长度，他的长度取决于key和长度哪个更大，如果key更大，就说明在新增值
    target.splice(key, 1, val); // * 然后将这个值直接插入到 key 这个 index 的后面, 或者修改该 index 的 值, 这种方式可以触发重新渲染
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    // * 首先判断key值是否存在于目标对象中，如果存在，那么使用target[key] = val 这种方式以及可以触发重新渲染了
    target[key] = val;
    return val
  }
  const ob = (target).__ob__; // * 否则就在此处拿到taget.__ob__属性
  if (target._isVue || (ob && ob.vmCount)) {
    // * 如果target是一个Vue实例，或者ob上面有vmCount(有 vmCount 表示target是一个root data 也就是说是我们直接定义在 data 下面的)
    // * 这两种条件满足任何一个都不行, 我们要避免对Vue实例或者root data 做Vue.set()
     warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  if (!ob) {
    // * 如果没有ob，也就是说 target 并不是一个响应式对象, 那么作为普通对象, 直接赋值就可以了
    target[key] = val;
    return val
  }
  // * 如果 target 是观测值, 这里将新的值也变成一个响应式对象
  defineReactive(ob.value, key, val);
  // * 手动调用 ob.dep.notify(), 也就是对所有的 watcher 队列中的内容执行update
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  // * 通过这个方法去删除一个对象或者数组上的成员，也可以触发依赖更新的派发
  if (
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target)}`);
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  const ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies; // * Object.create(null) 是一个空对象

/**
 * Options with restrictions
 */
{
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) return to
  let key, toVal, fromVal;

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from);

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal;
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
       warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  // * 如果childVal不存在，直接就返回parentVal
  // * 如果childVal存在且parentVal存在，则两个直接合并
  // * 如果childVal存在但parentVal不存在，则判断childVal是否为数组，如果是，则直接res就是childVal，如果不是，则将其添加到一个空数组的第一个
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal;
  // * 处理res，这个res是一个Array<Function>
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  // * 去重,防止儿子和爹合并的时候产生了重复的hook
  const res = [];
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(hook => {
  // * 这里表示为strats中不同的hook都分配mergeHook 
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal,
  childVal,
  vm,
  key
) {
  // * 在这个合并策略中，会先构造一个parentVal
  // * 这个Object.create()方法，会把传入的对象，挂载新的对象的原型上面
  // * 静态类型合并比如说components, directive和filter之类的属性合并, 会执行这个合并策略, 将一些如keepalive之类的静态属性，添加到合并对象options的原型上
  const res = Object.create(parentVal || null);
  if (childVal) {
     assertObjectType(key, childVal, vm);
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined;
  if (childVal === nativeWatch) childVal = undefined;
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) return childVal
  const ret = {};
  extend(ret, parentVal);
  for (const key in childVal) {
    let parent = ret[key];
    const child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal,
  childVal,
  vm,
  key
) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) return childVal
  const ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) extend(ret, childVal);
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
const defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (const key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName (name) {
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    );
  }
  // * 这里说明使用了保留标签或者内建标签当做Component使用
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    );
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  const props = options.props;
  if (!props) return
  const res = {};
  let i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    );
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  const inject = options.inject;
  if (!inject) return
  const normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    );
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  const dirs = options.directives;
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

function assertObjectType (name, value, vm) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
      `but got ${toRawType(value)}.`,
      vm
    );
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  {
    // * 对组件定义做了一层校验，校验是否使用不规则标签，或者使用内建标签或保留标签做为组件的占位符
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  // * 一通序列化操作
  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  // * 这个_base指代的是Vue构造函数本身，在initGlobalApi的时候加入到Vue构造函数的options上，若是组件的options上存在_base，那么就说明这个组件的options已经合并了构造函数的options
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }
    if (child.mixins) {
      // * 这里的mixins如果存在，就会遍历mixins中定义的对象，然后递归合并options
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }
  
  // * 这个空对象就是用来作为最后返回的基本options
  const options = {};
  let key;
  // * 首先遍历parent中的所有key
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    // * 如果parent上没有这个key就再次调用mergeField
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    // * strats在前面执行的时候，上面就通过不同的key添加了很多合并策略
    // * defaultStrat表示有儿子用儿子，没有儿子用爹的一种合并策略
    const strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  // * 这里的options是vm实例上的options，在初始化globalAPI的时候，经历过一次合并，Vue的options上面继承了这个东西,所以下面寻找的都是执行Vue[type]传入的definition
  // * 这个definition合并过Vue构造函数
  // * 因此这里返回的res，也是一个继承了Vue构造函数的一个构造器
  const assets = options[type];
  // check local registration variations first
  // * 首先如果在options对应的type上面有id就直接返回了
  if (hasOwn(assets, id)) return assets[id]
  // * 将id转换为驼峰
  const camelizedId = camelize(id);
  // * 如果这个options上面有camlizedId在options对应的type上面也有，同样直接返回
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  // * 将camelizedId的首字母大写，也就是将驼峰的首字母转换为大写
  const PascalCaseId = capitalize(camelizedId);
  // * 如果options上面有PascalCaseId同样直接返回对应的PascalCaseId
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  // * 上面的都找不到，就去原型上面找
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ( warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */



function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  const prop = propOptions[key];
  const absent = !hasOwn(propsData, key);
  let value = propsData[key];
  // boolean casting
  const booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      const stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ( isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  let type = prop.type;
  let valid = !type || type === true;
  const expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (let i = 0; i < type.length && !valid; i++) {
      const assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    );
    return
  }
  const validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  let valid;
  const expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    const t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid,
    expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (let i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  let message = `Invalid prop: type check failed for prop "${name}".` +
    ` Expected ${expectedTypes.map(capitalize).join(', ')}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  // check if we need to specify expected value
  if (
    expectedTypes.length === 1 &&
    isExplicable(expectedType) &&
    isExplicable(typeof value) &&
    !isBoolean(expectedType, receivedType)
  ) {
    message += ` with value ${styleValue(value, expectedType)}`;
  }
  message += `, got ${receivedType} `;
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += `with value ${styleValue(value, receivedType)}.`;
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return `"${value}"`
  } else if (type === 'Number') {
    return `${Number(value)}`
  } else {
    return `${value}`
  }
}

const EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
function isExplicable (value) {
  return EXPLICABLE_TYPES.some(elem => value.toLowerCase() === elem)
}

function isBoolean (...args) {
  return args.some(elem => elem.toLowerCase() === 'boolean')
}

/*  */

function handleError (err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();
  try {
    if (vm) {
      let cur = vm;
      while ((cur = cur.$parent)) {
        const hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
              const capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) return
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

/**
 * @param handler 生命周期函数
 * @param context vm实例
 * @param null
 * @param vm 当前实例
 * @param info 生命周期hook的名称 为`${名称} hook`
 */
function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  let res;
  try {
    // * 主要是执行该生命周期方法，通过args来判断，是否需要传递参数, 如果为null，则不需要传递任何参数，直接执行生命周期方法
    // * 同时处理一些抛错
    // * context代表的就是传入的vm实例，因此在组件中调用生命周期函数的时候，可以在内部使用this指向组件的全局vm
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`));
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  {
    warn(`Error in ${info}: "${err.toString()}"`, vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

/*  */

let isUsingMicroTask = false;

const callbacks = [];
let pending = false;

function flushCallbacks () {
  pending = false;
  // * 深拷贝 callbacks 数组第一层
  const copies = callbacks.slice(0);
  callbacks.length = 0; // * 清空callbacks数组
  for (let i = 0; i < copies.length; i++) {
    // * 将 callbacks 数组(备份版)遍历并执行一遍
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
// 但是，当在重新绘制之前更改状态时，它存在一些细微的问题
// （例如＃6813，由外向内的过渡）。
// 此外，在事件处理程序中使用（宏）任务会导致一些奇怪的行为
// 无法规避的代码（例如＃7109，＃7153，＃7546，＃7834，＃8109）。
// 因此，我们现在再次在各处使用微任务。
// 这种折衷的主要缺点是存在一些方案
// 微任务的优先级过高，并且在两者之间触发
// 顺序事件（例如，具有解决方法的＃4521，＃6690）
// 甚至在同一事件冒泡之间（＃6566）。
// * 抛弃了2.5宏任务+微任务的实现方式，改换微任务实现
let timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:

// nextTick行为利用了微任务队列，可以通过本机Promise.then或MutationObserver对其进行访问。
// MutationObserver具有更广泛的支持，但是当在触摸事件处理程序中触发时，它在iOS> = 9.3.3的UIWebView中严重错误。触发几次后，它将完全停止工作...
// 因此，如果本地Promise可用，我们将使用它：
/* istanbul ignore next, $flow-disable-line */
// * isNative表示浏览器原生支持, 这里首先要保证Promise可以使用，并且是原生支持的Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop); // * 如果是IOS环境, 那么就在最后使用setTimeout这种宏任务去直接执行一个空函数
  };
  isUsingMicroTask = true; // * 将是否使用微任务置为true
  // ? 如果以上Promise浏览器原生并不支持, 那么就会使用MutationObserver, 使用这个首先要排除IE，然后要判断IOS7.x版本下的MutationObserver
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks); // * 定义一个新的MutationObserver实例
  const textNode = document.createTextNode(String(counter)); // * 观察的DOM
  // * 观察的DOM为textNode, 观察DOM节点的  characterData  变化,  变化的时候, 就会执行 flushCallbacks

  // ? CharacterData 抽象接口（abstract interface）代表 Node 对象包含的字符。这是一个抽象接口，意味着没有 CharacterData 类型的对象。 
  // ? 它是在其他接口中被实现的，如 Text、Comment 或 ProcessingInstruction 这些非抽象接口。
  // ? 所以他监听的就是这个文本节点
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = () => {
    // * 取余
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  // ! 因此微任务函数的触发，就是依靠 counter 的变化去触发DOM节点上data的改变，data改变的同时, 就会触发flushCallbacks
  isUsingMicroTask = true; // * 只有使用MutationObserver来触发回调微任务, 才会将 isUsingMicroTask置为true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // * 如果上面两个都不支持, 就会使用setImmediate来执行flushCallbacks
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  // * 如果以上全部都不支持，就直接降级使用宏任务setTimeout来执行 flushCallbacks
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}
// * 以上种种，主要是为了根据环境，来确定使用的微任务函数具体是哪一个

/**
 * @params cb 传入的回调函数
 * @params ctx 指向当前vue组件的实例
 */
function nextTick (cb, ctx) {
  let _resolve;
  callbacks.push(() => {
    // * 使用try catch是为了不让回调函数的报错影响后续的执行
    if (cb) {
      try {
        cb.call(ctx); // * 执行传入的回调函数
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      // * 给Promise用的判断
      _resolve(ctx);
    }
  });
  if (!pending) {
    // * 只要没有进入过这里面, 那么pending一定是false
    pending = true;
    // * 执行微任务函数, 实际上就是执行上面的callbacks数组中所有的函数, 也就是执行传入的cb
    // * 当然, 微任务是一个异步回调, 也就是说，他会在下一个tick，去执行cb
    // * 所以每一次到这里，都不会立即执行，而是等待这一次收集完成，timerFunc中的回调函数触发，才会去执行其中的 callback 数组下所有的任务
    timerFunc();
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    // * 如果没有回调函数，但是存在Promise对象, 那么就会将Promise的resolve 赋值给 _resolve
    // * 不传递cb, 那么this.$nextTick就会变成一个Promise对象，那么就可以使用 this.$nextTick.then(() => {定义函数})
    return new Promise(resolve => {
      _resolve = resolve;
    })
  }
}

let mark;
let measure;

{
  const perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = tag => perf.mark(tag);
    measure = (name, startTag, endTag) => {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      // perf.clearMeasures(name)
    };
  }
}

/* not type checking this file because flow doesn't play well with Proxy */

let initProxy;

{
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );
  // * 返回以上以逗号隔开为键名的对象，所有的值都是true

  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    );
  };

  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    );
  };

  // * 检测浏览器是否支持Proxy
  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`);
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  const hasHandler = {
    has (target, key) {
      // * 如果元素key不在target中，则has 为false
      const has = key in target;
      // * 在allowedGlobals将全局方法都设置为了true
      // * 也就是说如果key是一个全局方法或者是一个私有方法，那么isAllowed就是true
      const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
      // * 如果既不是在target中，也不是一个全局方法或私有方法，那就直接抛错
      // * 这个报错实际上很常见，就是在data中没有定义，就开始使用并且该属性也不是vm上的私有属性
      // * 实际上Vue的警告都会在开发环境抛出来，生茶环境是看不到的
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key);
        else warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  const getHandler = {
    get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) warnReservedPrefix(target, key);
        else warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // * 如果浏览器支持Proxy
      // determine which proxy handler to use
      const options = vm.$options;
      // * Proxy主要是对对象访问做一个劫持，在此处handlers指向的是hasHandler
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
        // * 代理配置
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

const seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  let i, keys;
  const isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) _traverse(val[keys[i]], seen);
  }
}

/*  */

const normalizeEvent = cached((name) => {
  const passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  const once = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once ? name.slice(1) : name;
  const capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name,
    once,
    capture,
    passive
  }
});

function createFnInvoker (fns, vm) {
  function invoker () {
    const fns = invoker.fns;
    if (Array.isArray(fns)) {
      const cloned = fns.slice();
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`);
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove,
  createOnceHandler,
  vm
) {
  let name, def, cur, old, event;
  for (name in on) {
    def = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
       warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }
      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  let invoker;
  const oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  const propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  const res = {};
  const { attrs, props } = data;
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key);
      {
        const keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            `Prop "${keyInLowerCase}" is passed to component ` +
            `${formatComponentName(tag || Ctor)}, but the declared prop name is` +
            ` "${key}". ` +
            `Note that HTML attributes are case-insensitive and camelCased ` +
            `props need to use their kebab-case equivalents when using in-DOM ` +
            `templates. You should probably use "${altKey}" instead of "${key}".`
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

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
function simpleNormalizeChildren (children) {
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
function normalizeChildren (children) {
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
function isTextNode (node) {
  // * node.isComment是false才会返回true
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

// * normalizeArrayChildren比上面的normalizeChildren多做了很多次的处理，就是不仅仅只是一层的扁平化，而是递归的进行多次扁平化，然后都拍平到一个数组中
function normalizeArrayChildren (children, nestedIndex) {
  const res = [];
  let i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i]; // * current表示当前值
    // * isUndef()用于判断是不是null或者undefined，是则返回true
    // * 如果children[i],或者c是一个boolean值，则直接跳过当前循环
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1; // * lastIndex用于表示数组的最后一个下标
    last = res[lastIndex]; // * last用于标识最后处理的节点
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`);
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          // * 如果最后处理的节点和当前处理的第一个节点都是一个文本标签，那么就会将最后一个和第一个合并为同一个，同时删除第一个
          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
          c.shift();
        }
        // * 将cpush到结果数组中
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      // * 如果当前值是一个基础类型不是一个数组
      // * 同时上次处理的最后一个元素是一个文本标签
      if (isTextNode(last)) {
        // * 就会合并当前标签和上次处理的最后一个标签
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // * 这个说明C本身就是一个文本，所以直接转换为一个文本标签，毕竟在children内部，一般不会存在boolean、symbol、number，就算是这些，也会变为一个string，然后在制作成一个文本标签
        // * 就直接将当前值转换为一个文本标签，然后在push到res中
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      // * 最后就是正常情况的c，一个标准的VNode
      // * 判断当前值和最后一个值是不是一个文本标签
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        // * 如果是则直接上次处理的最后一个值和当前值合并
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // * 这里会对V-for之类的做一个处理
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) && // * c的标签不能是空值
          isUndef(c.key) && // * c的key没有值
          isDef(nestedIndex)) { // * 存在nestedIndex，否则不做处理
          c.key = `__vlist${nestedIndex}_${i}__`;
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function initProvide (vm) {
  const provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  const result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          );
        });
      }
    });
    toggleObserving(true);
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null);
    const keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // #6574 in case the inject object is observed...
      if (key === '__ob__') continue
      const provideKey = inject[key].from;
      let source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault;
        } else {
          warn(`Injection "${key}" not found`, vm);
        }
      }
    }
    return result
  }
}

/*  */



/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  if (!children || !children.length) {
    return {}
  }
  const slots = {};
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i];
    const data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot;
      const slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name];
    }
  }
  return slots
}

function isWhitespace (node) {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

/*  */

function normalizeScopedSlots (
  slots,
  normalSlots,
  prevSlots
) {
  let res;
  const hasNormalSlots = Object.keys(normalSlots).length > 0;
  const isStable = slots ? !!slots.$stable : !hasNormalSlots;
  const key = slots && slots.$key;
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {};
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(normalSlots, key, slots[key]);
      }
    }
  }
  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key);
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots)._normalized = res;
  }
  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  const normalized = function () {
    let res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res);
    return res && (
      res.length === 0 ||
      (res.length === 1 && res[0].isComment) // #9658
    ) ? undefined
      : res
  };
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  let ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      const iterator = val[Symbol.iterator]();
      let result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret)._isVList = true;
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  const scopedSlotFn = this.$scopedSlots[name];
  let nodes;
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      if ( !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        );
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    nodes = this.$slots[name] || fallback;
  }

  const target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

function isKeyNotMatch (expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInKeyCode,
  eventKeyName,
  builtInKeyName
) {
  const mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
       warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      let hash;
      for (const key in value) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          const type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        const camelizedKey = camelize(key);
        const hyphenatedKey = hyphenate(key);
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            const on = data.on || (data.on = {});
            on[`update:${key}`] = function ($event) {
              value[key] = $event;
            };
          }
        }
      }
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  const cached = this._staticTrees || (this._staticTrees = []);
  let tree = cached[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  );
  markStatic(tree, `__static__${index}`, false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
       warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      const on = data.on = data.on ? extend({}, data.on) : {};
      for (const key in value) {
        const existing = on[key];
        const ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data
}

/*  */

function resolveScopedSlots (
  fns, // see flow/vnode
  res,
  // the following are added in 2.6
  hasDynamicKeys,
  contentHashKey
) {
  res = res || { $stable: !hasDynamicKeys };
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i];
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }
      res[slot.key] = slot.fn;
    }
  }
  if (contentHashKey) {
    (res).$key = contentHashKey;
  }
  return res
}

/*  */

function bindDynamicKeys (baseObj, values) {
  for (let i = 0; i < values.length; i += 2) {
    const key = values[i];
    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if ( key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn(
        `Invalid value for dynamic directive argument (expected string or null): ${key}`,
        this
      );
    }
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
function prependModifier (value, symbol) {
  return typeof value === 'string' ? symbol + value : value
}

/*  */

function installRenderHelpers (target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

/*  */

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  const options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  let contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  const isCompiled = isTrue(options._compiled);
  const needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = () => {
    if (!this.$slots) {
      normalizeScopedSlots(
        data.scopedSlots,
        this.$slots = resolveSlots(children, parent)
      );
    }
    return this.$slots
  };

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  }));

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = (a, b, c, d) => {
      const vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode
    };
  } else {
    this._c = (a, b, c, d) => createElement(contextVm, a, b, c, d, needNormalization);
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  contextVm,
  children
) {
  const options = Ctor.options;
  const props = {};
  const propOptions = options.props;
  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) mergeProps(props, data.attrs);
    if (isDef(data.props)) mergeProps(props, data.props);
  }

  const renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  );

  const vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    const vnodes = normalizeChildren(vnode) || [];
    const res = new Array(vnodes.length);
    for (let i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  const clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone
}

function mergeProps (to, from) {
  for (const key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

// inline hooks to be invoked on component VNodes during patch
// * 这是每一个组件都会有的hook
const componentVNodeHooks = {
  init (vnode, hydrating) {
    // * 如果data下面有keepalive，则走下面的逻辑
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      // * 组件创建过程中，activeInstance就代表当前层级的vm实例，等__patch__执行完毕后，activeInstance就会清空变为null
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      // * 然后这里手动调用子组件实例上的$mount方法
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch (oldVnode, vnode) {
    const options = vnode.componentOptions;
    const child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert (vnode) {
    const { context, componentInstance } = vnode;
    if (!componentInstance._isMounted) {
      // * 执行完了insert，才会把_isMounted设置为true
      // * 也就是说，首次渲染，只会执行mounted，当再次去更新，重新渲染，才会执行updated
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy (vnode) {
    const { componentInstance } = vnode;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

// * hooksToMerge实际上就是[init, prepatch, insert, destroy]
const hooksToMerge = Object.keys(componentVNodeHooks);

/**
 * 
 * @param {*} Ctor // ! 是一个组件类型的类，也可以是函数，对象，也可以是空类型
 * @param {*} data // ! 使用一个VNodeData类型
 * @param {*} context // ! 也就是当前vm实例
 * @param {*} children // ! 儿子组件VNode
 * @param {*} tag // ! 标签
 */
function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  // * Ctor是一个必须参数，如果Ctor传入但是不存在，这里将直接返回
  // TODO 实际上这里的Ctor构造器，就是import组件的时候生成的
  // TODO Ctor经过vue-router之后，添加了较多属性，比如说beforeCreate，beforeDestroy等
  if (isUndef(Ctor)) {
    return
  }

  // * 由于前面在init合并过options，所以在这里通过context访问的$options._base就是Vue下的options的_base，也就是Vue
  const baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    // ! 全局注册状态下的Ctor是一个构造器(也就是一个函数，所以不满足)，typeOfCtor是function, 因此并不会进入这个逻辑
    // * 如果Ctor(constructor)是一个对象，那么就会使用Vue上的entend方法，将Ctor转换为一个新的构造器
    // * 实际上是将当前组件做了一次缓存
    // TODO 在这个extend中，会将Ctor和Vue的options做一次合并
    // ! 这是一个重点，组件的构造器，是继承自Vue的，基本上继承了Vue的所有能力
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  // * 如果这个构造器并没有返回一个函数，那么就会报一个错误，表示组件定义有问题, 因为异步组件本身就是一个构造器，而一般组件在上述过程中会转换为一个构造器，因此不是构造器就是上面的步骤报错了而没有执行完
  if (typeof Ctor !== 'function') {
    {
      warn(`Invalid Component definition: ${String(Ctor)}`, context);
    }
    return
  }

  // async component 异步工厂，也就是表示异步组件使用的是异步工厂模式
  let asyncFactory;
  // * 由于异步组件是一个工厂函数, 所以并不会有cid这种东西
  // * 这个isUndef(x:any): boolean返回一个布尔值，表明传入的参数是否为undefined或者null，满足其一，则为true否则就是false
  if (isUndef(Ctor.cid)) {
    // * 这里实际上相当于将Ctor备份了一遍
    asyncFactory = Ctor;
    // ? baseCtor就是Vue.$options._base
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
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

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // * 这里要对一些options重新计算，因为可能会被全局混入影响
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  // * 这里是v-model的问题，对v-model的判断
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  // * 将props处理为propsData
  const propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component 函数组件
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on; // * 对自定义事件的处理
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  // * 安装一些组件的钩子
  // * 之前在patch的过程中也有，在不同的阶段会执行不同的钩子
  // ! 这里也比较重要，组件的VNode的data上面有一些hook，这些hook都merge了通用的hook

  // TODO 一般情况下执行之前data只有一个on
  installComponentHooks(data);

  // return a placeholder vnode
  // * 最后就是使用处理过后的Ctor，和propsData等生成一个VNode, 前面的所有步骤，都是在对生成组件VNode的一些参数做处理
  const name = Ctor.options.name || tag;
  // * 当然这个组件的VNode会使用vue-component-开头做一个标识, 然后会传入data,然后第三四五个参数都是空
  // * 这里很重要，组件VNode初始化的时候，children都是空值, text和element也是空值
  // * 但是组件有一个componentOptions对象，这里面包含了他的Ctor(constructor), propsData, listeners(事件), tag和children
  // ! 最后就是组件的VNode没有children，但是多了componentOptions对象
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  );

  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent // activeInstance in lifecycle state
) {
  // * 这里的parent实际上是当前vm的一个实例
  const options = {
    _isComponent: true,
    _parentVnode: vnode, // * 占位符VNode
    parent
  };
  // check inline-template render functions 暂时先跳过该逻辑
  const inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  // * 这里的conponentOptions就是之前创建vnode的时候，传入的第三个参数，内部有Ctor(完全继承了一个Vue的组件的构造器), propsData, listeners, tag和children
  // * 所以这里执行Ctor的时候，实际上执行的就是之前在extends中定义的sub的构造函数，因为这个Ctor就是sub
  // * 因此这里直接就是相当于 Vue._init(options)
  // * options在这里传入的时候，一共有五个成员_isComponent, _parentVnode, parent, render, staticRenderFns
  // * 最后这里返回的是继承自初始化完成的组件vm的sub
  // TODO 通俗的说，执行完这个函数之后，返回的是初始化完成的子组件的vm实例
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data) {
  // * 这里就是遍历通用钩子，然后将通用钩子和当前的钩子做一次比较，如果不等，就会将通用钩子和当前钩子合并
  const hooks = data.hook || (data.hook = {});
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i];
    const existing = hooks[key];
    const toMerge = componentVNodeHooks[key];
    if (existing !== toMerge && !(existing && existing._merged)) {
      // * 这个合并的过程就是如果钩子中有了这个key，那就将通用的函数和钩子中的函数放在一起，先后顺序执行，然后将_merged设置为true表示已经合并过了
      // * 本质上就是让data上的hook里面有组件通用的钩子
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1 (f1, f2) {
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  const prop = (options.model && options.model.prop) || 'value';
  const event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
  const on = data.on || (data.on = {});
  const existing = on[event];
  const callback = data.model.callback;
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}

/*  */

const SIMPLE_NORMALIZE = 1;
const ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context, // * vm实例
  tag, // * 标签
  data, // * VNode的data
  children, // * 子节点
  normalizationType,
  alwaysNormalize
) {
  // * 如果data是一个数组，这个意思是data没有传，而数组表示的是第四个参数children
  // * isPrimitive用于判断参数是否属于 string, number, symbol, boolean 这四个类型
  // * 当data不存在的时候，就会将参数往前移动
  // * 由于第一个参数vm和最后一个参数alwaysNormalize是固定肯定会传入的，只有中间四个参数会有出入，因此这里少了一个data，就会将children和normalizationType往前移动一个位置，在把data设置为空
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  // * 这个isTrue只能用于判断Boolean，而不会把传入的值变成一个truely变量或者一个falsely变量进行判断
  if (isTrue(alwaysNormalize)) {
    // * true表示是自定义的render函数， false表示的是由template转换的render函数
    normalizationType = ALWAYS_NORMALIZE;
  }
  // * 参数在createElement中进行处理，当参数都处理完毕之后，在调用_createElement方法进行真正的创建
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  // * 先对data做了一层校验，表明data并不能是响应式的
  // * isDef用于判断参数是否存在(不是undefined也不是null)，如果存在则返回true，不存在则返回false
  // * 当把data编程响应式的时候，会给data添加一个_ob_这个属性
  // * 一旦有这个属性，就会报警告，因为不允许VNode的data是响应式的data
  if (isDef(data) && isDef((data).__ob__)) {
     warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // * 接着判断是否存在一个data.is
  // * data.is在component.is的时候，这个is就是标签上会有一个is属性，这个is属性会指向你自定义的某个标签，在这里，判断他是否存在，如果存在，就会将原来的标签替换为is指向的标签
  // * 主要是在一些固定的组件内，你只能使用原生标签，而不能使用自定义的组件，这个时候就需要is去做转换，这里就是is转换的位置
  if (isDef(data) && isDef(data.is)) {
    // * data.is存在，就会将标签的名称换为data.is
    tag = data.is;
  }
  // * 如果没有tag，也会返回一个空的VNode
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // * 对data的参数做一些校验，比如key不是一个基础类型，就会抛错
  if (
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      );
    }
  }
  // support single function children as default scoped slot
  // * 插槽相关，后期再继续看
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  // * 这里会判断，normalizationType的类型，如果是一个ALWAYS_NORMALIZE
  // * ALWAYS_NORMALIZE表示是自定义render
  // * 主要是将children变为一个一维数组，simpleNormalizeChildren仅扁平化第一层
  // * normalizeChildren递归扁平化所有层级，同时将连续的两个文本标签合并为一个，如果本身是一个非正常的标签，直接转换为文本标签
  if (normalizationType === ALWAYS_NORMALIZE) {
    // * 这里会对所有的children执行normalizeChildren
    // * 主要是有些时候children作为自定义的render，会只传递了一个text，而不是一个VNode，在这里，将会对children进行转化，转换为标准的VNode
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  let vnode, ns;
  if (typeof tag === 'string') {
    let Ctor;
    // * 如果在实例上存在$vnode并且$vnode.ns存在，那么ns就是实例上面$vnode的ns，如果不存在，则返回字符串类型的tag
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    // * isReservedTag用于判断tag是不是一个原生的保留标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      // * 如果data存在并且有一个带native修饰符的on事件，则直接抛错
      if ( isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        );
      }
      // * 然后这里实例化一个VNode
      // *  config.parsePlatformTagName检查tag是不是一个string，是就返回，不是则在编译阶段报错
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // * 在上面判断中，可以得到一个经历过component所有options并且合并了Vue构造函数的一个构造器
      // * 全局注册，就会走这里
      // component
      // * 组件VNode
      // * 如果这个tag是一个组件标签，虽然是string类型，但是也会走入这里
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      // * 如果是不认识的，就直接创建
      // * 也就是在开发过程中，如果你写了一个没有注册的组件，那么在element中，就会有一个纯粹的组件名的标签，而不会编译任何东西
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // * 局部注册
    // * 如果该标签直接就是一个导入的组件，直接进入此处，通过createComponent创建组件VNode
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode
    // * vnode存在
  } else if (isDef(vnode)) {
    // * 如果命名空间ns存在，那就执行apply
    if (isDef(ns)) applyNS(vnode, ns);
    if (isDef(data)) registerDeepBindings(data);
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i];
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender (vm) {
  // * 此处的vm指向Vue实例
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  const options = vm.$options;
  const parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  // * 以下两个方法，只有最后一个参数不一样，这个_c是给编译生成的render函数所使用的方法
  // * 但是这两个方法最终都会调用createElement()这个函数
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // * 这个vm.$createElement是给手写的render函数提供了一个创建VNode的方法
  // * 也就是createElement方法，详情见官方文档, 参数a表示标签， b代表一些配置，c是子节点的插值
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm);
    }, true);
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm);
    }, true);
  }
}

let currentRenderingInstance = null;

function renderMixin (Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };
  // * _render方法的定义，返回的是一个VNode
  Vue.prototype._render = function () {
    const vm = this; // * 依然是使用vm代替this
    // * 从$options中取出render和_parentVnode
    // * 在这里就会得到一个父级占位符_parentVnode
    const { render, _parentVnode } = vm.$options;
    // * 如果存在父节点
    // ! 插槽相关，先不慌
    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    // * 取出来之后赋值给vm.$vnode, 它实际上就是占位符的VNode，也就是父的VNode
    vm.$vnode = _parentVnode;
    // render self
    let vnode;
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      // * 利用render.call去触发render方法
      // * vm._renderProxy在生产环境下就是vm，也就是指向当前实例, 开发环境是一个Proxy对象，内部有一个has配置，用于检查是否在VNode上存在一些没有定义在data，并且也不是Vue的私有成员的，但是被使用了的情况，如果有则抛错
      // * renderProxy的定义也发生在initMixin的过程中
      // * 这个render.call实际上就是createElement的返回值
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, `render`);
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      // * 继续处理一些开发环境的错误，并且做了一些降级
      if ( vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e) {
          handleError(e, vm, `renderError`);
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    // * 如果Vnode是一个数组并且长度为1，那就把VNode的第一个取出来，将其赋值给自己，把自己变成一个对象
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      // * 这里是说如果VNode是一个数组并且，vnode并不继承自VNode，在这里就会抛错。
      // * 因为这里是在初始化render函数，所以这里渲染的VNode代表的是根节点，根节点只能有一个，在上面已经将单个根节点从数组中取出来变成了一个虚拟节点对象
      // * 所以到这里就是由于出现了两个极其以上的根节点，因此会抛错
      // * 这个VNode实际上就是一个VirtualDom，是通过createElement这个方法返回生成的
      if ( Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      // * 这里的意思是如果vnode不是一个VNode继承下来的，也就是说并不是一个虚拟节点，在这里，就执行createEmptyVNode来创建一个空的VirtualDom
      vnode = createEmptyVNode();
    }
    // set parent
    // * 最终会将渲染VNode的parent指向占位符_parentVnode, 这个占位符Vnode就是父的Vnode
    vnode.parent = _parentVnode;
    // * 将最后得到的vnode返回出去，这就是vm._render()方法返回的结果
    return vnode
  };
}

/*  */

function ensureCtor (comp, base) {
  // ? base就是Vue.$options._base，而Vue.$options._base = Vue
  // * 此处主要是保障不管是es模块还是通过CommonJS加载的模块，都可以正确的拿到一个component
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default;
  }
  // * 判断comp是不是一个对象，如果是一个对象，就通过Vue.extend(comp)返回一个构造器
  // * 当然本身是一个构造器就直接返回
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  const node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data, context, children, tag };
  // * 返回了一个空的注释节点
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    // * 异步组件加载，执行forceRender方法的时候，执行$forceUpdate又会重新回到这个方法，走到这里，就会发现上一次已经保留了resolved, 也就是这个异步组件的构造器
    // * 到此就直接返回异步组件的构造器
    return factory.resolved
  }
  // ! 上面都是高级异步组件的东西， 暂时先不急

  // * render的时候执行$createElement在该函数中执行createComponent然后创建组件，加载异步组件，进入此处，因此这个理的owner代表当前Vue实例的this
  const owner = currentRenderingInstance; // * currentRenderingInstance这个东西在render执行过程中，就变成了Vue实例的this, 
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // * 最开始是没有定义owners的，因此初始化加载的时候并不会进入这里面
    // already pending
    factory.owners.push(owner);
  }

  // ! loadingComp也是高级组件的东西
  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    // * 初始状态并没有owner这个东西，因此会进入此处中
    // * 如果有很多异步组件，下面的步骤只需要执行一次就可以了，剩下的都只需要走上面那个已经定义factory上的owners的步骤，往里面push一点东西就ok
    // * 因此这个factory.owners是一个数组，他会一直使用
    const owners = factory.owners = [owner];
    let sync = true;
    let timerLoading = null;
    let timerTimeout = null

    // * 组件销毁的时候移除owners数组中的owner, 也就是当前owner
    ;(owner).$on('hook:destroyed', () => remove(owners, owner));

    const forceRender = (renderCompleted) => {
      // * 遍历所有的owners也就是组件的this对象，让所有已经加载过的异步组件，都执行一次$forceUpdate()方法，强制更新一次
      // * 当执行vm._update的时候，又会去执行createComponent方法，又会进入到resolveAsyncComponent
      for (let i = 0, l = owners.length; i < l; i++) {
        (owners[i]).$forceUpdate();
      }

      if (renderCompleted) {
        // * 这里表示已经将异步组件加载完成，返回一个空的标签之后,就是一个true
        // * 清除两个定时器
        owners.length = 0;
        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    // * once通过闭包去返回一个函数，在返回的函数内部执行传入的参数，在闭包外层使用一个参数通过闭包不会清楚内部变量的特效控制在闭包内部是否执行传入的函数
    // * 这个resolve就是在异步组件加载完成后，生成一个注释节点后，执行的方法，res就是加载方法返回的一个包含了组件定义的options
    const resolve = once((res) => {
      // cache resolved
      // ? baseCtor就是Vue.$options._base
      // ? factory.resolved保留是异步组件的构造器
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      // * 执行resolve的时候外层函数已经执行过一次了，因此这里的sync是一个false，将会进入该判断，执行forceRender
      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });

    const reject = once(reason => {
       warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });
     // * 这个factory就会走异步加载的那个方法, 也就是普通异步加载时的方法, 返回值为异步组件的所有配置(指的是异步组件加载方法，而不是factory函数执行的返回值，该函数执行的返回值是一个空节点)
     // * 在使用Promise加载异步组件的时候, 执行factory就会进入Promise异步组件加载的then方法中, 然后执行() => import(xxx) 这种异步组件加载方法, 这里的res会返回一个promise对象
     // ! Vue做Promise异步组件，有一点就是为了配合webpack这个语法糖，对import方法做支持

     // * 高级异步组件，会提供组件加载延迟多久，然后加载中使用的组件，加载失败使用的组件，加载最高延迟时间timeOut，当timeOut结束之后，就会使用加载失败的组件
     // * 高级异步组件, 也会返回一个Object，但是，并不是Promise，因此没有then，也没有catch

     // TODO 高级异步组件的加载，会先进入注释节点，然后触发forceRender重新回到这个方法中，由于之前将loading设置为true过，因此会加载出loading组件
     // TODO 但是又触发forceRender 重新进入了该方法中，并不会影响之前loading的渲染，同时执行res.component.then(resolved, reject)的时候
     // TODO 在这个时候，就会存在一个factory.resolved，将会渲染之前定义的我们需要的高级异步组件
     // TODO 同时在上面的步骤中，如果第二次回到该方法中，还是没有factory.resolved，那么就会触发loading的倒计时和timeout的倒计时，当loading的异步倒计时开始后
     // TODO 就会加载loading组件，让timeout倒计时开始后，也就是走到了最后一步，直接加载timeout带来的errorComp这个失败状态下的组件
    const res = factory(resolve, reject);

    if (isObject(res)) {
      // * Promise方法加载异步组件会进入如下判断中
      // * isPromise用于判断参数是否定义，是否存在then和catch并且是一个function
      if (isPromise(res)) {
        // () => Promise
        // * 还是和一般异步组件加载一样，第一次factory是不存在resolved的
        if (isUndef(factory.resolved)) {
          // * 这里的then就是Promise.then方法，因此resolve就会触发,然后会给factory.resolved赋值，之后就和一般异步组件加载相同了, 通过一次forceUpdate重新进入到此处，在上面执行resolveAsyncComponent方法的时候，就会得到组件的构造器
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        // * res.component是加载的异步组件，并且是一个Promise
        // * 在这里又会执行resolve
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          // * 如果定义了res.error，就会给factory.errorComp通过ensureCtor方法，返回一个继承了Vue基础配置的一个error组件的构造器
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          // * 如果定义了loading，就会将loading时的组件，一样通过ensureCtor这个方法，转换为一个合并了Vue基本配置的一个构造器
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            // * 如果延迟时间已经是0了，那么factory.loading就会置为true
            // * 如果factory.loading是true, 那么第一次执行resolveAsyncComponent就不再是像之前一样返回一个注释节点，而是返回一个loadingComp也就是加载状态的组件去渲染
            factory.loading = true;
          } else {
            // * 如果设置了延迟时间，那么第一次执行resolveAsyncComponet执行过后还是undefined, 最后渲染一个注释节点，直到下面的setTimeOut执行完后, 就会通过loading为true
            // * 同时触发forceRender重新执行$forceUpdate重新进入此处，渲染一个loadingComp节点
            // * 而如果重新进入此处，并且存在factory.resolved, 就会渲染resolved了
            timerLoading = setTimeout(() => {
              timerLoading = null; // * 清除定时器，该定时器只执行一次
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          // * 如果上面的都走完了，就会执行下面的步骤，在timeout都走完了，还是没有factory.resolved，那么就会执行reject方法，这里会将factory.error置为true，然后最后渲染出error组件
          // * 一旦渲染了error就不会在去渲染resolved了
          timerTimeout = setTimeout(() => {
            timerTimeout = null;
            if (isUndef(factory.resolved)) {
              reject(
                 `timeout (${res.timeout}ms)`
                  
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    // * 异步组件在这里，没有loading也没有loadingComp，因此返回一个undefined
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

let target;

function add (event, fn) {
  target.$on(event, fn);
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function createOnceHandler (event, fn) {
  const _target = target;
  return function onceHandler () {
    const res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin (Vue) {
  const hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    const vm = this;
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    const vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    const vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn);
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    const vm = this;
    {
      const lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        );
      }
    }
    let cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      const args = toArray(arguments, 1);
      const info = `event handler for "${event}"`;
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm
  };
}

/*  */

let activeInstance = null;
let isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  // * 在组件渲染的过程中，之所以将vm作为activeInstance，就是因为组件是作为当前实例的儿子，因此，会把当前实例当成父级vm实例，保存下来
  const prevActiveInstance = activeInstance;
  activeInstance = vm;
  return () => {
    activeInstance = prevActiveInstance;
  }
}

function initLifecycle (vm) {
  //  * 建立父子关系
  // * 组件从VNode转换为real DOM的时候，执行以下内容就是在__patch__的过程中, 因此activeInstance就是当前vm实例
  const options = vm.$options;

  // locate first non-abstract parent
  // * 由于options合并过，因此这个options包含了Vue的options以及原来的五个成员，parent就代表当前层级的vm实例
  let parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    // * parent是当期实例vm，因为子组件的创建是基于当前组件的vm创建的
    // * 在这里会见将子组件的vmpush到parent的$children中
    // * 正因为如此，我们才可以在父亲中通过this.$children去操作子组件
    parent.$children.push(vm);
  }

  // * 在这里将parent也就是当前组件的vm，赋值给vm.$parent
  // * 所以才可以在子组件中通过this.$parent去直接操作父组件
  vm.$parent = parent;
  // * 在这里做一步判断，判断parent是否存在，如果不存在，说明当前组件就是顶级组件，那么当前组件vm实例的$root就是当前组件，否则就取父节点的$root
  vm.$root = parent ? parent.$root : vm;

  // * 初始化当前组件的$children和$refs
  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
  // * 到此为止，生命周期初始化完成
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    // * update是Vue的私有方法，他所做的事情，就是把VNode渲染为一个真实的DOM，它被调用的时机有两个，一个是首次渲染的时候，一个是数据更新的时候
    const vm = this; // * 当前组件的实例
    const prevEl = vm.$el; // * 指向真实DOM
    const prevVnode = vm._vnode; // * 上一次的VNode，作对比时使用。
    /* 以上三个变量在首次渲染的时候，都是空值，暂时用不上 */
    // * 子组件patch的时候执行这个，会将子组件的vm赋值给activeInstance
    // * js的执行是同步的，而组件的创建就是一个深度遍历的过程，在父亲创建的时候如果有组件的创建，就会在父亲patch的时候进入创建组件的部分，然后组件创建的时候内部还有，也会继续走进去，走到这里来，会将父亲的vm一级一级传下去
    const restoreActiveInstance = setActiveInstance(vm);
    // * 在这里将当前节点的vnode赋值给_vnode
    // * $vnode是一个占位符Vnode，而_vnode是一个渲染vnode负责渲染的，所谓占位符，也就是那个组件名字的标签，比如一个组件叫做HelloWorld, <hello-world />这就是一个占位符
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    // * 所以在除此渲染的时候这个prevVnode是空值, 这个判断会直接进去, 表明是初次渲染
    if (!prevVnode) {
      // initial render
      // * 子组件渲染的时候会再次调用patch，子组件创建的时候$el是undefined, vnode代表自己的虚拟dom， hydrating是false
      // * 首次执行__patch__的时候，第一个参数传入的是真实DOM, 第二个是渲染生成的vnode，后面两个都是false
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    // * 等待整个__patch__执行完了，才会执行setActiveInstance返回的那个闭包函数，将activeInstance设置为null
    // * 也就是说在整个__patch__的过程中，activeInstance都是vm实例
    // * 并且在这里并不一定是设置为空值，设置为空值是在最外层，而实际上，他应该恢复到上一级的实例
    // * 始终保持activeInstance和prevActiveInstance是一个父子关系 
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    // * 调取$forceUpdate的时候会去执行渲染watcher的update()
    // * 也就是会执行这个vm._update(vm._render(), hydrating), 去强制update一次
    const vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    // * 组件销毁会执行这个函数，也就是说在组件销毁之前，会先执行beforeDestroy
    const vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    const parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      // * dom的移除, 将父子关系移除
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    let i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    // * 通过将patch方法的第二个参数vnode传递为null，进入patch中一个递归销毁逻辑，递归的绝后
    vm.__patch__(vm._vnode, null);
    // * 销毁完了，就会执行destroyed
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    // * 取消挂载
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      // * 将该节点从VDOM树上面移除
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  // * 首先使用vm.$el将传入的el做一次缓存
  vm.$el = el;
  // * 如果本身就没有传入一个render函数，并且template也没有转换为一个render函数
  if (!vm.$options.render) {
    // * 首先创建一个空的虚拟节点
    vm.$options.render = createEmptyVNode;
    {
      /* istanbul ignore if */
      // * 在开发环境中抛出警告，如果定义了template并且template的第一个值不是#，定义了el或者执行mountComponent时候传入了el，则抛出警告
      // * 这个警告表明使用的runtime-only版本，但是又使用了template，而不是渲染函数render
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  // * 在此处执行beforeMount
  // * 和mounted不同的是，beforeMount这个钩子函数，是先父后子的
  // * 因为mountComponent的执行，是一层一层向内部执行的
  callHook(vm, 'beforeMount'); 

  let updateComponent;
  /* istanbul ignore if */
  // * 如果开发环境配置了performance，则使用mark = window.performance.mark()
  // * window.performance.mark()用于记录一个传入的名称从某一时刻到记录时刻的毫秒数
  // * 通过一个给定的名称，将该名称（作为键）和对应的DOMHighResTimeStamp（作为值）保存在一个哈希结构里。该键值对表示了从某一时刻（注：某一时刻通常是 navigationStart 事件发生时刻）到记录时刻间隔的毫秒数。
  // * 通常用来多次记录时间间隔
  // * 上下两个实际上没有太大的区别，只是第一个部上了两个性能埋点，用于测量vnode渲染花了多少时间，以及vm.update()执行花了多少时间
  if ( config.performance && mark) {
    updateComponent = () => {
      // * Vue提供的性能埋点，文档有介绍
      const name = vm._name;
      const id = vm._uid;
      const startTag = `vue-perf-start:${id}`;
      const endTag = `vue-perf-end:${id}`;

      mark(startTag);
      const vnode = vm._render();
      mark(endTag);
      // * measure表示window.performance.measure()，同时将前面的startTag和endTag记录的时间节点清除
      // * window.performance.measure(name, start, end)用于创建一个名为name, 测量开始标志为start，测量结束标志位end的一次测量
      measure(`vue ${name} render`, startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(`vue ${name} patch`, startTag, endTag);
    };
  } else {
    // * 定义了一个updateComponent函数，在函数中调用vm._update(vm._render(), hydrating)
    // * 第一个参数是通过vm._render()来渲染出的一个VNode，第二个参数和服务端渲染相关
    // * 在Watcher这个渲染观察者的constructor中，调用this.get()中就会使用到updateComponent，然后执行vm._render()渲染一个vNode
    // * 在通过vm._update将其挂载出来
    updateComponent = () => {
      // * 通过vm_render()返回了一个VNode，这是顶层的一个VirtualDom节点
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // * 通过new Watcher来执行上面定义的updateComponent, 这里的Watcher是一个渲染Watcher
  // * Watcher是和响应式原理相关的一个类，他是一个观察者，在Vue中有很多自定义的Watcher也有这样的渲染Watcher
  // * 此处就是一个渲染Watcher
  // * 此处向Watcher传入五个参数，也是Watcher类的constructor接收的五个参数，分别为
  /**
   * @param vm  当前Vue实例
   * @param expOrFn 此处传入函数或其他情况， updateComponent表示一个函数
   * @param cb 回调函数 此处使用noop空函数
   * @param options 一些配置
   * @param isRenderWatcher 是否为渲染Watcher，此处为true
   */
  // * 在watcher初始化的时候，先执行一次beforeUpdate
  // * 并且在执行beforeUpdate的时候，这个时候数据更新已经完成，只是还没有更新视图
  // TODO updateComponent是作为渲染Watcher的getter传入的
  // TODO 对于渲染watcher而言，他的回调是noop，他的getter是updateComponent
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    // * 执行mounted的时期有两个，第一个就是此处，如果实例初始化的时候没有$vnode说明这是一个根节点，在mountComponent中就会触发mounted周期的函数
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  // * updateChildComponent方法主要就是对props、 listeners、 parentVnode 和 renderChildren 的更新
  // * 该方法主要对子组件传入的 props、 事件 等做更新
  {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  const newScopedSlots = parentVnode.data.scopedSlots;
  const oldScopedSlots = vm.$scopedSlots;
  
  /* 
    * $key： 表示插槽内容是否在更新时复用
    * $stable： 插槽的渲染函数是否需要每次重新计算
    * name: fn:  表示对应作用域插槽的渲染函数
  */
 
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  );

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  const needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    const props = vm._props;
    const propKeys = vm.$options._propKeys || [];
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i];
      const propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  const oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  // * callHook接收两个参数，第一个是vue实例，第二个是生命周期
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  const handlers = vm.$options[hook]; // * 这个handlers是一个数组, vm.$options经历过合并，将相同生命周期的方法合并到一起
  // * 这个合并很好理解，比如组件内部有created方法，同时组件引入一个mixin中也有一个created方法，这个时候，会将组件的created方法和mixin中的created方法进行合并，当然这个合并就是按顺序执行两个方法
  const info = `${hook} hook`;
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    // * 通过$emit触发$on的hook方法
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

const MAX_UPDATE_COUNT = 100;

const queue = []; // * Watcher数组
const activatedChildren = []; // * 激活的child
let has = {}; // * 表示这个watcher是否重复添加
let circular = {}; // * 循环更新用的
let waiting = false; // * 标志位
let flushing = false; // * 也是标志位
let index = 0; // * watcher的索引

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  // * 主要是将这个公共变量都重置一遍, 保证下一次进来的状态不会发生改变
  index = queue.length = activatedChildren.length = 0;
  has = {};
  {
    circular = {};
  }
  waiting = flushing = false;
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
let currentFlushTimestamp = 0;

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow = Date.now;

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance;
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now();
  }
}

/**
 * Flush both queues and run the watchers.
 */
// * 每一次nextTick的时候，就会执行这个函数, 在这个函数中会遍历所有的queue, 遍历过程中如果发现有watcher会执行watcher
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow(); // * 获取开始执行的时间戳
  flushing = true; // * 在此处将flushing置为true
  let watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // * 根据先后顺序对watcher进行排序
  queue.sort((a, b) => a.id - b.id);

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    // * 遍历这个queue 但是在遍历的过程中, queue的长度可能会发生变化
    watcher = queue[index]; // * 当前 watcher 
    if (watcher.before) {
      watcher.before(); // * options上面的before, options是 new Watcher的时候传入的第四个参数，渲染watcher中里面是beforeUpdate的回调函数
    }
    id = watcher.id;
    has[id] = null; // * 表示这一次tick已经更新过了，下一次进入update, 允许再次将当前订阅者加入到订阅者队列中
    watcher.run(); // * 执行watcher.run()
    // TODO 包括为什么要每一次去计算queue.length就是在于watcher.run执行的时候，会触发一些回调
    // TODO 这些回调会再次执行queueWatcher, length就会发生改变
    // in dev build, check and stop circular updates.
    if ( has[id] != null) {
      // * 这个判断是为了判断是不是存在无限循环更新，如果有 就直接会抛错, 主要就是执行 flushSchedulerQueue 时候又执行了 queueWatcher 在条件满足的时候就会像watcher队列queue中
      // * 添加新的watcher, 这种时候， 就可能会触发这里无限更新的bug
      // * 在watch属性(user watcher)下面定义一个当前值的更新会触发这个， 使用this.$on('hook:updated', () => {this.xxx = xxx})也会
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice();
  const updatedQueue = queue.slice(); // * queue.slice()定义一个副本，这是一次简单的深拷贝, 这个queue是一个watcher队列

  resetSchedulerState(); // * 每次执行完flushSchedulerQueue都会执行这个resetSchedulerState

  // call component updated and activated hooks
  // ? 这是给keepAlive下面两个钩子函数activated和deactivated用的
  callActivatedHooks(activatedQueue);
  // ! 这里就会执行updated这个钩子函数, updatedQueue表示的就是在queue这个watcher队列已经全部更新完成之后，用于表示更新完成的watcher
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length;
  while (i--) {
    const watcher = queue[i];
    const vm = watcher.vm;
    // * 不停地遍历queue，发现如果是一个_watcher(渲染watcher)并且他已经mounted过了，并且他还没有destroyed销毁, 就会触发updated
    // * 由于vm._watcher本身就是渲染watcher拷贝过来的，因此vm._watcher === watcher如果成立，那么就说明watcher是一个渲染watcher
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
// * queueWatcher就是一个watcher队列，他将需要更新的watcher全部推入了watcher队列中
function queueWatcher (watcher) {
  // * 在new一个Watcher的时候, id是自增的，因此不同的watcher id是不同的
  const id = watcher.id;
  // * has的键是number类型的, 用于判断是否添加过watcher
  // ? 主要是在同一时间有很多数据在更新，然后在更新数据的时候， 同时去更新了多个数据，但是他们对应的订阅者，是统一个渲染watcher，但是实际上每一个渲染watcher都会执行update
  // ? 执行update就会执行queueWatcher, 因此在同一个tick内，会多次触发同一个渲染watcher的update, 这样做的话，同一个watcher，就只会push一次到queue队列中
  if (has[id] == null) {
    // * 如果没有添加过，才会把这个id置为true, 才会执行下面的逻辑
    has[id] = true;
    if (!flushing) {
      // ? flushing最开始标志为false, 因此就会进入到这个逻辑中
      // * 将watcher push到队列中
      queue.push(watcher);
    } else {
      // * 在执行 flushSchedulerQueue 下面的watcher.run()的时候又一次进入了queueWatcher的时候, 就会执行这个else下面的内容
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // * 先拿到queue这个队列的最后一个的索引
      let i = queue.length - 1;
      // * 这里的index表示在执行 flushSchedulerQueue 的时候遍历的那个的索引
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      // * 当 flushSchedulerQueue 中遍历的索引大于 i 或者 watcher.id 大于 队列中第i个的id时, 就会将当前watcher插入到第 i+1 的位置上
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      // ? 这里的waiting也是为了保证 nextTick(flushSchedulerQueue) 这个逻辑只执行一次
      waiting = true;

      if ( !config.async) {
        flushSchedulerQueue();
        return
      }
      // * 这个nextTick可以理解为就是一个异步的实现, 简单理解就是在下一个tick去执行flushSchedulerQueue
      // * 这里就是等待DOM改变，在下一次tick执行flushShedulerQueue
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */



let uid$1 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
class Watcher {
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  // * cb表示回调函数callback
  constructor (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    // * 如果是渲染Watcher，那就在vm上添加一个_watcher, 并把Watcher实例指向vm._watcher
    if (isRenderWatcher) {
      // * 这里的this代表的是当前的watcher，也就是说，如果是渲染watcher，就会把当前的watcher赋值给vm._watcher, 也就是说这个vm._watcher表示他是一个渲染watcher
      vm._watcher = this;
    }
    // * 将当前Watcher实例push到所有的_watchers中
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      // * 这里是保存了一遍options上的before, 也就是传入的 before函数
      /*
        before () {
          if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
          }
        }
      */
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    // * 将回调函数cb传给this.cb
    this.cb = cb;
    this.id = ++uid$1; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    // * 如果是开发环境，就将传入的expOrFn转换为字符串
    // * 实际上这个expression只是让你看一下是什么，并没有太大的用处，关键是下面的
    // * toString()并不改变原来的类型, 只会返回一个新的字符串
    this.expression =  expOrFn.toString()
      ;
    // parse expression for getter
    // * 如果expOrFn是一个函数，那就将这个函数赋值给Watcher的getter
    // * 否则就使用parsePath将expOrFn转换为一个函数在赋值给实例的getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      // TODO parsePath 返回一个函数,在userWatcher中，expOrFn代表的watch变量的键名
      // TODO 最后这个键名会变成一个数组，数组中只有一个成员就是这个键名
      // TODO 就是以下函数, 其中 segments 就是 ['expOrFn'], 毕竟在userWatcher 中 expOrFn就代表的是 userWatcher的键名
      /* 
      *  function (obj) {
      *    for (let i = 0; i < segments.length; i++) {
      *      if (!obj) return
      *      obj = obj[segments[i]]
      *    }
      *    return obj
      *  }
      */
      if (!this.getter) {
        this.getter = noop;
         warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    // * 如果是lazy模式，那就不作任何操作，否则将this.get()返回值赋值给this.value
    // TODO 在new Watcher的时候, 就会对userWatcher进行一次求值
    this.value = this.lazy
      ? undefined
      : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this); // TODO 在new Watcher的时候执行 get 方法, 这个时候这个 this 代表就是当前 watcher
    let value;
    const vm = this.vm;
    try {
      // * 这里使用了一次getter
      // * 这个getter就是在mountComponent的时候传入的updateComponet
      // * 这里执行getter也就是执行updateComponent的逻辑, 当执行updateComponent的时候，就会执行vm._render方法
      // * 在执行vm._render的时候就会触发render方法，在其中计算出最后的VNode的过程中就会触发绑定在data、props等上面的getter属性
      // * getter属性触发，就会执行dep.depend()这个方法，在其内部触发dep.target.addDep(this)，也就是watcher的addDep方法

      // TODO 也就是说，render执行过程中，访问getter属性，最终就是将订阅者watcher添加到订阅者集合subs里面去，作为当前数据的桥梁
      // TODO 然后到最后会判断是否需要深层次的订阅, 完了之后，就会执行popTarget，将当前使用的订阅者watcher给pop出去，恢复之前的watcher栈，保持Dep(类)上面的target(watcher)是最初的状态
      // TODO 在派发更新的时候，执行vm._update方法patch出真实DOM和首次渲染，并不是完全相同的

      // TODO 这里的 vm 是当前的 vue 实例
      // TODO 执行 userWatcher 的 get 方法到此处时, 通过这个 getter 传入一个当前 vue 实例, 实际上就是访问 this[key], 这里的 key 就是 userWatcher 的键名
      // TODO 然后这一次访问, 就会触发被监听对象的getter, 因此就会触发他的依赖收集
      // TODO 这样就会触发监听对象的 dep.depend(), 并且之前如之前一样, 监听对象getter执行完拿到值之后, dep.Target 又恢复成了 userWatcher
      // TODO 这样 监听对象执行 dep.depend() 的时候 就会在监听对象的 dep.subs 中 加入 userWatcher 的依赖
      // TODO 然后在 监听对象值改变的时候, 就会通过 dep.notify() 触发 userWatcher 的 update()
      // TODO 就会执行 watcher.run() 或者 queueWatcher(), 如果执行 queueWatcher() 那么就会在下一次执行 flushSchedulerQueue 的时候执行watcher.run
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`);
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        // * 递归的把每一个数组或者对象下的所有值都跑一遍，目的是为了触发每一个值的getter来收集依赖
        // * 这样只要deep下面的监听对象发生了改变, 就会触发setter去派发更新, 然后就会触发userWatcher的this.run(), 去执行this.cb
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep (dep) {
    const id = dep.id;
    // * 初始化进来的时候this.newDepIds和this.depIds都是新的Set数据结构，因此他们并不会存在当前dep的id
    // * 所以将id分别存入之后，就会触发dep.addSub(this), 这个addSub实际上就是往subs这个watcher集合里面，把当前的watcher给push进去
    // * 这个watcher就是数据的订阅者
    // ? 这里带new的表示是新的，不带new的表示是旧的, 在清除的地方，他们的区别，就体现出来了
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () {
    // * 清除依赖收集
    // * 主要是数据改变的时候，都会重新渲染，重新渲染的过程中就会重新去掉addDep这个方法
    // * 因此第一次渲染完，要清除掉，否则下一次进来重新执行addDep再添加进去
    // * 至于添加判断来确认添加过的东西不再添加而不是全部清除这样的方法为什么不用，后续再看
    let i = this.deps.length;
    while (i--) {
      // * 把所有的deps和newDeps做一次比对 如果发现有不需要watcher的deps，就移除掉，取消订阅， 比如v-if="msg" v-else-if="msg1" 当切换到msg1之后，就不会再对msg做订阅了
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    // * 这个depIds就是堆newDepIds的一个保留
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    // * 这里也是一样deps就是堆newDeps的保留
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      // ? 表示是一个同步watcher, 一般情况下不是
      this.run();
    } else {
      // ? 一般的watcher就会进入到此处
      // ? this指向watcher实例
      queueWatcher(this);
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      // * 首先通过get去求了一个新的值(在这里面会执行pushTarget, 但是之后就会执行popTarget，并不会改变原有的watcher栈)
      const value = this.get();
      // * 如果发现值不一样，或者是一个对象，或者this.deep为true, 就会执行下面的回调
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // ! 这里可以看出 如果我们监听的值是一个对象, 或者说 设置了deep属性为true, 那么就会直接进入回调
        // set new value * 设置一个新的值
        const oldValue = this.value;
        this.value = value;
        // TODO 对于渲染watcher来说, this.cb这个callback实际上是一个空函数, 它主要是要执行get再一次去求值
        // TODO 执行get的时候，就会触发getter, 对于一个渲染watcher就是lifecycle中的updateComponent, 然后触发render得到新的VNode再出发update去patch出真实节点更新DOM
        // TODO 对于user Watcher来说callback就是我们定义的那个函数handler(newVal, oldVal) {...} 这个就是他的cb
        if (this.user) {
          try {
            // * watch一个值的回调，就是执行的这个步骤，我们可以拿到一个新的值和一个旧的值，就是因为将新的值和旧的值都作为一个参数传递进来了
            // ? 因此在 userWatcher 中如果对他watch的值再一次进行更新，那么就会在 flushSchedulerQueue 执行的时候， 再一次触发 queueWatcher 
            // ? 但是这个时候，会进入那个容易造成bug的else中(因为 flushing 是 true), 到最后，就会在watcher队列中，在插入一个新的watcher
            // ? 但是实际上前面有一个 userWatcher 还没有消失 这个新的 userWatcher 又进去了， 并且他们拥有同一个id, 然后就进入循环了，不停的加入新的 userWatcher 并且都是同一个
            // ? 这就是那个条件 MAX_UPDATE_COUNT 的用处 标志了一个最大的循环值(id相同进入的那个判断中执行次数, id相同意已经有问题了， vue设置了一个最大问题执行值，来结束糟糕的代码)
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`);
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    // TODO 在计算属性的getter执行的过程中，因为要依赖 props 或者 data 上面的值, 那么这个计算属性的getter触发的时候, 实际上还会触发非计算属性的getter
    // TODO 计算属性的 get 触发时, 首先会更新Dep.target 变为计算属性的watcher, 并且在触发 getter 的同时, 获取依赖项的值就会触发依赖项的 getter ,然后它所依赖的data或者props就会
    // TODO 执行他自己的getter进行依赖收集, 这个时候执行 depend , 就会将计算属性的 watcher 添加到自己的 dep.subs 中
    // TODO 这样当依赖项发生改变, 就会执行依赖项的 setter 在其中触发dep.notify(), 然后执行所有watcher的更新
    // TODO 更新过程中, 会将subs下面所有 watcher 都执行 update, 这样计算属性watcher的 dirty 又回到了true
    // TODO 渲染页面时, 会重新去拿计算属性的值，此时由于 dirty 为 true, 就会触发watcher.evaluate() 这个方法，重新去执行getter方法拿到新的值, 并且将 dirty 重新置为true
    // TODO 实际上，还有一个最关键的一步操作，就是渲染watcher的触发，是在所有watcher的最后面，因为他的id最大，并且他在最后会通过nextTick去触发 flushSchedulerQueue() 去执行访问queue中所有watcher的run 再去触发get，而计算属性的get，也是在此处触发的。
    // TODO 因此，哪怕依赖的值并没有改变，只要页面的render-watcher触发过，就会重新get一次计算属性，当然，依赖值没有派发更新，那么计算属性的dirty就还是false，并不会触发他的更新，也就不会执行定义的getter函数了
    // TODO 同时触发依赖项的 getter 重新收集依赖又一次将 计算属性的watcher 添加到了自己的 dep.subs 中
    this.value = this.get();
    this.dirty = false;
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      let i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  }
}

/*  */

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop, // * 空函数noop
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    // ? 计算属性触发getter的时候, 由于要依赖data或者props的值, 因此, 这里也会执行，因为在获取 data 或者 props 中的值 会触发get
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  // * 定义了getter和setter函数，然后通过Object.defineProperty方法，在target上修改了key的属性，为每一个key的属性都增加了一个getter和setter，同时修改为可枚举属性，描述符配置修改为可以被修改
  // * 这里的target就是vm实例，key就是传入的每一个data的key，
  // * 也就是说访问vm.key，访问的就是vm.sourceKey.key，这个sourceKey就是 _data, 在最开始执行initData的时候，就把data的值付给了vm._data
  // * 因此，我们可以在vue的实例中，直接通过 this. 来访问 data下面的成员
  // * 这一层this. 来访问data的成员，实际上就是触发了他的getter方法，通过getter方法，访问this._data[key]来拿到想要的数据
  // * 下划线开头在编程界默认为一个私有属性，因此最好不要使用_data去访问
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  const opts = vm.$options;
  // * 在initState中，如果定义了props就初始化props, 如果定义了methods，就初始化methods
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  // * 如果定义了data，就会初始化data, 能够在生命周期中访问到data，这里就是关键
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps (vm, propsOptions) {
  const propsData = vm.$options.propsData || {}; // * 首先拿到props的定义
  const props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = [];
  const isRoot = !vm.$parent; // * 如果$parent不存在那么该节点就是根节点, isRoot就是true
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  for (const key in propsOptions) {
    keys.push(key);
    const value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    {
      const hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        );
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          );
        }
      });
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key);
    }
  }
  toggleObserving(true);
}

// * vm.$options就是初始化Vue实例的时候，传入的配置项，如data, methods,props, 生命周期等
function initData (vm) {
  let data = vm.$options.data; // * 获取到初始化的时候传入的data
  // * 拿到之后先做一个判断，看data是不是一个function，比较推荐的一种写法就是将data写成一个function的形式: data() {return {}}, 然后在返回一个对象
  // * 将值赋值给临时变量data的同时，还赋值给了一个vm._data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm) // * 如果是一个function，则调用getData方法
    : data || {};
  if (!isPlainObject(data)) {
    // * 如果data或者返回值不是一个对象，在非生产环境中，那就抛出一个错误，data函数必须返回一个对象
    data = {};
     warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  // * 这里会取出所有data的key，然后拿到props和methods
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;
  // * 遍历data的key，并且做一个循环的对比，是否在props和methods中有相同的key，如果有，就抛出一个警告
  // * 为什么不能有重复，会冲突，就是因为他们最终都会挂载到VM实例上
  while (i--) {
    const key = keys[i];
    {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
       warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      );
    } else if (!isReserved(key)) {
      // * 通过这个proxy函数实现挂载，就是把data上的东西代理到vm实例上
      proxy(vm, `_data`, key);
    }
  }
  // observe data
  // * 观测这个data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters
  // * 响应式原理的内容
  pushTarget();
  try {
    // * 主要就是执行data方法，改变data的this指向为vm，这个vm就是一个Vue实例全局的this对象
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`);
    return {}
  } finally {
    // * 响应式原理的内容
    popTarget();
  }
}

const computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // * 初始化计算属性
  // $flow-disable-line
  // * 向计算属性订阅者的原型上设置一个空对象, 并且将其缓存下来
  // * 第一次出现的时候，watchers和vm._computedWatchers就是一个浅拷贝，因此后面对watchers赋值，就会改变vm._computedWatchers的值
  const watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  const isSSR = isServerRendering(); // * 用于判断是不是服务端渲染

  for (const key in computed) {
    // * 遍历所有计算属性(定义的)
    const userDef = computed[key];
    // * 本身可以是一个函数，也可以是一个对象，我们一般都写得函数，当然也可以写一个对象，但是对象必须有get
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ( getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      );
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm, // * vm实例
        getter || noop, // * 传入的getter
        noop, // * 传入的回调函数
        computedWatcherOptions // * 传入的配置, 这里是{lazy: true}
      );
      // * 在这里实例化每一个computed的watcher
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // * computed的key不能和 data 或者 props下面的key有重复
      defineComputed(vm, key, userDef);
    } else {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm);
      }
    }
  }
}

function defineComputed (
  target,
  key,
  userDef
) {
  const shouldCache = !isServerRendering(); // * 如果不是服务端渲染, 那么就需要缓存, 将 shouldCache 置为 true
  if (typeof userDef === 'function') {
    // * 在计算属性下面直接定义的就是一个函数的情况
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop; // * 非SSR情况下，计算属性是没有set属性的, 他只是根据订阅的数据发生变化的时候, 执行并返回一个值
  } else {
    // * 当然，如果定义的是一个对象，那么就可以设置set和get方法，通过set方法可以对其进行赋值，但实际上直接对计算属性赋值的情况是很少的
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      );
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  // * 访问计算属性，就会执行以下方法并且得到他的返回值
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) { // * lazy为true, 所以watcher.dirty也是true
        watcher.evaluate();
        // * 执行完后获得value, 并且将 dirty 设置为 false
        // * 通过getters 获取 value, 这个getters就是定义的计算属性
      }
      if (Dep.target) {
        // * 本身就存在一个dep.target(全局update的dep)，而在执行 watcher.evaluate() 的时候, 在执行get中popTarget后又会更新Dep.target
        // * 说直白点就是渲染watcher
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm, methods) {
  const props = vm.$options.props;
  for (const key in methods) {
    {
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        );
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        );
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch (vm, watch) {
  // * 侦听属性的初始化
  for (const key in watch) {
    // * 遍历所有的watch, 拿到每一个设置的侦听属性
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  // ! 这里, 如果直接定义的 userWatcher 就是一个函数, 那么以下两个判断都不会走进去, options 就是 undefined
  // ! 在new Watcher 的时候, 执行 Watcher 类的构造器, 此时 options 那个判断中会将所有的设置为false
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {};
  dataDef.get = function () { return this._data };
  const propsDef = {};
  propsDef.get = function () { return this._props };
  {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn(`$props is readonly.`, this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    const vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    const watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`);
      }
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

let uid$2 = 0;

function initMixin (Vue) {
  // * 执行initMixin的时候就在原型上添加了一个_init方法
  // TODO _init方法主要是做了一堆初始化的工作，比如说_uid的定义、 options的定义
  Vue.prototype._init = function (options) {
    // * Component这个interface详见flow下面的component.js自定义interface Component
    // * 这里的vm指向组件实例的vm
    const vm = this;
    // a uid
    vm._uid = uid$2++;

    let startTag, endTag;
    /* istanbul ignore if */
    if ( config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`;
      endTag = `vue-perf-end:${vm._uid}`;
      // * 可以计算出_init函数走了几次
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    // * 可以理解为将初始化的时候传入的options，都merge到this.$options上面，也就是说，我们可以使用this.$options访问到最初定义的很多东西
    // * 组件创建的时候执行this._init(options)还是要走这个，然后这里的options._isComponent在组件渲染的时候为true，将会执行initInternalComponent来合并options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // * 局部组件会执行这个逻辑
      initInternalComponent(vm, options);
    } else {
      // * 在这里，会合并一次$options，将Vue上的options合并到vm的$options实例上
      // * 全局注册的组件在这里合并, 通过resolveConstructorOptions将Vue合并到vm.$options上
      // * 全局注册的时候，这个vm就是全局Vue实例,因此此处合并后生成的vm.$options在全局可以访问，他是全局的options
      // ! 不管是全局注册，还是局部注册，都会合并Vue上面的options，因此如果我们在Vue的options上面定义的东西，在任何地方都可以使用，但是组件中定义的，就只能merge到Sub.options中，在其他组件就无法访问了
      vm.$options = mergeOptions(
        // * vm.constructor指向Vue构造函数本身
        // * 因此在初始化的时候，这个参数代表的就是Vue构造函数上面的options
        resolveConstructorOptions(vm.constructor), 
        // * 这个options，就是定义new Vue()的时候传入的配置，如el, created(), render()等
        options || {},
        // * 当前实例
        vm
      );
    }
    /* istanbul ignore else */
    // * 在生产环境，vm就是_renderProxy
    // * 开发环境中执行initProxy来初始化_renderProxy
    {
      initProxy(vm);
    }
    // expose real self
    vm._self = vm;
    // * 这个比较关键
    initLifecycle(vm); //TODO 初始化生命周期
    initEvents(vm);  // TODO  初始化事件中心
    initRender(vm); // TODO 
    // * 在beforeCreate中，vue-router，vuex都混入了一些逻辑
    callHook(vm, 'beforeCreate'); // TODO 执行beforeCreate, 在这个时候，是拿不到组件内部的数据的. 因为到此为止，只初始化了生命周期事件和渲染函数
    initInjections(vm); // resolve injections before data/props // TODO 初始化全局注入
    initState(vm); // TODO 初始化props和data
    initProvide(vm); // resolve provide after data/props // TODO 
    callHook(vm, 'created'); // TODO 执行created, 在created中已经可以拿到需要的data, props之类的数据了，因为在这里，已经执行完了provide/inject的初始化，data， props的初始化
    // * 也就是说在init的过程中，就会执行beforeCreate和created

    /* istanbul ignore if */
    if ( config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(`vue ${vm._name} init`, startTag, endTag);
    }
    // * 判断是否传入了一个DOM对象，也就是挂载的el，如果有，则调用$mount()将el挂载
    // * $mount就是做挂载的方法
    // ! 组件创建的时候在$options上并没有el，因此到此为止，不会进去 
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  // * 首先更新vm.$options，将实例的构造函数constructor上的options赋值给vm.$options，同时定义一个新的值opts
  // * 这里的vm是儿子组件的实例
  // * 局部组件执行Vue上extend时，传入的sub就是vm.constructor, sub.options就是通过Object.create()创建的options, 然后赋值给了这个vm.$options
  // * 所以可以通过vm.$options访问到定义的组件，比如说<a-table>这种, 因此在resolveAsset()方法中，可以拿到assets下面的局部组件定义那个definition
  const opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  // * 然后比较重要的就是讲options._parentVnode传进来了，并且传进来了parent
  // * 这个_parentVnode就是那个占位符的vnode, 所谓占位符，就是组件名称所构成的那个标签，就是一个占位符
  // * 这里的parent就是当前的vm实例，也就是作为这个子组件的父组件的vm实例
  const parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;

  // * 这里通过vnodeComponentOptions也就是占位符(子组件, 目前还是一个占位符)的componentOptions
  // * 由于组件存在和组件相关的配置上的东西，比如说props，linsteners等，都会在componentOptions中
  const vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  // * 通过这个拿到了全局的render和全局的staticRenderFns
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
  // * 以上合并方式比较简单，没有mergeOptions合并策略那么复杂，因此，组件的options合并会非常快
}

function resolveConstructorOptions (Ctor) {
  // * 初始化的时候传入的Ctor是Vue构造函数(Vue)(或者是组件的构造器，当然也是merge了Vue的基本方法和原型方法)
  let options = Ctor.options;
  if (Ctor.super) {
    // * 在Ctor是Vue构造函数的时候，上面不存在super，因此不会走入这里面
    // * 组件加载，无论是异步还是同步，在Ctor上，都存在super，指向的是上一层的super, 也就是Vue构造函数
    const superOptions = resolveConstructorOptions(Ctor.super);
    // ! Ctor.superOptions就是外层的options
    const cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // * 这里的逻辑，只有在resolveConstructorOptions方法传入的Ctor.super为Vue的时候才会进来
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  // * 相当于这里获取的是Vue构造函数上的一个基本options, 然后会将这个options合并到全局注册组件的options上面去
  return options
}

function resolveModifiedOptions (Ctor) {
  let modified;
  const latest = Ctor.options;
  const sealed = Ctor.sealedOptions;
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {};
      modified[key] = latest[key];
    }
  }
  return modified
}

// * new Vue的时候就会执行这个构造函数Vue，然后使用this._init将options传入进去
// * this._init是Vue原型上的一个方法, 该方法是在执行initMixin(Vue)的时候添加到原型上的
// * 传入的options中包含一个el, 一个
function Vue (options) {
  if (
    !(this instanceof Vue)
  ) {
    // * 必须通过new 方法去实例化Vue，否则报错
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  // TODO 也就是说当执行this._init(options)的时候, 就进入到了init.js中的_init方法
  this._init(options);
}


// * 每一个mixin就是往vue的原型上混入一些定义的方法。
// * 之所以不使用ES6来写底层，ES6实现效果比较难写，ES5可以往原型上直接挂载方法，并且将这些方法拆分到不同的文件下，方便代码管理。而不是在一个大文件下定义所有的方法
// * 可以学习一下这样的编程方式。
// * 在不同的文件中定义原型上的方法
// * 在整个import Vue的过程中，就已经做了初始化，定义了基本上所有的全局方法

// ! Vue的初始化过程，先是通过一系列的mixin方法，给原型挂载很多原型方法，又通过global-api挂载了很多静态方法
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    // * 可以看到mixin是用来合并options用的
    // * 这里的this是大的Vue, 也就是Vue这个构造函数的this
    // * 这个方法和组件在init时使用的方法一致，只是这样会将全局的mixin中的对象，合并到Vue.prototype.options中
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  let cid = 1;

  /**
   * Class inheritance
   */
  // * extend 传入一个对象，返回是一个函数
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    // * 这里的this并不是实例vm，而是Vue这个构造函数，因为extend是Vue的静态方法，并非原型上的方法
    const Super = this;
    // * Vue的cid
    const SuperId = Super.cid;
    // * 这里实际上是在extendOptions上增加了一个构造器_Ctor，初始化为一个空对象
    // * 实际上是做了一层缓存的优化
    // ? 目前估计是下一次在渲染component的时候，如果在Vue上一级存在过这个component，也就会有一个对应的cid存在，那么就会直接取出来，得到该component对应的VNode
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // * 定义了一个name, 如果在传过来的对象上不存在这个name，就会取Vue的options上面的name
    const name = extendOptions.name || Super.options.name;
    if ( name) {
      // * 这里是在开发环境对name做一次校验
      validateComponentName(name);
    }

    // * 定义了一个子构造函数
    const Sub = function VueComponent (options) {
      // * 所以这里执行this._init时，就会执行Vue.prototype._init方法
      this._init(options);
    };
    // * 将子构造函数的原型都指向了父Vue的原型
    Sub.prototype = Object.create(Super.prototype);
    // * 将他原型上的constructor指回自己
    Sub.prototype.constructor = Sub;
    //! 以上是一个简单的原型链继承，由于此处super指向Vue，因此Sub完全继承了Vue原型上的所有东西
    Sub.cid = cid++;
    // * options做了一层合并，将自身的options和Vue的options做了一层合并
    // * 局部注册组件，就会在此处合并options，extendOptions就是组件的options，Super.options表示Vue的options
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    // * 然后将super指向外层的Super，也就是Vue
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // * 以下两个步骤对Sub子构造函数自己的Props和Computed做了一次初始化
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    // * 这里将全局(Vue)的静态方法复制给Sub
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    // * 这里拷贝了component, directive和filter
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    // * 这里将Sub缓存下来，赋值给原来的那个Cid(Sub初始化的时候对原来的cid做了一次+1)
    cachedCtors[SuperId] = Sub;
    return Sub
    // * 这里的目的就是让Sub拥有和Vue一样的能力
  };
}

function initProps$1 (Comp) {
  const props = Comp.options.props;
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key);
  }
}

function initComputed$1 (Comp) {
  const computed = Comp.options.computed;
  for (const key in computed) {
    // * 组件的computed初始化，是往组件的原型上定义了 计算属性的 key
    // * 往原型上定义, 这样组件共享的时候, 就避免了重复的往实例上去定义getter
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

// * 初始化全局静态属性的时候，将会执行initGlobalAPI, 在这个时候，会执行initAssetRegisters，注册三个全局的函数
function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    // * 首先将component filter和directive挂载到Vue上
    // * 在这里Vue扩展了三个全局函数， component filter 和 directive
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if ( type === 'component') {
          validateComponentName(id);
        }
        // * isPlainObject表示是一个普通对象,判断方式为toString()之后是一个[object Object]
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          // * 将definition转换为一个构造器，extend将会基于Vue初始化一次，增加definition上的配置后返回一个完全继承Vue的构造器
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        // * 然后在这里将继承自Vue的构造器————definition返回给全局的Vue的options下面的[type]s的id
        // * 这里的type就是component, filter 和 directive

        // * 对于组件注册，就是在Vue.options.components上增加了一个id，这个id就是组件的名字(标签名)，他的属性就是继承自Vue的新的构造器————definition
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */



function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance;
  for (const key in cache) {
    const cachedNode = cache[key];
    if (cachedNode) {
      const name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  const cached = cache[key];
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

const patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name));
    });
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name));
    });
  },

  render () {
    const slot = this.$slots.default;
    const vnode = getFirstComponentChild(slot);
    const componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      const name = getComponentName(componentOptions);
      const { include, exclude } = this;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this;
      const key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};

var builtInComponents = {
  KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  const configDef = {};
  configDef.get = () => config;
  {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = (obj) => {
    observe(obj);
    return obj
  };

  // * 创建一个空对象
  Vue.options = Object.create(null);
  // * 在ASSET_TYPES中定义了三个方法: component, directive 和 filter 
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // * 在此处初始化Vue的options,将options._base设置为Vue，然后在初始化的时候合并options
  Vue.options._base = Vue;
  // * 这里将base指向Vue</T>
  // * builtInComponents是一个内置组件, 通过extend方法将其拓展到了components下面
  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

// * 依然是从外部导入一个Vue，通过/instance/index这个文件中

// * 初始化了Vue的全局API，往Vue上挂载了一些静态属性
// * 初始化全局API的时候，在Vue上挂载了关于component、directive和filter的方法
initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

Vue.version = '2.6.12';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
const isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
const acceptValue = makeMap('input,textarea,option,select,progress');
const mustUseProp = (tag, type, attr) => {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

const isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

const convertEnumeratedValue = (key, value) => {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    // allow arbitrary string value for contenteditable
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
};

const isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,' +
  'truespeed,typemustmatch,visible'
);

const xlinkNS = 'http://www.w3.org/1999/xlink';

const isXlink = (name) => {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

const getXlinkProp = (name) => {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

const isFalsyAttrValue = (val) => {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  let data = vnode.data;
  let parentNode = vnode;
  let childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  let res = '';
  let stringified;
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) res += ' ';
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  let res = '';
  for (const key in value) {
    if (value[key]) {
      if (res) res += ' ';
      res += key;
    }
  }
  return res
}

/*  */

const namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

const isPreTag = (tag) => tag === 'pre';

const isReservedTag = (tag) => {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

const unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  const el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

const isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el);
    if (!selected) {
      // * 如果没有el并且是在生产环境，则抛出异常，返回一个创建的div，否则返回挂载的el对象
       warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    // * 如果el不是字符串，则直接返回el
    // * 使用flow限制只能是字符串或者是一个dom对象，在编译阶段就避免了其他类型，因此这里可以直接返回
    return el
  }
}

/*  */

// * 实际上就是原生api, 然后修复了对带有Mutiple的select标签的问题
function createElement$1 (tagName, vnode) {
  const elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  // * textContent 返回的是节点下面所有层级组合起来的一串文本, 一旦赋值, 其下所有的元素豆浆会替换成一个纯文本
  node.textContent = text;
  /* 
  * textContent 会获取所有元素的内容，包括 <script> 和 <style> 元素，然而 innerText 只展示给人看的元素。
  * textContent 会返回节点中的每一个元素。相反，innerText 受 CSS 样式的影响，并且不会返回隐藏元素的文本，
  * 此外，由于 innerText 受 CSS 样式的影响，它会触发回流（ reflow ）去确保是最新的计算样式。（回流在计算上可能会非常昂贵，因此应尽可能避免。）
  * 与 textContent 不同的是, 在 Internet Explorer (小于和等于 11 的版本) 中对 innerText 进行修改， 
  * 不仅会移除当前元素的子节点，而且还会永久性地破坏所有后代文本节点。在之后不可能再次将节点再次插入到任何其他元素或同一元素中。
  */
}

function setStyleScope (node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create (_, vnode) {
    registerRef(vnode);
  },
  update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  const key = vnode.data.ref;
  if (!isDef(key)) return

  const vm = vnode.context;
  const ref = vnode.componentInstance || vnode.elm;
  const refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

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

const emptyNode = new VNode('', {}, []);

const hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

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
  let i;
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key;
  const map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map
}

// * backend是一个对象，里面有个两个键值对，分别是nodeOps和modules
// * 这里这个backend接收的参数，是来自于patch定义的时候，传入的nodeOps和modules
function createPatchFunction (backend) {
  let i, j;
  // * 全程是callbacks
  const cbs = {};

  const { modules, nodeOps } = backend;

  // * 此处的hooks指代生命周期, 主要是[create, activate, remove, update, destroy]
  for (i = 0; i < hooks.length; ++i) {
    // * 在cbs中添加内容，键名为hooks中的每一项，键值为空数组
    cbs[hooks[i]] = [];
    // * 遍历modules
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        // * 在这个cbs对象中，每一个update， create, destroy中包含了所有的update, create, destroy
        // * 也就是说在patch的过程中，会执行各个阶段的钩子
        cbs[hooks[i]].push(modules[j][hooks[i]]);
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
        removeNode(childElm);
      }
    }
    remove.listeners = listeners;
    return remove
  }

  function removeNode (el) {
    const parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
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

  let creatingElmInVPre = 0;

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
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    // * isRootInsert表示是否作为根节点插入，默认为true
    // * 初始状态nested不存在，因此，也是true
    vnode.isRootInsert = !nested; // for transition enter check
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
    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag; // * 初次渲染是一个div
    if (isDef(tag)) { 
      {
        // * 这里是一个检测，如果在模板里写了一个组件，但是没有注册
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      // * 查看vnode上是否存在命名空间，如果有，则创建元素并赋予命名空间，如果没有，则单纯的创建元素
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        // * 如果这个vnode还有子节点，就会创建子节点
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        // * 参数依次代表 父节点， 当前vnode对应的真实DOM, 参考节点
        insert(parentElm, vnode.elm, refElm);
        
        // ! 也就是说，整个createElm的过程，是一层一层先插入最底层的子节点，最后在插入父节点
      }

      if ( data && data.pre) {
        creatingElmInVPre--;
      }
      // * 往后都是tag不存在的情况
    } else if (isTrue(vnode.isComment)) {
      // * 如果是注释节点，那么也创建一个注释节点, 然后插入到父节点中
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      // * 否则就创建一个文本节点，然后插入到父节点中
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    // * 首先要判断组件的vnode是否存在data
    let i = vnode.data;
    if (isDef(i)) {
      // * keep-alive的逻辑
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      // * 这种写法是判断i.hook是否存在，同时将i.hook赋值给i，以及hook中是否存在init方法，如果有，i就是hook中的init方法
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // * 这时的i已经是init了
        // * 在外层组件init的过程中，会对内部的组件标签等进行render和patch
        i(vnode, false /* hydrating */);
      }
      // * 到这里，组件的所有init方法都已经执行完成了，也就是说patch已经执行完成了
      // * 子组件的vm上面已经有了$el，但是子组件还没有挂载上去
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      // * 到此处，子组件的patch就已经走完了
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        // * 到这里执行完之后，子组件就已经完成了插入，父组件中就可以看到子组件了
        // * 这个insertedVnodeQueue在patch的过程中，会不停的插入带有当前组件的内容。并且组件patch的过程是一个先子后父的过程，因此最底下的儿子包含的内容，会在层次高的父亲的前面
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    // * insertedVnodeQueue在不停的扩充
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    // * 在执行initComponent的时候，就会将vnode.componentInstance.$el赋值给vnode.elm
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    let innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref) {
    // * 执行insert首先要父节点存在
    if (isDef(parent)) {
      if (isDef(ref)) {
        // * 如果有参考节点，并且参考节点的父节点和当前节点的父节点相等，那么就将当前节点插入到参考节点前
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref);
        }
      } else {
        // * 如果没有参考节点，则直接将子节点插入父节点, 比如说遍历儿子时的参考节点，都是null
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      {
        // * 对节点的key做校验
        checkDuplicateKeys(children);
      }
      // * 遍历children，然后每一次都调用createElm方法
      // * 同时将当前节点的elm作为父节点，插入进去
      // * 实际上是一个递归
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      // * 如果vnode.text是一个基础类型，也就是string number symbol boolean
      // * 那就直接调用appendChild方法，将这个节点插入进去就可以了
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable (vnode) {
    // * vnode.componentInstance 这个东西存在的话, 说明当前vnode是一个 组件vnode
    // * 如果是渲染vnode, 是没有这个的, 但如果他又是渲染vnode 又是 组件vnode, 就会不断的循环, 直到找到他真正的渲染vnode, 并且不是一个组件vnode
    // * 然后判断这个vnode是否存在tag标签, 如果有说明可以被挂载
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode);
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode);
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    let i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      let ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook (vnode) {
    // * 通过这个方法，递归的去销毁子组件
    // * 不停的执行销毁工作
    let i, j;
    const data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      // * 这个cbs包含了组件的所有生命周期函数(合并过后的)
      // * 从这里开始执行销毁工作，一层一层到最底下的销毁工作完成了，才会退出递归
      // * 因此，最底层的destroy最先完成，退出递归
      // * 所以使用destroyed这个钩子函数的时候，儿子比爹先执行。越顶层越后执行销毁钩子(并不是后执行销毁，仅仅只是后执行销毁钩子，然后最后清空，销毁开始还是很早的)
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i;
      const listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    // * 最后两个参数是 [] 、 false
    let oldStartIdx = 0; // * 存储旧的节点开始的位置, 初始值是0
    let newStartIdx = 0; // * 存储新的节点开始的位置, 初始值是0
    let oldEndIdx = oldCh.length - 1; // * 存储旧的节点结束的位置
    let oldStartVnode = oldCh[0]; // * 存储旧的节点开始的那个vnode
    let oldEndVnode = oldCh[oldEndIdx]; // * 存储旧的节点结束的那个vnode
    let newEndIdx = newCh.length - 1; // * 存储新的节点结束的位置
    let newStartVnode = newCh[0]; // * 存储新的节点开始的那个vnode
    let newEndVnode = newCh[newEndIdx]; // * 存储新的节点结束的那个vnode
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly;

    {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // * 加入这些判断, 都是为了迅速的找到一个组件更新的最优解
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right // * 旧的开始和新的结束做相等判断
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left // * 旧的结束和新的开始做相等判断
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys (children) {
    const seenKeys = {};
    for (let i = 0; i < children.length; i++) {
      const vnode = children[i];
      const key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            `Duplicate keys detected: '${key}'. This may cause an update error.`,
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i];
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
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    // * 由于其新旧节点相同, 因此这里直接就是拿到旧节点的 dom节点, 赋值给新节点的vnode.elm, 并且用一个变量elm来保存
    // * vnode.elm 在组件更新的时候是一个undefined, 因为他还没有走完整个patch, 还没有转换为一个真实的DOM节点
    const elm = vnode.elm = oldVnode.elm;

    // ? 异步组件
    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
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
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    let i;
    const data = vnode.data;
    // * 如果这个 vnode 存在data, 并且 data 上有 hook 并且这个 hook 还是一个 perpatch hook, 说明这个 vnode 是一个组件vnode, 那么就执行 hook上的 perpatch(oldVnode, vnode)
    // * 执行 perpatch 主要是为了执行其下面的 updateChildComponent 对传入子组件的 props, 事件等做更新
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    // * 这里是获取新旧节点的children, 如果有 children 那肯定是普通vnode, 而不是组件vnode, 因为 组件vnode 的 children 是 undefined
    const oldCh = oldVnode.children;
    const ch = vnode.children;
    // * 如果vnode上定义了data 并且 是一个可挂载的节点, 就会执行 update 钩子
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      // ? 如果没有 text 就执行这里的逻辑
      if (isDef(oldCh) && isDef(ch)) {
        // * 同时存在新旧 children 并且他们不等, 那就会执行 updateChildren方法, 实际上是在递归的去做 patchVnode 这个流程
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
      } else if (isDef(ch)) {
        // * 如果新 vnode 有 children
        {
          // * 开发环境排除children中重复的key值, 如果有重复就直接报错 
          checkDuplicateKeys(ch);
        }
        // * 如果 新的节点没有定义text, 但是旧的节点有text, 那么久会将老的dom节点下的所有节点都替换成'', 就是变成一个空的节点
        // * (这里的elm看起来像是新的dom, 实际上他是老的, 只不过暂时把新的也指向了老的)
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        // * 只有老的节点有children, 而新的节点没有children, 那么就要把老的给删了
        removeVnodes(oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        // * 如果又没有老的, 也没有新的, 并且新的没有定义text, 老的定义了text, 那么久要把老的text置为空
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      // ? 如果他们两个的text不同, 则执行这里的逻辑, 把新的text值赋给老的text
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      // * 在这里会调用 postpatch 钩子
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode);
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    // * 这里的queue在之前子组件的初始化过程中，会不断的插入内容，并且是一个深度递归，先子后父的过程，最底下的儿子的一些东西会在最前面，是一个数组
    // * 执行这个insert方法的时候，就会调用mounted周期，传入的是子组件的实例
    // * 也就是说，儿子的mounted会比爹先执行，如果同时初始化一个儿子嵌套儿子嵌套儿子的组件，同时使用了eventBus进行一些调用，需要注意儿子组件的mounted周期，会比他的父亲先执行
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  let hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  const isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    let i;
    const { tag, data, children } = vnode;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true
    }
    // assert node match
    {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */);
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }
              return false
            }
          } else {
            // iterate and compare children lists
            let childrenMatch = true;
            let childNode = elm.firstChild;
            for (let i = 0; i < children.length; i++) {
              if (!childNode || !hydrate(childNode, children[i], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        let fullInvoke = false;
        for (const key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
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
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
      return
    }

    // * 该变量表示是否初始化patch, 默认为false
    // * 这两个也是为了后面用insert钩子使用
    let isInitialPatch = false;
    const insertedVnodeQueue = [];

    // * 第一次的时候oldVnode指向外层挂载el，一般是div#app
    // * 子组件创建的时候，oldVnode是undefined，因此进入
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      // * 用于判断oldVnode是不是一个真实dom，显然初次加载的时候,oldVnode是一个真实DOM
      // * 当组件更新的时候, 重新执行__patch__方法时，传入的oldVnode和vnode都是 virtualDOM, 显然这里是false
      const isRealElement = isDef(oldVnode.nodeType);
      // * sameVnode方法用于对 oldVnode 和 vnode作对比, 判断是走哪个逻辑
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // ? 如果他们是相同的vnode, 那就会执行 patchVnode 这个方法
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        // ? 如果新旧节点不同, 那就分成三个步骤: ①创建新的节点 ②更新父的占位符节点 ③删除旧的节点
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            // * 服务端渲染(SSR)才会进来
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          // * hydrating是false，因此也不会进来
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // * 所以初次渲染，直接走到这里
          // * 将真实的DOM转换为一个Virtual DOM
          // * 同时以后通过oldVnode.elm可以直接拿到该VNode对应的Real DOM
          oldVnode = emptyNodeAt(oldVnode);
        }

        // ? ①创建新的节点
        // ? 首先通过旧节点的dom, 拿到父亲的dom节点
        // replacing existing element
        // * 初次渲染的时候，这个elm，就是vue首次挂载的时候选择那个#app
        const oldElm = oldVnode.elm;
        // * 这个parentNode就是body
        const parentElm = nodeOps.parentNode(oldElm);

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm) // * nextSibling 返回其父节点的 childNodes 列表中紧跟在其后面的节点, 也就是他的下一个兄弟节点
        );

        // update parent placeholder node element, recursively
        // * 首先初次渲染时这里没有父节点
        // * 这里的 vnode 是一个 渲染vnode, 也就是组件的根 vnode, vnode.parent 是一个占位符节点
        if (isDef(vnode.parent)) {
          // * 如果能拿到占位符节点, 就将它定义为祖先, 用 ancestor 保存
          let ancestor = vnode.parent;
          const patchable = isPatchable(vnode); // * 判断 vnode 是否是可挂载的
          while (ancestor) {
            // * cbs 中是一些生命周期的回调函数
            // * 首先执行destroy这个钩子
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            // * 将占位符节点的 elm 指向新的 elm, 这个 vnode.elm 是在前面创建新节点的时候拿到的
            // TODO 这里是做一个更新, 因为新的dom已经发生了变化, 他的引用也要相应的变化, 指向新的节点去
            ancestor.elm = vnode.elm;
            if (patchable) {
              // * 如果当前 vnode 是一个可挂载的 vnode, 就会执行下面一系列的钩子函数
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            // * 然后向上递归寻找, 如果这个组件既是一个占位符节点又是一个渲染Vnode(比如说一个组件的根节点是引用的另一个组件, 比如说a-card), 他就满足这种情况
            // * 接下来他会一直往上找, 直到找一个真正的占位符节点, 对他所有的parent节点都做上面的更新, 直到找不到为止
            ancestor = ancestor.parent;
          }
        }

        // destroy old node 销毁旧的节点
        // * 因为新创建了一个节点，而之前还有一个旧的节点，这里就是删除旧的节点, 如果不删除就两个都存在了, 因此要把旧的节点给删掉
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    // * 这里就是调用了一些钩子函数，之后在看
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  const isCreate = oldVnode === emptyNode;
  const isDestroy = vnode === emptyNode;
  const oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  const newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  const dirsWithInsert = [];
  const dirsWithPostpatch = [];

  let key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

const emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  const res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  let i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir) {
  return dir.rawName || `${dir.name}.${Object.keys(dir.modifiers || {}).join('.')}`
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  const fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, `directive ${dir.name} ${hook} hook`);
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  const opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  let key, cur, old;
  const elm = vnode.elm;
  const oldAttrs = oldVnode.data.attrs || {};
  let attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur, vnode.data.pre);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value, isInPre) {
  if (isInPre || el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr (el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE && !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' && value !== '' && !el.__ieph
    ) {
      const blocker = e => {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  const el = vnode.elm;
  const data = vnode.data;
  const oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  let cls = genClassForVnode(vnode);

  // handle transition classes
  const transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

const validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters (exp) {
  let inSingle = false;
  let inDouble = false;
  let inTemplateString = false;
  let inRegex = false;
  let curly = 0;
  let square = 0;
  let paren = 0;
  let lastFilterIndex = 0;
  let c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) inSingle = false;
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false;
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false;
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false;
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1;
        let p;
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  const i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    const name = filter.slice(0, i);
    const args = filter.slice(i + 1);
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}

/*  */



/* eslint-disable no-unused-vars */
function baseWarn (msg, range) {
  console.error(`[Vue compiler]: ${msg}`);
}
/* eslint-enable no-unused-vars */

function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(m => m[key]).filter(_ => _)
    : []
}

function addProp (el, name, value, range, dynamic) {
  (el.props || (el.props = [])).push(rangeSetItem({ name, value, dynamic }, range));
  el.plain = false;
}

function addAttr (el, name, value, range, dynamic) {
  const attrs = dynamic
    ? (el.dynamicAttrs || (el.dynamicAttrs = []))
    : (el.attrs || (el.attrs = []));
  attrs.push(rangeSetItem({ name, value, dynamic }, range));
  el.plain = false;
}

// add a raw attr (use this in preTransforms)
function addRawAttr (el, name, value, range) {
  el.attrsMap[name] = value;
  el.attrsList.push(rangeSetItem({ name, value }, range));
}

function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  isDynamicArg,
  modifiers,
  range
) {
  (el.directives || (el.directives = [])).push(rangeSetItem({
    name,
    rawName,
    value,
    arg,
    isDynamicArg,
    modifiers
  }, range));
  el.plain = false;
}

function prependModifierMarker (symbol, name, dynamic) {
  return dynamic
    ? `_p(${name},"${symbol}")`
    : symbol + name // mark the event as captured
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important,
  warn,
  range,
  dynamic
) {
  modifiers = modifiers || emptyObject;
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
     warn &&
    modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.',
      range
    );
  }

  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) {
    if (dynamic) {
      name = `(${name})==='click'?'contextmenu':(${name})`;
    } else if (name === 'click') {
      name = 'contextmenu';
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    if (dynamic) {
      name = `(${name})==='click'?'mouseup':(${name})`;
    } else if (name === 'click') {
      name = 'mouseup';
    }
  }

  // check capture modifier
  if (modifiers.capture) {
    delete modifiers.capture;
    name = prependModifierMarker('!', name, dynamic);
  }
  if (modifiers.once) {
    delete modifiers.once;
    name = prependModifierMarker('~', name, dynamic);
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    delete modifiers.passive;
    name = prependModifierMarker('&', name, dynamic);
  }

  let events;
  if (modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  const newHandler = rangeSetItem({ value: value.trim(), dynamic }, range);
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  const handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  el.plain = false;
}

function getRawBindingAttr (
  el,
  name
) {
  return el.rawAttrsMap[':' + name] ||
    el.rawAttrsMap['v-bind:' + name] ||
    el.rawAttrsMap[name]
}

function getBindingAttr (
  el,
  name,
  getStatic
) {
  const dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
function getAndRemoveAttr (
  el,
  name,
  removeFromMap
) {
  let val;
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val
}

function getAndRemoveAttrByRegex (
  el,
  name
) {
  const list = el.attrsList;
  for (let i = 0, l = list.length; i < l; i++) {
    const attr = list[i];
    if (name.test(attr.name)) {
      list.splice(i, 1);
      return attr
    }
  }
}

function rangeSetItem (
  item,
  range
) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }
    if (range.end != null) {
      item.end = range.end;
    }
  }
  return item
}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
function genComponentModel (
  el,
  value,
  modifiers
) {
  const { number, trim } = modifiers || {};

  const baseValueExpression = '$$v';
  let valueExpression = baseValueExpression;
  if (trim) {
    valueExpression =
      `(typeof ${baseValueExpression} === 'string'` +
      `? ${baseValueExpression}.trim()` +
      `: ${baseValueExpression})`;
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`;
  }
  const assignment = genAssignmentCode(value, valueExpression);

  el.model = {
    value: `(${value})`,
    expression: JSON.stringify(value),
    callback: `function (${baseValueExpression}) {${assignment}}`
  };
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
function genAssignmentCode (
  value,
  assignment
) {
  const res = parseModel(value);
  if (res.key === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

let len, str, chr, index$1, expressionPos, expressionEndPos;



function parseModel (val) {
  // Fix https://github.com/vuejs/vue/pull/7730
  // allow v-model="obj.val " (trailing whitespace)
  val = val.trim();
  len = val.length;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index$1 = val.lastIndexOf('.');
    if (index$1 > -1) {
      return {
        exp: val.slice(0, index$1),
        key: '"' + val.slice(index$1 + 1) + '"'
      }
    } else {
      return {
        exp: val,
        key: null
      }
    }
  }

  str = val;
  index$1 = expressionPos = expressionEndPos = 0;

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos)
  }
}

function next () {
  return str.charCodeAt(++index$1)
}

function eof () {
  return index$1 >= len
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
  let inBracket = 1;
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) inBracket++;
    if (chr === 0x5D) inBracket--;
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

function parseString (chr) {
  const stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

let warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
const RANGE_TOKEN = '__r';
const CHECKBOX_RADIO_TOKEN = '__c';

function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  const value = dir.value;
  const modifiers = dir.modifiers;
  const tag = el.tag;
  const type = el.attrsMap.type;

  {
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn$1(
        `<${el.tag} v-model="${value}" type="file">:\n` +
        `File inputs are read only. Use a v-on:change listener instead.`,
        el.rawAttrsMap['v-model']
      );
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else {
    warn$1(
      `<${el.tag} v-model="${value}">: ` +
      `v-model is not supported on this element type. ` +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    );
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el,
  value,
  modifiers
) {
  const number = modifiers && modifiers.number;
  const valueBinding = getBindingAttr(el, 'value') || 'null';
  const trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  const falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
  addProp(el, 'checked',
    `Array.isArray(${value})` +
    `?_i(${value},${valueBinding})>-1` + (
      trueValueBinding === 'true'
        ? `:(${value})`
        : `:_q(${value},${trueValueBinding})`
    )
  );
  addHandler(el, 'change',
    `var $$a=${value},` +
        '$$el=$event.target,' +
        `$$c=$$el.checked?(${trueValueBinding}):(${falseValueBinding});` +
    'if(Array.isArray($$a)){' +
      `var $$v=${number ? '_n(' + valueBinding + ')' : valueBinding},` +
          '$$i=_i($$a,$$v);' +
      `if($$el.checked){$$i<0&&(${genAssignmentCode(value, '$$a.concat([$$v])')})}` +
      `else{$$i>-1&&(${genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')})}` +
    `}else{${genAssignmentCode(value, '$$c')}}`,
    null, true
  );
}

function genRadioModel (
  el,
  value,
  modifiers
) {
  const number = modifiers && modifiers.number;
  let valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? `_n(${valueBinding})` : valueBinding;
  addProp(el, 'checked', `_q(${value},${valueBinding})`);
  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
}

function genSelect (
  el,
  value,
  modifiers
) {
  const number = modifiers && modifiers.number;
  const selectedVal = `Array.prototype.filter` +
    `.call($event.target.options,function(o){return o.selected})` +
    `.map(function(o){var val = "_value" in o ? o._value : o.value;` +
    `return ${number ? '_n(val)' : 'val'}})`;

  const assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
  let code = `var $$selectedVal = ${selectedVal};`;
  code = `${code} ${genAssignmentCode(value, assignment)}`;
  addHandler(el, 'change', code, null, true);
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  const type = el.attrsMap.type;

  // warn if v-bind:value conflicts with v-model
  // except for inputs with v-bind:type
  {
    const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
    const typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    if (value && !typeBinding) {
      const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
      warn$1(
        `${binding}="${value}" conflicts with v-model on the same element ` +
        'because the latter already expands to a value binding internally',
        el.rawAttrsMap[binding]
      );
    }
  }

  const { lazy, number, trim } = modifiers || {};
  const needCompositionGuard = !lazy && type !== 'range';
  const event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  let valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = `$event.target.value.trim()`;
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`;
  }

  let code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`;
  }

  addProp(el, 'value', `(${value})`);
  addHandler(el, event, code, null, true);
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    const event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

let target$1;

function createOnceHandler$1 (event, handler, capture) {
  const _target = target$1; // save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  }
}

// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
const useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1 (
  name,
  handler,
  capture,
  passive
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    const attachedTimestamp = currentFlushTimestamp;
    const original = handler;
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    };
  }
  target$1.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture, passive }
      : capture
  );
}

function remove$2 (
  name,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  );
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {};
  const oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

let svgContainer;

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  let key, cur;
  const elm = vnode.elm;
  const oldProps = oldVnode.data.domProps || {};
  let props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) vnode.children.length = 0;
      if (cur === oldProps[key]) continue
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      const strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = `<svg>${cur}</svg>`;
      const svg = svgContainer.firstChild;
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecessary `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (elm, checkVal) {
  return (!elm.composing && (
    elm.tagName === 'OPTION' ||
    isNotInFocusAndDirty(elm, checkVal) ||
    isDirtyWithModifiers(elm, checkVal)
  ))
}

function isNotInFocusAndDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  let notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers (elm, newVal) {
  const value = elm.value;
  const modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

const parseStyleText = cached(function (cssText) {
  const res = {};
  const listDelimiter = /;(?![^(]*\))/g;
  const propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  const style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  const res = {};
  let styleData;

  if (checkChild) {
    let childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (
        childNode && childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  let parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

const cssVarRE = /^--/;
const importantRE = /\s*!important$/;
const setProp = (el, name, val) => {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    const normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (let i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

const vendorNames = ['Webkit', 'Moz', 'ms'];

let emptyStyle;
const normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  const capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (let i = 0; i < vendorNames.length; i++) {
    const name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  const data = vnode.data;
  const oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  let cur, name;
  const el = vnode.elm;
  const oldStaticStyle = oldData.staticStyle;
  const oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  const oldStyle = oldStaticStyle || oldStyleBinding;

  const style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  const newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

const whitespaceRE = /\s+/;

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(c => el.classList.add(c));
    } else {
      el.classList.add(cls);
    }
  } else {
    const cur = ` ${el.getAttribute('class') || ''} `;
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(c => el.classList.remove(c));
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    let cur = ` ${el.getAttribute('class') || ''} `;
    const tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def) {
  if (!def) {
    return
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    const res = {};
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'));
    }
    extend(res, def);
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}

const autoCssTransition = cached(name => {
  return {
    enterClass: `${name}-enter`,
    enterToClass: `${name}-enter-to`,
    enterActiveClass: `${name}-enter-active`,
    leaveClass: `${name}-leave`,
    leaveToClass: `${name}-leave-to`,
    leaveActiveClass: `${name}-leave-active`
  }
});

const hasTransition = inBrowser && !isIE9;
const TRANSITION = 'transition';
const ANIMATION = 'animation';

// Transition property/event sniffing
let transitionProp = 'transition';
let transitionEndEvent = 'transitionend';
let animationProp = 'animation';
let animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
const raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ fn => fn();

function nextFrame (fn) {
  raf(() => {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  const transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) return cb()
  const event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  let ended = 0;
  const end = () => {
    el.removeEventListener(event, onEnd);
    cb();
  };
  const onEnd = e => {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

const transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  const styles = window.getComputedStyle(el);
  // JSDOM may return undefined for transition properties
  const transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  const transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  const animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  const animationTimeout = getTimeout(animationDelays, animationDurations);

  let type;
  let timeout = 0;
  let propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  const hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type,
    timeout,
    propCount,
    hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map((d, i) => {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  const el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  const data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  const {
    css,
    type,
    enterClass,
    enterToClass,
    enterActiveClass,
    appearClass,
    appearToClass,
    appearActiveClass,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled,
    beforeAppear,
    appear,
    afterAppear,
    appearCancelled,
    duration
  } = data;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  let context = activeInstance;
  let transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  const isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  const startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  const activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  const toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  const beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  const enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  const afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  const enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  const explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if ( explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  const expectsCSS = css !== false && !isIE9;
  const userWantsControl = getHookArgumentsLength(enterHook);

  const cb = el._enterCb = once(() => {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', () => {
      const parent = el.parentNode;
      const pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(() => {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  const el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  const data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return
  }

  const {
    css,
    type,
    leaveClass,
    leaveToClass,
    leaveActiveClass,
    beforeLeave,
    leave,
    afterLeave,
    leaveCancelled,
    delayLeave,
    duration
  } = data;

  const expectsCSS = css !== false && !isIE9;
  const userWantsControl = getHookArgumentsLength(leave);

  const explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if ( isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  const cb = el._leaveCb = once(() => {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(() => {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      `<transition> explicit ${name} duration is not a valid number - ` +
      `got ${JSON.stringify(val)}.`,
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      `<transition> explicit ${name} duration is NaN - ` +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  const invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules);

// * patch方法调用createPatchFunction返回的是一个函数
// * 传入的两个参数，nodeOps和modules都是和平台相关的，web和weex有不同的处理方式
// * 通过这种叫函数柯里化(curry): 只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。
// * 如果我们自己去写patch方法，而不用柯里化的技巧，我们就需要使用大量的判断，来分析不同的平台使用不同的方法。
// * modules也是在不同的case做不同的事情，也是分开的
// * 这一步过后，返回需要的patch，都已经没有平台差异化了，有差异化的参数，只是这两个nodeOps和modules
const patch = createPatchFunction({ nodeOps, modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

const directive = {
  inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', () => {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      const prevOptions = el._vOptions;
      const curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some((o, i) => !looseEqual(o, prevOptions[i]))) {
        // trigger change event if
        // no matching option found for at least one value
        const needReset = el.multiple
          ? binding.value.some(v => hasNoMatchingOption(v, curOptions))
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected (el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(() => {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected (el, binding, vm) {
  const value = binding.value;
  const isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
     warn(
      `<select multiple v-model="${binding.expression}"> ` +
      `expects an Array value for its binding, but got ${
        Object.prototype.toString.call(value).slice(8, -1)
      }`,
      vm
    );
    return
  }
  let selected, option;
  for (let i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  return options.every(o => !looseEqual(o, value))
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) return
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  const e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind (el, { value }, vnode) {
    vnode = locateNode(vnode);
    const transition = vnode.data && vnode.data.transition;
    const originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition) {
      vnode.data.show = true;
      enter(vnode, () => {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update (el, { value, oldValue }, vnode) {
    /* istanbul ignore if */
    if (!value === !oldValue) return
    vnode = locateNode(vnode);
    const transition = vnode.data && vnode.data.transition;
    if (transition) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, () => {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, () => {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: directive,
  show
};

/*  */

const transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  const compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  const data = {};
  const options = comp.$options;
  // props
  for (const key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  const listeners = options._parentListeners;
  for (const key in listeners) {
    data[camelize(key)] = listeners[key];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

const isNotTextNode = (c) => c.tag || isAsyncPlaceholder(c);

const isVShowDirective = d => d.name === 'show';

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render (h) {
    let children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(isNotTextNode);
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ( children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    const mode = this.mode;

    // warn invalid mode
    if (
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    const rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    const id = `__transition-${this._uid}-`;
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    const data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    const oldRawChild = this._vnode;
    const oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      const oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', () => {
          this._leaving = false;
          this.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        let delayedLeave;
        const performLeave = () => { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', leave => { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

const props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props,

  beforeMount () {
    const update = this._update;
    this._update = (vnode, hydrating) => {
      const restoreActiveInstance = setActiveInstance(this);
      // force removing pass
      this.__patch__(
        this._vnode,
        this.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this._vnode = this.kept;
      restoreActiveInstance();
      update.call(this, vnode, hydrating);
    };
  },

  render (h) {
    const tag = this.tag || this.$vnode.data.tag || 'span';
    const map = Object.create(null);
    const prevChildren = this.prevChildren = this.children;
    const rawChildren = this.$slots.default || [];
    const children = this.children = [];
    const transitionData = extractTransitionData(this);

    for (let i = 0; i < rawChildren.length; i++) {
      const c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else {
          const opts = c.componentOptions;
          const name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(`<transition-group> children must be keyed: <${name}>`);
        }
      }
    }

    if (prevChildren) {
      const kept = [];
      const removed = [];
      for (let i = 0; i < prevChildren.length; i++) {
        const c = prevChildren[i];
        c.data.transition = transitionData;
        c.data.pos = c.elm.getBoundingClientRect();
        if (map[c.key]) {
          kept.push(c);
        } else {
          removed.push(c);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  updated () {
    const children = this.prevChildren;
    const moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach((c) => {
      if (c.data.moved) {
        const el = c.elm;
        const s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      const clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach((cls) => { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      const info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  const oldPos = c.data.pos;
  const newPos = c.data.newPos;
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    const s = c.elm.style;
    s.transform = s.WebkitTransform = `translate(${dx}px,${dy}px)`;
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition,
  TransitionGroup
};

/*  */

// install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        );
      }
    }
    if (
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      );
    }
  }, 0);
}

/*  */

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&');
  const close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});



function parseText (
  text,
  delimiters
) {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  const tokens = [];
  const rawTokens = [];
  let lastIndex = tagRE.lastIndex = 0;
  let match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    const exp = parseFilters(match[1].trim());
    tokens.push(`_s(${exp})`);
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

/*  */

function transformNode (el, options) {
  const warn = options.warn || baseWarn;
  const staticClass = getAndRemoveAttr(el, 'class');
  if ( staticClass) {
    const res = parseText(staticClass, options.delimiters);
    if (res) {
      warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.',
        el.rawAttrsMap['class']
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData (el) {
  let data = '';
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`;
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`;
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode,
  genData
};

/*  */

function transformNode$1 (el, options) {
  const warn = options.warn || baseWarn;
  const staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    {
      const res = parseText(staticStyle, options.delimiters);
      if (res) {
        warn(
          `style="${staticStyle}": ` +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.',
          el.rawAttrsMap['style']
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

function genData$1 (el) {
  let data = '';
  if (el.staticStyle) {
    data += `staticStyle:${el.staticStyle},`;
  }
  if (el.styleBinding) {
    data += `style:(${el.styleBinding}),`;
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$1
};

/*  */

let decoder;

var he = {
  decode (html) {
    decoder = decoder || document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
  }
};

/*  */

const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/**
 * Not type-checking this file because it's mostly vendor code.
 */

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

// Special Elements (can contain anything)
const isPlainTextElement = makeMap('script,style,textarea', true);
const reCache = {};

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
};
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n';

function decodeAttr (value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, match => decodingMap[match])
}

function parseHTML (html, options) {
  const stack = [];
  const expectHTML = options.expectHTML;
  const isUnaryTag = options.isUnaryTag || no;
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no;
  let index = 0;
  let last, lastTag;
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
            }
            advance(commentEnd + 3);
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        const endTagMatch = html.match(endTag);
        if (endTagMatch) {
          const curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        const startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }
          continue
        }
      }

      let text, rest, next;
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) break
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
        text = html;
      }

      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      let endTagLength = 0;
      const stackedTag = lastTag.toLowerCase();
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest.length;
      html = rest;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if ( !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`, { start: index + html.length });
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      let end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    const tagName = match.tagName;
    const unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash;

    const l = match.attrs.length;
    const attrs = new Array(l);
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i];
      const value = args[3] || args[4] || args[5] || '';
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines;
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      };
      if ( options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length;
        attrs[i].end = args.end;
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName;
    if (start == null) start = index;
    if (end == null) end = index;

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if (
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`,
            { start: stack[i].start, end: stack[i].end }
          );
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */

const onRE = /^@|^v-on:/;
const dirRE =  /^v-|^@|^:|^#/;
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
const dynamicArgRE = /^\[.*\]$/;

const argRE = /:(.*)$/;
const bindRE = /^:|^\.|^v-bind:/;
const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

const slotRE = /^v-slot(:|$)|^#/;

const lineBreakRE = /[\r\n]/;
const whitespaceRE$1 = /\s+/g;

const invalidAttributeRE = /[\s"'<>\/=]/;

const decodeHTMLCached = cached(he.decode);

const emptySlotScopeToken = `_empty_`;

// configurable state
let warn$2;
let delimiters;
let transforms;
let preTransforms;
let postTransforms;
let platformIsPreTag;
let platformMustUseProp;
let platformGetTagNamespace;
let maybeComponent;

function createASTElement (
  tag,
  attrs,
  parent
) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: []
  }
}

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  const isReservedTag = options.isReservedTag || no;
  maybeComponent = (el) => !!el.component || !isReservedTag(el.tag);

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  const stack = [];
  const preserveWhitespace = options.preserveWhitespace !== false;
  const whitespaceOption = options.whitespace;
  let root;
  let currentParent;
  let inVPre = false;
  let inPre = false;
  let warned = false;

  function warnOnce (msg, range) {
    if (!warned) {
      warned = true;
      warn$2(msg, range);
    }
  }

  function closeElement (element) {
    trimEndingWhitespace(element);
    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    }
    // tree management
    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        {
          checkRootConstraints(element);
        }
        addIfCondition(root, {
          exp: element.elseif,
          block: element
        });
      } else {
        warnOnce(
          `Component template should contain exactly one root element. ` +
          `If you are using v-if on multiple elements, ` +
          `use v-else-if to chain them instead.`,
          { start: element.start }
        );
      }
    }
    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent);
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          const name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }
        currentParent.children.push(element);
        element.parent = currentParent;
      }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(c => !(c).slotScope);
    // remove trailing whitespace node again
    trimEndingWhitespace(element);

    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
    // apply post-transforms
    for (let i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }

  function trimEndingWhitespace (el) {
    // remove trailing whitespace node
    if (!inPre) {
      let lastNode;
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ' '
      ) {
        el.children.pop();
      }
    }
  }

  function checkRootConstraints (el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce(
        `Cannot use <${el.tag}> as component root element because it may ` +
        'contain multiple nodes.',
        { start: el.start }
      );
    }
    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce(
        'Cannot use v-for on stateful component root element because ' +
        'it renders multiple elements.',
        el.rawAttrsMap['v-for']
      );
    }
  }

  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    start (tag, attrs, unary, start, end) {
      // check namespace.
      // inherit parent ns if there is one
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      let element = createASTElement(tag, attrs, currentParent);
      if (ns) {
        element.ns = ns;
      }

      {
        if (options.outputSourceRange) {
          element.start = start;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce((cumulated, attr) => {
            cumulated[attr.name] = attr;
            return cumulated
          }, {});
        }
        attrs.forEach(attr => {
          if (invalidAttributeRE.test(attr.name)) {
            warn$2(
              `Invalid dynamic argument expression: attribute names cannot contain ` +
              `spaces, quotes, <, >, / or =.`,
              {
                start: attr.start + attr.name.indexOf(`[`),
                end: attr.start + attr.name.length
              }
            );
          }
        });
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
         warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>` + ', as they will not be parsed.',
          { start: element.start }
        );
      }

      // apply pre-transforms
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else if (!element.processed) {
        // structural directives
        processFor(element);
        processIf(element);
        processOnce(element);
      }

      if (!root) {
        root = element;
        {
          checkRootConstraints(root);
        }
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        closeElement(element);
      }
    },

    end (tag, start, end) {
      const element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      if ( options.outputSourceRange) {
        element.end = end;
      }
      closeElement(element);
    },

    chars (text, start, end) {
      if (!currentParent) {
        {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.',
              { start }
            );
          } else if ((text = text.trim())) {
            warnOnce(
              `text "${text}" outside root element will be ignored.`,
              { start }
            );
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      const children = currentParent.children;
      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = '';
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' ';
        } else {
          text = ' ';
        }
      } else {
        text = preserveWhitespace ? ' ' : '';
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE$1, ' ');
        }
        let res;
        let child;
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text
          };
        }
        if (child) {
          if ( options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          children.push(child);
        }
      }
    },
    comment (text, start, end) {
      // adding anything as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        const child = {
          type: 3,
          text,
          isComment: true
        };
        if ( options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    }
  });
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  const list = el.attrsList;
  const len = list.length;
  if (len) {
    const attrs = el.attrs = new Array(len);
    for (let i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value)
      };
      if (list[i].start != null) {
        attrs[i].start = list[i].start;
        attrs[i].end = list[i].end;
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processElement (
  element,
  options
) {
  processKey(element);

  // determine whether this is a plain element after
  // removing structural attributes
  element.plain = (
    !element.key &&
    !element.scopedSlots &&
    !element.attrsList.length
  );

  processRef(element);
  processSlotContent(element);
  processSlotOutlet(element);
  processComponent(element);
  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }
  processAttrs(element);
  return element
}

function processKey (el) {
  const exp = getBindingAttr(el, 'key');
  if (exp) {
    {
      if (el.tag === 'template') {
        warn$2(
          `<template> cannot be keyed. Place the key on real elements instead.`,
          getRawBindingAttr(el, 'key')
        );
      }
      if (el.for) {
        const iterator = el.iterator2 || el.iterator1;
        const parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$2(
            `Do not use v-for index as key on <transition-group> children, ` +
            `this is the same as not using keys.`,
            getRawBindingAttr(el, 'key'),
            true /* tip */
          );
        }
      }
    }
    el.key = exp;
  }
}

function processRef (el) {
  const ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor (el) {
  let exp;
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const res = parseFor(exp);
    if (res) {
      extend(el, res);
    } else {
      warn$2(
        `Invalid v-for expression: ${exp}`,
        el.rawAttrsMap['v-for']
      );
    }
  }
}



function parseFor (exp) {
  const inMatch = exp.match(forAliasRE);
  if (!inMatch) return
  const res = {};
  res.for = inMatch[2].trim();
  const alias = inMatch[1].trim().replace(stripParensRE, '');
  const iteratorMatch = alias.match(forIteratorRE);
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim();
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    res.alias = alias;
  }
  return res
}

function processIf (el) {
  const exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions (el, parent) {
  const prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else {
    warn$2(
      `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
      `used on element <${el.tag}> without corresponding v-if.`,
      el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
    );
  }
}

function findPrevElement (children) {
  let i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ( children[i].text !== ' ') {
        warn$2(
          `text "${children[i].text.trim()}" between v-if and v-else(-if) ` +
          `will be ignored.`,
          children[i]
        );
      }
      children.pop();
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

function processOnce (el) {
  const once = getAndRemoveAttr(el, 'v-once');
  if (once != null) {
    el.once = true;
  }
}

// handle content being passed to a component as slot,
// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent (el) {
  let slotScope;
  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope');
    /* istanbul ignore if */
    if ( slotScope) {
      warn$2(
        `the "scope" attribute for scoped slots have been deprecated and ` +
        `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
        `can also be used on plain elements in addition to <template> to ` +
        `denote scoped slots.`,
        el.rawAttrsMap['scope'],
        true
      );
    }
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
    /* istanbul ignore if */
    if ( el.attrsMap['v-for']) {
      warn$2(
        `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
        `(v-for takes higher priority). Use a wrapper <template> for the ` +
        `scoped slot to make it clearer.`,
        el.rawAttrsMap['slot-scope'],
        true
      );
    }
    el.slotScope = slotScope;
  }

  // slot="xxx"
  const slotTarget = getBindingAttr(el, 'slot');
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
    // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.
    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
    }
  }

  // 2.6 v-slot syntax
  {
    if (el.tag === 'template') {
      // v-slot on <template>
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        {
          if (el.slotTarget || el.slotScope) {
            warn$2(
              `Unexpected mixed usage of different slot syntaxes.`,
              el
            );
          }
          if (el.parent && !maybeComponent(el.parent)) {
            warn$2(
              `<template v-slot> can only appear at the root level inside ` +
              `the receiving component`,
              el
            );
          }
        }
        const { name, dynamic } = getSlotName(slotBinding);
        el.slotTarget = name;
        el.slotTargetDynamic = dynamic;
        el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
      }
    } else {
      // v-slot on component, denotes default slot
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        {
          if (!maybeComponent(el)) {
            warn$2(
              `v-slot can only be used on components or <template>.`,
              slotBinding
            );
          }
          if (el.slotScope || el.slotTarget) {
            warn$2(
              `Unexpected mixed usage of different slot syntaxes.`,
              el
            );
          }
          if (el.scopedSlots) {
            warn$2(
              `To avoid scope ambiguity, the default slot should also use ` +
              `<template> syntax when there are other named slots.`,
              slotBinding
            );
          }
        }
        // add the component's children to its default slot
        const slots = el.scopedSlots || (el.scopedSlots = {});
        const { name, dynamic } = getSlotName(slotBinding);
        const slotContainer = slots[name] = createASTElement('template', [], el);
        slotContainer.slotTarget = name;
        slotContainer.slotTargetDynamic = dynamic;
        slotContainer.children = el.children.filter((c) => {
          if (!c.slotScope) {
            c.parent = slotContainer;
            return true
          }
        });
        slotContainer.slotScope = slotBinding.value || emptySlotScopeToken;
        // remove children as they are returned from scopedSlots now
        el.children = [];
        // mark el non-plain so data gets generated
        el.plain = false;
      }
    }
  }
}

function getSlotName (binding) {
  let name = binding.name.replace(slotRE, '');
  if (!name) {
    if (binding.name[0] !== '#') {
      name = 'default';
    } else {
      warn$2(
        `v-slot shorthand syntax requires a slot name.`,
        binding
      );
    }
  }
  return dynamicArgRE.test(name)
    // dynamic [name]
    ? { name: name.slice(1, -1), dynamic: true }
    // static name
    : { name: `"${name}"`, dynamic: false }
}

// handle <slot/> outlets
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ( el.key) {
      warn$2(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`,
        getRawBindingAttr(el, 'key')
      );
    }
  }
}

function processComponent (el) {
  let binding;
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs (el) {
  const list = el.attrsList;
  let i, l, name, rawName, value, modifiers, syncGen, isDynamic;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, ''));
      // support .foo shorthand syntax for the .prop modifier
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        if (
          
          value.trim().length === 0
        ) {
          warn$2(
            `The value for a v-bind expression cannot be empty. Found in "v-bind:${name}"`
          );
        }
        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name);
            if (name === 'innerHtml') name = 'innerHTML';
          }
          if (modifiers.camel && !isDynamic) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, `$event`);
            if (!isDynamic) {
              addHandler(
                el,
                `update:${camelize(name)}`,
                syncGen,
                null,
                false,
                warn$2,
                list[i]
              );
              if (hyphenate(name) !== camelize(name)) {
                addHandler(
                  el,
                  `update:${hyphenate(name)}`,
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i]
                );
              }
            } else {
              // handler w/ dynamic event name
              addHandler(
                el,
                `"update:"+(${name})`,
                syncGen,
                null,
                false,
                warn$2,
                list[i],
                true // dynamic
              );
            }
          }
        }
        if ((modifiers && modifiers.prop) || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value, list[i], isDynamic);
        } else {
          addAttr(el, name, value, list[i], isDynamic);
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '');
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
      } else { // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        const argMatch = name.match(argRE);
        let arg = argMatch && argMatch[1];
        isDynamic = false;
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1);
            isDynamic = true;
          }
        }
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
        if ( name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      {
        const res = parseText(value, delimiters);
        if (res) {
          warn$2(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.',
            list[i]
          );
        }
      }
      addAttr(el, name, JSON.stringify(value), list[i]);
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component &&
          name === 'muted' &&
          platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i]);
      }
    }
  }
}

function checkInFor (el) {
  let parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

function parseModifiers (name) {
  const match = name.match(modifierRE);
  if (match) {
    const ret = {};
    match.forEach(m => { ret[m.slice(1)] = true; });
    return ret
  }
}

function makeAttrsMap (attrs) {
  const map = {};
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (
      
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

const ieNSBug = /^xmlns:NS\d+/;
const ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  const res = [];
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  let _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$2(
        `<${el.tag} v-model="${value}">: ` +
        `You are binding v-model directly to a v-for iteration alias. ` +
        `This will not be able to modify the v-for source array because ` +
        `writing to the alias is like modifying a function local variable. ` +
        `Consider using an array of objects and use v-model on an object property instead.`,
        el.rawAttrsMap['v-model']
      );
    }
    _el = _el.parent;
  }
}

/*  */

function preTransformNode (el, options) {
  if (el.tag === 'input') {
    const map = el.attrsMap;
    if (!map['v-model']) {
      return
    }

    let typeBinding;
    if (map[':type'] || map['v-bind:type']) {
      typeBinding = getBindingAttr(el, 'type');
    }
    if (!map.type && !typeBinding && map['v-bind']) {
      typeBinding = `(${map['v-bind']}).type`;
    }

    if (typeBinding) {
      const ifCondition = getAndRemoveAttr(el, 'v-if', true);
      const ifConditionExtra = ifCondition ? `&&(${ifCondition})` : ``;
      const hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
      const elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
      // 1. checkbox
      const branch0 = cloneASTElement(el);
      // process for on the main node
      processFor(branch0);
      addRawAttr(branch0, 'type', 'checkbox');
      processElement(branch0, options);
      branch0.processed = true; // prevent it from double-processed
      branch0.if = `(${typeBinding})==='checkbox'` + ifConditionExtra;
      addIfCondition(branch0, {
        exp: branch0.if,
        block: branch0
      });
      // 2. add radio else-if condition
      const branch1 = cloneASTElement(el);
      getAndRemoveAttr(branch1, 'v-for', true);
      addRawAttr(branch1, 'type', 'radio');
      processElement(branch1, options);
      addIfCondition(branch0, {
        exp: `(${typeBinding})==='radio'` + ifConditionExtra,
        block: branch1
      });
      // 3. other
      const branch2 = cloneASTElement(el);
      getAndRemoveAttr(branch2, 'v-for', true);
      addRawAttr(branch2, ':type', typeBinding);
      processElement(branch2, options);
      addIfCondition(branch0, {
        exp: ifCondition,
        block: branch2
      });

      if (hasElse) {
        branch0.else = true;
      } else if (elseIfCondition) {
        branch0.elseif = elseIfCondition;
      }

      return branch0
    }
  }
}

function cloneASTElement (el) {
  return createASTElement(el.tag, el.attrsList.slice(), el.parent)
}

var model$1 = {
  preTransformNode
};

var modules$1 = [
  klass$1,
  style$1,
  model$1
];

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', `_s(${dir.value})`, dir);
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', `_s(${dir.value})`, dir);
  }
}

var directives$1 = {
  model,
  text,
  html
};

/*  */

const baseOptions = {
  expectHTML: true,
  modules: modules$1,
  directives: directives$1,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules$1)
};

/*  */

let isStaticKey;
let isPlatformReservedTag;

const genStaticKeysCached = cached(genStaticKeys$1);

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
function optimize (root, options) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic$1(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic$1 (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i];
      markStatic$1(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor);
      }
    }
  }
}

function isStatic (node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
const fnInvokeRE = /\([^)]*?\);*$/;
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

// KeyboardEvent.keyCode aliases
const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// KeyboardEvent.key aliases
const keyNames = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
const genGuard = condition => `if(${condition})return null;`;

const modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`)
};

function genHandlers (
  events,
  isNative
) {
  const prefix = isNative ? 'nativeOn:' : 'on:';
  let staticHandlers = ``;
  let dynamicHandlers = ``;
  for (const name in events) {
    const handlerCode = genHandler(events[name]);
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += `${name},${handlerCode},`;
    } else {
      staticHandlers += `"${name}":${handlerCode},`;
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`;
  if (dynamicHandlers) {
    return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`
  } else {
    return prefix + staticHandlers
  }
}

function genHandler (handler) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }

  const isMethodPath = simplePathRE.test(handler.value);
  const isFunctionExpression = fnExpRE.test(handler.value);
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value
    }
    return `function($event){${
      isFunctionInvocation ? `return ${handler.value}` : handler.value
    }}` // inline statement
  } else {
    let code = '';
    let genModifierCode = '';
    const keys = [];
    for (const key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else if (key === 'exact') {
        const modifiers = (handler.modifiers);
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(keyModifier => !modifiers[keyModifier])
            .map(keyModifier => `$event.${keyModifier}Key`)
            .join('||')
        );
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    const handlerCode = isMethodPath
      ? `return ${handler.value}.apply(null, arguments)`
      : isFunctionExpression
        ? `return (${handler.value}).apply(null, arguments)`
        : isFunctionInvocation
          ? `return ${handler.value}`
          : handler.value;
    return `function($event){${code}${handlerCode}}`
  }
}

function genKeyFilter (keys) {
  return (
    // make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    `if(!$event.type.indexOf('key')&&` +
    `${keys.map(genFilterCode).join('&&')})return null;`
  )
}

function genFilterCode (key) {
  const keyVal = parseInt(key, 10);
  if (keyVal) {
    return `$event.keyCode!==${keyVal}`
  }
  const keyCode = keyCodes[key];
  const keyName = keyNames[key];
  return (
    `_k($event.keyCode,` +
    `${JSON.stringify(key)},` +
    `${JSON.stringify(keyCode)},` +
    `$event.key,` +
    `${JSON.stringify(keyName)}` +
    `)`
  )
}

/*  */

function on (el, dir) {
  if ( dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`);
  }
  el.wrapListeners = (code) => `_g(${code},${dir.value})`;
}

/*  */

function bind$1 (el, dir) {
  el.wrapData = (code) => {
    return `_b(${code},'${el.tag}',${dir.value},${
      dir.modifiers && dir.modifiers.prop ? 'true' : 'false'
    }${
      dir.modifiers && dir.modifiers.sync ? ',true' : ''
    })`
  };
}

/*  */

var baseDirectives = {
  on,
  bind: bind$1,
  cloak: noop
};

/*  */





class CodegenState {
  
  
  
  
  
  
  
  
  

  constructor (options) {
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, 'transformCode');
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
    this.directives = extend(extend({}, baseDirectives), options.directives);
    const isReservedTag = options.isReservedTag || no;
    this.maybeComponent = (el) => !!el.component || !isReservedTag(el.tag);
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
  }
}



function generate (
  ast,
  options
) {
  const state = new CodegenState(options);
  const code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    let code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      let data;
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData$2(el, state);
      }

      const children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`;
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code
  }
}

// hoist static sub-trees out
function genStatic (el, state) {
  el.staticProcessed = true;
  // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.
  const originalPreState = state.pre;
  if (el.pre) {
    state.pre = el.pre;
  }
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`);
  state.pre = originalPreState;
  return `_m(${
    state.staticRenderFns.length - 1
  }${
    el.staticInFor ? ',true' : ''
  })`
}

// v-once
function genOnce (el, state) {
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    let key = '';
    let parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
       state.warn(
        `v-once can only be used inside v-for that is keyed. `,
        el.rawAttrsMap['v-once']
      );
      return genElement(el, state)
    }
    return `_o(${genElement(el, state)},${state.onceId++},${key})`
  } else {
    return genStatic(el, state)
  }
}

function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  const condition = conditions.shift();
  if (condition.exp) {
    return `(${condition.exp})?${
      genTernaryExp(condition.block)
    }:${
      genIfConditions(conditions, state, altGen, altEmpty)
    }`
  } else {
    return `${genTernaryExp(condition.block)}`
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  const exp = el.for;
  const alias = el.alias;
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : '';
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : '';

  if (
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
      `v-for should have explicit keys. ` +
      `See https://vuejs.org/guide/list.html#key for more info.`,
      el.rawAttrsMap['v-for'],
      true /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion
  return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${(altGen || genElement)(el, state)}` +
    '})'
}

function genData$2 (el, state) {
  let data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el, state);
  if (dirs) data += dirs + ',';

  // key
  if (el.key) {
    data += `key:${el.key},`;
  }
  // ref
  if (el.ref) {
    data += `ref:${el.ref},`;
  }
  if (el.refInFor) {
    data += `refInFor:true,`;
  }
  // pre
  if (el.pre) {
    data += `pre:true,`;
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += `tag:"${el.tag}",`;
  }
  // module data generation functions
  for (let i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`;
  }
  // DOM props
  if (el.props) {
    data += `domProps:${genProps(el.props)},`;
  }
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false)},`;
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true)},`;
  }
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += `slot:${el.slotTarget},`;
  }
  // scoped slots
  if (el.scopedSlots) {
    data += `${genScopedSlots(el, el.scopedSlots, state)},`;
  }
  // component v-model
  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`;
  }
  // inline-template
  if (el.inlineTemplate) {
    const inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += `${inlineTemplate},`;
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind dynamic argument wrap
  // v-bind with dynamic arguments must be applied using the same v-bind object
  // merge helper so that class/style/mustUseProp attrs are handled correctly.
  if (el.dynamicAttrs) {
    data = `_b(${data},"${el.tag}",${genProps(el.dynamicAttrs)})`;
  }
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data
}

function genDirectives (el, state) {
  const dirs = el.directives;
  if (!dirs) return
  let res = 'directives:[';
  let hasRuntime = false;
  let i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    const gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`;
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genInlineTemplate (el, state) {
  const ast = el.children[0];
  if ( (
    el.children.length !== 1 || ast.type !== 1
  )) {
    state.warn(
      'Inline-template components must have exactly one child element.',
      { start: el.start }
    );
  }
  if (ast && ast.type === 1) {
    const inlineRenderFns = generate(ast, state.options);
    return `inlineTemplate:{render:function(){${
      inlineRenderFns.render
    }},staticRenderFns:[${
      inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join(',')
    }]}`
  }
}

function genScopedSlots (
  el,
  slots,
  state
) {
  // by default scoped slots are considered "stable", this allows child
  // components with only scoped slots to skip forced updates from parent.
  // but in some cases we have to bail-out of this optimization
  // for example if the slot contains dynamic names, has v-if or v-for on them...
  let needsForceUpdate = el.for || Object.keys(slots).some(key => {
    const slot = slots[key];
    return (
      slot.slotTargetDynamic ||
      slot.if ||
      slot.for ||
      containsSlotChild(slot) // is passing down slot from parent which may be dynamic
    )
  });

  // #9534: if a component with scoped slots is inside a conditional branch,
  // it's possible for the same component to be reused but with different
  // compiled slot content. To avoid that, we generate a unique key based on
  // the generated code of all the slot contents.
  let needsKey = !!el.if;

  // OR when it is inside another scoped slot or v-for (the reactivity may be
  // disconnected due to the intermediate scope variable)
  // #9438, #9506
  // TODO: this can be further optimized by properly analyzing in-scope bindings
  // and skip force updating ones that do not actually use scope variables.
  if (!needsForceUpdate) {
    let parent = el.parent;
    while (parent) {
      if (
        (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
        parent.for
      ) {
        needsForceUpdate = true;
        break
      }
      if (parent.if) {
        needsKey = true;
      }
      parent = parent.parent;
    }
  }

  const generatedSlots = Object.keys(slots)
    .map(key => genScopedSlot(slots[key], state))
    .join(',');

  return `scopedSlots:_u([${generatedSlots}]${
    needsForceUpdate ? `,null,true` : ``
  }${
    !needsForceUpdate && needsKey ? `,null,false,${hash(generatedSlots)}` : ``
  })`
}

function hash(str) {
  let hash = 5381;
  let i = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0
}

function containsSlotChild (el) {
  if (el.type === 1) {
    if (el.tag === 'slot') {
      return true
    }
    return el.children.some(containsSlotChild)
  }
  return false
}

function genScopedSlot (
  el,
  state
) {
  const isLegacySyntax = el.attrsMap['slot-scope'];
  if (el.if && !el.ifProcessed && !isLegacySyntax) {
    return genIf(el, state, genScopedSlot, `null`)
  }
  if (el.for && !el.forProcessed) {
    return genFor(el, state, genScopedSlot)
  }
  const slotScope = el.slotScope === emptySlotScopeToken
    ? ``
    : String(el.slotScope);
  const fn = `function(${slotScope}){` +
    `return ${el.tag === 'template'
      ? el.if && isLegacySyntax
        ? `(${el.if})?${genChildren(el, state) || 'undefined'}:undefined`
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)
    }}`;
  // reverse proxy v-slot without scope on this.$slots
  const reverseProxy = slotScope ? `` : `,proxy:true`;
  return `{key:${el.slotTarget || `"default"`},fn:${fn}${reverseProxy}}`
}

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  const children = el.children;
  if (children.length) {
    const el = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el.for &&
      el.tag !== 'template' &&
      el.tag !== 'slot'
    ) {
      const normalizationType = checkSkip
        ? state.maybeComponent(el) ? `,1` : `,0`
        : ``;
      return `${(altGenElement || genElement)(el, state)}${normalizationType}`
    }
    const normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    const gen = altGenNode || genNode;
    return `[${children.map(c => gen(c, state)).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children,
  maybeComponent
) {
  let res = 0;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))) {
      res = 1;
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}

function genComment (comment) {
  return `_e(${JSON.stringify(comment.text)})`
}

function genSlot (el, state) {
  const slotName = el.slotName || '"default"';
  const children = genChildren(el, state);
  let res = `_t(${slotName}${children ? `,${children}` : ''}`;
  const attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(attr => ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      })))
    : null;
  const bind = el.attrsMap['v-bind'];
  if ((attrs || bind) && !children) {
    res += `,null`;
  }
  if (attrs) {
    res += `,${attrs}`;
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName,
  el,
  state
) {
  const children = el.inlineTemplate ? null : genChildren(el, state, true);
  return `_c(${componentName},${genData$2(el, state)}${
    children ? `,${children}` : ''
  })`
}

function genProps (props) {
  let staticProps = ``;
  let dynamicProps = ``;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const value =  transformSpecialNewlines(prop.value);
    if (prop.dynamic) {
      dynamicProps += `${prop.name},${value},`;
    } else {
      staticProps += `"${prop.name}":${value},`;
    }
  }
  staticProps = `{${staticProps.slice(0, -1)}}`;
  if (dynamicProps) {
    return `_d(${staticProps},[${dynamicProps.slice(0, -1)}])`
  } else {
    return staticProps
  }
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */



// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
const prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
const unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// strip strings in expressions
const stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast, warn) {
  if (ast) {
    checkNode(ast, warn);
  }
}

function checkNode (node, warn) {
  if (node.type === 1) {
    for (const name in node.attrsMap) {
      if (dirRE.test(name)) {
        const value = node.attrsMap[name];
        if (value) {
          const range = node.rawAttrsMap[name];
          if (name === 'v-for') {
            checkFor(node, `v-for="${value}"`, warn, range);
          } else if (name === 'v-slot' || name[0] === '#') {
            checkFunctionParameterExpression(value, `${name}="${value}"`, warn, range);
          } else if (onRE.test(name)) {
            checkEvent(value, `${name}="${value}"`, warn, range);
          } else {
            checkExpression(value, `${name}="${value}"`, warn, range);
          }
        }
      }
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], warn);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, warn, node);
  }
}

function checkEvent (exp, text, warn, range) {
  const stripped = exp.replace(stripStringRE, '');
  const keywordMatch = stripped.match(unaryOperatorsRE);
  if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
    warn(
      `avoid using JavaScript unary operator as property name: ` +
      `"${keywordMatch[0]}" in expression ${text.trim()}`,
      range
    );
  }
  checkExpression(exp, text, warn, range);
}

function checkFor (node, text, warn, range) {
  checkExpression(node.for || '', text, warn, range);
  checkIdentifier(node.alias, 'v-for alias', text, warn, range);
  checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
  checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
}

function checkIdentifier (
  ident,
  type,
  text,
  warn,
  range
) {
  if (typeof ident === 'string') {
    try {
      new Function(`var ${ident}=_`);
    } catch (e) {
      warn(`invalid ${type} "${ident}" in expression: ${text.trim()}`, range);
    }
  }
}

function checkExpression (exp, text, warn, range) {
  try {
    new Function(`return ${exp}`);
  } catch (e) {
    const keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      warn(
        `avoid using JavaScript keyword as property name: ` +
        `"${keywordMatch[0]}"\n  Raw expression: ${text.trim()}`,
        range
      );
    } else {
      warn(
        `invalid expression: ${e.message} in\n\n` +
        `    ${exp}\n\n` +
        `  Raw expression: ${text.trim()}\n`,
        range
      );
    }
  }
}

function checkFunctionParameterExpression (exp, text, warn, range) {
  try {
    new Function(exp, '');
  } catch (e) {
    warn(
      `invalid function parameter expression: ${e.message} in\n\n` +
      `    ${exp}\n\n` +
      `  Raw expression: ${text.trim()}\n`,
      range
    );
  }
}

/*  */

const range = 2;

function generateCodeFrame (
  source,
  start = 0,
  end = source.length
) {
  const lines = source.split(/\r?\n/);
  let count = 0;
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        res.push(`${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j]}`);
        const lineLength = lines[j].length;
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1;
          const length = end > count ? lineLength - pad : end - start;
          res.push(`   |  ` + repeat(` `, pad) + repeat(`^`, length));
        } else if (j > i) {
          if (end > count) {
            const length = Math.min(end - count, lineLength);
            res.push(`   |  ` + repeat(`^`, length));
          }
          count += lineLength + 1;
        }
      }
      break
    }
  }
  return res.join('\n')
}

function repeat (str, n) {
  let result = '';
  if (n > 0) {
    while (true) { // eslint-disable-line
      if (n & 1) result += str;
      n >>>= 1;
      if (n <= 0) break
      str += str;
    }
  }
  return result
}

/*  */



function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code });
    return noop
  }
}

function createCompileToFunctionFn (compile) {
  const cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = extend({}, options);
    const warn$1 = options.warn || warn;
    delete options.warn;

    /* istanbul ignore if */
    {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn$1(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
        }
      }
    }

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options);

    // check compilation errors/tips
    {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(e => {
            warn$1(
              `Error compiling template:\n\n${e.msg}\n\n` +
              generateCodeFrame(template, e.start, e.end),
              vm
            );
          });
        } else {
          warn$1(
            `Error compiling template:\n\n${template}\n\n` +
            compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
            vm
          );
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(e => tip(e.msg, vm));
        } else {
          compiled.tips.forEach(msg => tip(msg, vm));
        }
      }
    }

    // turn code into functions
    const res = {};
    const fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn$1(
          `Failed to generate render function:\n\n` +
          fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'),
          vm
        );
      }
    }

    return (cache[key] = res)
  }
}

/*  */

function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {
    function compile (
      template,
      options
    ) {
      const finalOptions = Object.create(baseOptions);
      const errors = [];
      const tips = [];

      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        if ( options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length;

          warn = (msg, range, tip) => {
            const data = { msg };
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength;
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength;
              }
            }
            (tip ? tips : errors).push(data);
          };
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          );
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      finalOptions.warn = warn;

      const compiled = baseCompile(template.trim(), finalOptions);
      {
        detectErrors(compiled.ast, warn);
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
const createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  const ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
});

/*  */

const { compile, compileToFunctions } = createCompiler(baseOptions);

/*  */

// check whether current browser encodes a char inside attribute values
let div;
function getShouldDecode (href) {
  div = div || document.createElement('div');
  div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`;
  return div.innerHTML.indexOf('&#10;') > 0
}

// #3663: IE encodes newlines inside attribute values while other browsers don't
const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
// #6828: chrome encodes content in a[href]
const shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

/*  */

const idToTemplate = cached(id => {
  const el = query(id);
  return el && el.innerHTML
});

// * 首先获取到了原型上的$mount方法，然后使用mount缓存起来
const mount = Vue.prototype.$mount;
// * 为什么要重新定义一遍，主要是因为上面的mount是给runtime-only版本直接用的，下面这一块的逻辑在runtime-only中是没有的
// * el参数可以是一个字符串也可以是一个Element节点
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && query(el);

  /* istanbul ignore if */
  // * 如果el是一个body或者是html文档标签，那么就会抛错，然后直接返回
  // * 如果是body或者html标签，在编译之后就会直接将body或者html标签直接覆盖了，会导致整个html文档就错了，因此在开发环境直接报错
  if (el === document.body || el === document.documentElement) {
     warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    );
    return this
  }

  const options = this.$options;
  // resolve template/el and convert to render function
  // * 判断是否定义了render方法
  if (!options.render) {
    // * 判断是否存在template
    let template = options.template;
    if (template) {
      // * template可以是一个"#xxx"这种形式
      if (typeof template === 'string') {
        // * 如果template是一个string，并且是#开头，那么将执行idToTemplate，判断是否存在该id的选择器，如果存在则返回该选择器下面的内容赋值给template，如果不存在，则template会得到一个空字符串
        // * 如果template是一个空字符串，那么在开发环境就会抛错
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ( !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            );
          }
        }
      } else if (template.nodeType) {
        // * 如果template是一个标签，那么就将内部的所有节点取出来，赋值给新的template
        template = template.innerHTML;
      } else {
        // * 如果存在template，但是既不是一个string也不是一个ELement，直接抛错
        {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      // * 如果没有template有el，则获取el所在的dom节点，如果el所在的dom节点不存在，则创建一个空的div,拿到div的InnerHTML
      // ! outerHTML是一个字符串,此处的template是一个字符串
      template = getOuterHTML(el);
    }
    if (template) {
      // * 以下为编译部分
      /* istanbul ignore if */
      if ( config.performance && mark) {
        mark('compile');
      }

      // * 通过compileToFunctions编译函数拿到一个render函数和静态staticRenderFns函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      // * 然后赋值给options的render函数和staticRender函数
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if ( config.performance && mark) {
        mark('compile end');
        measure(`vue ${this._name} compile`, 'compile', 'compile end');
      }
    }
  }
  // * 这一步$mount主要就是拿到el，然后判断是否存在render函数，如果没有render函数，就把template转换为一个render函数
  // * 也就是说Vue只认识一个render函数，如果说有render函数，那就直接忽略上面所有的步骤，直接走到这一步
  // * 这里的this指向Vue实例
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
  if (el.outerHTML) {
    // * 如果存在则返回el本身的标签
    return el.outerHTML
  } else {
    // * 如果不存在则创建一个新的标签并返回
    const container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions;

export default Vue;
