# vue源码
## vue目录结构
### compller
在vue2.0时，vue新增了virtualDom，virtualDom的生成，实际上是执行的render function，在使用的时候很少手写render function，在这里，主要就是template转化为render function。编译相关的都在这里
### core
#### components
主要是内置的组件keep-alive
#### global-api
主要是一些api如全局混入mixin，Vue.use， Vue.extends(和mixin类似，允许扩展某一组件，也就是继承某一组件)之类的
#### instance
其中主要包含了渲染的辅助函数，事件，初始化，注入，代理，渲染函数，生命周期，状态之类的
#### observe
和响应相关，也是vue的核心概念
#### util
主要是工具方法都在这里
#### vdom
主要是核心virtualDom的核心代码
### platforms
#### web
主要是开发的浏览器的程序
#### weex
vue推出一个类似于react-native的一个跨端应用

也就是说vue可以编译出运行在web平台的，也可以编译出其他平台的，像美团开源的mpvue也就是在platforms下新增了相关的逻辑。
可以从不同的入口平台下，编译出不同的vuejs
### server
server目录中存在所有和服务端渲染相关的代码，从2.0以后，服务端渲染也是vue的一个核心功能
### sfc
一个简单的解释器，可以将vue的文件编译成一个js对象
### shared
一些辅助方法，比如常量，工具方法，他是可以被所有目录共享的辅助方法

## 目录小结
从目录就可以看出作者将功能模块拆分的非常清除，相关的逻辑放在一个独立的目录下维护，并且把复用的代码也抽成一个独立目录。
这样的目录设计让代码的阅读性和可维护性都变强，非常值得学习和借鉴

## 数据驱动
Vue.js的核心思想——数据驱动
### 数据驱动
指的是视图是由数据驱动生成的，我们对视图的修改，不会直接操作DOM，而是通过修改数据。它相比我们传统的前端开发，如使用JQ直接修改DOM，大大简化了代码量。特别是在复杂交互，只关心数据的修改会让代码逻辑变得非常清晰。因为DOM变成了数据的映射，因此所有的逻辑都只需要对数据进行修改，而不用去碰触DOM。

简而言之就是，数据驱动视图，视图的变化，让视图也跟着变化

在Vue.js中我们可以采用简洁的模板语法来声明书的将数据渲染为DOM

### new Vue发生了什么?
通过一系列的初始化，最终执行$mount函数将Vue的基本配置挂载到视图上，之后在进行原型链上函数的定义以及静态方法的定义，当定义完所有的方法后

+ 初始化data
    - 在这之前，首先初始化的是props，然后是methods，然后才是初始化data，首先生命一个函数内部变量data，然后通过一次判断是否为function做不同的处理，将定义的data赋值给刚才定义的data，同时也赋值给vm._data这个私有成员，判断data的返回值是否为一个对象，如果不是一个对象则抛错，然后将data的键名都取出来分别和methods以及props作对比，如果存在相同的键名则抛错，最后通过一个代理函数，将data的每一个key都设置为可枚举属性，描述符配置为可修改，同时添加getter和setter方法，我们通过this.来访问，就会通过这个getter方法去访问this._data下面的内容，通过this.访问之后对其进行修改也是修改的this._data下面相应的内容。最后添加响应式observe
+ $mount
    - $mount方法在多个文件中都有定义，这个方法的实现是和平台、构建方式都相关的。
    - 首先看compiler版本的$mount，/src/platform/web/entry-runtime-with-compiler.js
    - 在compiler版本的$mount中，首先保留一个runtime-only版本的$mount,也就是基类，在对el做处理，查询是否存在render函数，如果不存在，则将template转换为render函数，它支持很多写法，可以是template，template也可以是一个dom节点，甚至可以是一个#id的标志，也可以不写template，通过el去获取template，然后就把template通过编译的手段转换为render函数，然后执行runtime-only的$mount函数，也就是去掉mountComponent方法，这个方法首先会判断是否在options上存在render函数，如果不存在，则创建一个空的虚拟节点，然后赋值给render函数然后在抛出警告。之后定义一个updateComponent，通过是否配置了performance来判断是否需要性能埋点，实际上他就是执行一个vm._update(vm._render(), 是否服务端渲染)，将updateComponent传入渲染Watcher的constructor中，new一个渲染Watcher实例，在constructor中通过this.get()方法执行了一次渲染，将渲染得到的值通过判断是否是lazy模式，传递给this.value,而这个渲染过程，除了首次触发之外，当视图发生变化，他的入口也是这个updateComponent,也就是说在之后的每一次update过程中，都会触发这个渲染Watcher,这就是这个渲染Watcher所做的事情。
    - 接下来还是主要分析_render函数
+ render
    - vm._render()方法，通过一系列的排错和降级，最终使用createElement()方法构造了一个VNode并返回了该VNode
+ Virtual DOM
    - Virtual DOM这个概念产生的前提是浏览器中的DOM是很“昂贵”的，为了更直观的感受，可以简单的把一个十分简单的div元素的属性都打印出来。
    ```
    let div = document.createElement('div')
    let str = ''
    for (item in div) {
        str += `${item}`
    }
    console.info(str)
    // 结果就是如下所示
    /*
        align title lang translate dir hidden accessKey draggable spellcheck 
        autocapitalize contentEditable isContentEditable inputMode offsetParent 
        offsetTop offsetLeft offsetWidth offsetHeight style innerText outerText oncopy
         oncut onpaste onabort onblur oncancel oncanplay oncanplaythrough onchange 
         onclick onclose oncontextmenu oncuechange ondblclick ondrag ondragend 
         ondragenter ondragleave ondragover ondragstart ondrop ondurationchange 
         onemptied onended onerror onfocus onformdata oninput oninvalid onkeydown 
         onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart 
         onmousedown onmouseenter onmouseleave onmousemove onmouseout onmouseover 
         onmouseup onmousewheel onpause onplay onplaying onprogress onratechange 
         onreset onresize onscroll onseeked onseeking onselect onstalled onsubmit 
         onsuspend ontimeupdate ontoggle onvolumechange onwaiting onwebkitanimationend
          onwebkitanimationiteration onwebkitanimationstart onwebkittransitionend 
          onwheel onauxclick ongotpointercapture onlostpointercapture onpointerdown 
          onpointermove onpointerup onpointercancel onpointerover onpointerout 
          onpointerenter onpointerleave onselectstart onselectionchange onanimationend
           onanimationiteration onanimationstart ontransitionend dataset nonce 
           autofocus tabIndex click attachInternals focus blur enterKeyHint 
           onpointerrawupdate namespaceURI prefix localName tagName id className 
           classList slot attributes shadowRoot part assignedSlot innerHTML outerHTML 
           scrollTop scrollLeft scrollWidth scrollHeight clientTop clientLeft 
           clientWidth clientHeight attributeStyleMap onbeforecopy onbeforecut 
           onbeforepaste onsearch elementTiming previousElementSibling 
           nextElementSibling children firstElementChild lastElementChild 
           childElementCount onfullscreenchange onfullscreenerror 
           onwebkitfullscreenchange onwebkitfullscreenerror hasAttributes 
           getAttributeNames getAttribute getAttributeNS setAttribute setAttributeNS 
           removeAttribute removeAttributeNS toggleAttribute hasAttribute 
           hasAttributeNS getAttributeNode getAttributeNodeNS setAttributeNode 
           setAttributeNodeNS removeAttributeNode attachShadow closest matches 
           webkitMatchesSelector getElementsByTagName getElementsByTagNameNS 
           getElementsByClassName insertAdjacentElement insertAdjacentText 
           setPointerCapture releasePointerCapture hasPointerCapture 
           insertAdjacentHTML requestPointerLock getClientRects getBoundingClientRect 
           scrollIntoView scroll scrollTo scrollBy scrollIntoViewIfNeeded animate 
           computedStyleMap before after replaceWith remove prepend append 
           querySelector querySelectorAll requestFullscreen webkitRequestFullScreen 
           webkitRequestFullscreen onbeforexrselect ariaAtomic ariaAutoComplete 
           ariaBusy ariaChecked ariaColCount ariaColIndex ariaColSpan ariaCurrent 
           ariaDisabled ariaExpanded ariaHasPopup ariaHidden ariaKeyShortcuts 
           ariaLabel ariaLevel ariaLive ariaModal ariaMultiLine ariaMultiSelectable 
           ariaOrientation ariaPlaceholder ariaPosInSet ariaPressed ariaReadOnly 
           ariaRelevant ariaRequired ariaRoleDescription ariaRowCount ariaRowIndex 
           ariaRowSpan ariaSelected ariaSetSize ariaSort ariaValueMax ariaValueMin 
           ariaValueNow ariaValueText ariaDescription getAnimations ELEMENT_NODE 
           ATTRIBUTE_NODE TEXT_NODE CDATA_SECTION_NODE ENTITY_REFERENCE_NODE 
           ENTITY_NODE PROCESSING_INSTRUCTION_NODE COMMENT_NODE DOCUMENT_NODE 
           DOCUMENT_TYPE_NODE DOCUMENT_FRAGMENT_NODE NOTATION_NODE 
           DOCUMENT_POSITION_DISCONNECTED DOCUMENT_POSITION_PRECEDING 
           DOCUMENT_POSITION_FOLLOWING DOCUMENT_POSITION_CONTAINS 
           DOCUMENT_POSITION_CONTAINED_BY DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC 
           nodeType nodeName baseURI isConnected ownerDocument parentNode 
           parentElement childNodes firstChild lastChild previousSibling nextSibling 
           nodeValue textContent hasChildNodes getRootNode normalize cloneNode 
           isEqualNode isSameNode compareDocumentPosition contains lookupPrefix 
           lookupNamespaceURI isDefaultNamespace insertBefore appendChild replaceChild 
           removeChild addEventListener removeEventListener dispatchEvent 
            undefined
        很大一段
    */
    ```
    可以看出，真正的DOM元素非常庞大，主要是因为浏览器的标准就把DOM设计的非常复杂。当我们频繁的去做DOM更新，会产生一定的性能问题。
    而VirtualDOM 就是一个原生的 js对象来描述DOM节点，所以它比创建一个DOM的代价要小很多。在Vue.js中，Virtual DOM 是用VNode这么一个Class去描述，他是定义在 src/core/vdom/vnode.js中

    - 实际上VNode是对真是DOM的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展VNode的灵活性以及实现一些特殊feature的。由于VNode只是用来映射真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。
    - VIrtual DOM 除了它的数据结构的定义，映射到真实DOM实际上要经历VNode的create、 diff、 patch等过程。那么在Vue.js中，VNode的create是通过之前提到的createElement方法创建的，我们接下来分析这部分的实现

+ __patch__
    - 整个patch的过程，就是将虚拟节点转换为真实的DOM，初次渲染的时候不用考虑上一次的oldVnode,直接指向的就是挂载的$el, 一般情况下就是div#app，然后将真实的$el转换为虚拟DOM，将当前节点的VNode转换为真实的DOM，并且依次将最底层的儿子节点插入到上一级的父节点中，最后在将当前节点插入到最外层的父节点也就是body中，这就是除此渲染的__patch过程
+ 初始化渲染的过程
    - 就是从new Vue开始，进入init阶段，然后是$mount挂载$el，如果是compile版本，则将template转换为render函数，如果直接就是render函数，那就略过，然后使用render函数渲染出vnode，在patch成一个真实的dom
+ patch
    - patch的整体流程： createComponent => 子组件初始化 => 子组件render => 子组件patch
    - activeInstance 为当前激活的vm实例; vm.$vnode为组件的站位vnode; vm._vnode为组件的渲染vnode
    - 嵌套组件的插入顺序是先子后父
+ 合并配置
    - 外部调用场景下的合并配置是通过mergeOptions，并遵循一定的合并策略，对于不同的key，合并策略不同
    - 组件的合并是通过initInternalComponent, 它的合并更快
    - 框架、库的设计都是类似，自身定义了默认配置，同时可以在初始化的阶段传入配置，然后merge配置，来达到定制化不同需求的目的
+ 生命周期
    - Vue.js的生命周期函数就是在初始化及数据更新过程各个阶段执行不同的钩子函数
    - 在created钩子函数中科院访问到数据，在mounted钩子函数中科院访问到DOM, 在destroyed钩子函数中科院做一些定时器销毁工作
+ 组件注册
    - 全局注册
        全局注册的组件可以在任何地方使用，因为全局注册的组件的合并策略，是在_init的过程中，往全局的vm.$options上面合并
    - 局部注册
        局部注册的组件只能在当前组件内部使用，因为局部注册的组件，在初始化过程中，会使用Vue.extend()继承一个Vue构造函数，叫做Sub，然后执行合并策略的时候，将组件的options合并到当前组件的options上，因此在其他组件内部，是无法直接访问另一个组件的options的
    - 通用组件库中的基础组件建议全局注册，而业务组件建议局部注册
+ 异步组件
    - 异步组件实现的本质是2次以上(通常是两次)渲染，先渲染成一个注释节点，当组件加载成功后，在通过resolved或者Promise的then，触发forceRender再触发$forceUpdate重新回到异步组件渲染的函数中，加载真正的组件
    - 异步组件的3中实现方式中，高级异步组件的设计是非常巧妙的，他可以通过简单的配置实现了loading、 resolve、 reject、 timeout 4种状态

## 响应式原理

### 什么是响应式对象
+ Vue.js实现响应式的核心是利用ES5的Object.defineProperty, 因此Vue.js并不兼容IE8以下的浏览器

+ Object.defineProperty(obj, prop, descriptor)方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。最主要是在descriptor中有setter和getter属性，访问使用该方法定义的属性会触发getter方法,默认为undefined, 修改该属性会触发setter方法，默认还是undefined.包括可以定义属性是否可枚举，默认为不可枚举属性

+ 响应式对象的核心就是对data、props等进行递归执行observe方法，为对象或者数组的每一层使用Object.defineProperty方法给对象添加getter和setter属性，并且给对象添加属性__ob__用于标记已经添加过响应的对象

+ Vue会把props、data等变成响应式对象，在创建过程中，发现子属性也为对象则递归把该对象变成响应式

### 响应式对象的创建过程

+ 递归调用observe，然后在new Observe()的过程中执行Observe类的构造器，为对象添加__ob__属性，数组执行observeArray，对象执行walk方法，递归的遍历所有的子孙层，将所有是对象的子孙，一层一层调用defineReactive方法，为所有的对象添加getter和setter
+ getter属性主要用于依赖收集
+ setter属性主要用于派发更新

### 依赖收集
+ 依赖收集就是订阅数据变化的watcher的收集

+ 依赖收集的目的是为了当这些响应式数据发生变化，触发他们的setter的时候，能知道应该通知哪些订阅者去做相应的逻辑处理

### 派发更新
+ 派发更新是什么？
    - 派发更新就是当数据发生改变后， 通知苏哦呦订阅了这个数据变化的watcher执行update

+ 派发更新的过程中会把所有要执行的 update 的 watcher 推入到队列中，在 nextTick 后执行flush。(所以 nextTick 本身就是一次优化，他并不会每一次都去触发这个异步方法，而是将一次tick的更新收集起来，一起执行，这个过程就称为一个tick)

### nextTick
+ 首先应该了解一下JS运行机制
    - js执行是单线程的，它是基于事件循环的。事件循环大致分为以下几个步骤:
    - 主线程之外， 还存在一个"任务队列(task queue)"。 只要异步任务有了运行结果，就在"任务队列" 之中放置一个事件
    - 一旦"执行栈"中所有的同步任务执行完毕, 系统就会读取"任务队列", 看看里面有哪些事件. 哪些对应的是异步任务, 于是结束等待状态, 进入执行栈, 开始执行
    - 主线程不断重复上面的第三步
+ tick
    - 主线程的执行过程就是一个tick，而所有的异步结果都是通过"任务队列"来调度被调度。消息队列中存放的是一个个的任务(task)。规范中规定task分为两大类, 分别是macro task(宏任务)和micro task(微任务), 并且每个macro task结束后，都要清空所有的micro task
    - 可以通过一段伪代码来演示他们的执行顺序
    ```
        for (macroTask of macroTaskQueue) {
            handleMacroTask();
            // 在一个宏任务下有很多微任务，当这个宏任务执行完了，就会遍历微任务队列，去执行微任务
            for (microTask fo microTaskQueue) {
                handleMicroTask(microTask)
            }
        }
        // 浏览器环境中，常见的宏任务有setTimeout、MessageChannel、postMessage、setImmediate
        // 常见的微任务有MutationObserver和Promise.then
    ```
+ 总结
    - nextTick就是要把执行的任务推到一个队列中， 在下一个tick同步执行
    - 数据改变后触发渲染watcher的update(), 但是watchers的flush是在nextTick后，所以重新渲染是异步的
    - 

### 检测变化的注意事项
+ 响应式数据中对于对象新增删除属性以及数组的下标访问修改和添加数据等的变化是观测不到的
+ 但是通过Vue.set()或者通过数组的'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse' 这几个API可以解决上面的问题, 本质上他们内部都手动去做了依赖更新的派发,也就是使用了ob.dep.notify()这个方法去触发了subs这个watcher队列的update

### 计算属性(2.6)
+ 在2.6的版本中计算属性的触发，依然是在所依赖的值(并且该值被订阅)发生改变时触发,巧妙的利用了订阅对象的派发更新的过程。
+ 首先计算属性初始化的时候会执行他的getter方法，他的getter方法就是我们所定义的计算属性函数，在这个函数中，要去拿data或者props中的变量，这样就会触发 data 或者 props 中订阅者的依赖收集(getter)，并且在这个时候，计算属性执行watcher.get()函数时，已经将Dep.target更新成了自己的watcher, 而在其所依赖的值(data 或者 props中的变量)的 依赖收集 过程中, 触发Dep.target.addDep(this) 这个方法 触发watcher下的 adddep(), 在执行dep.addSub(), 此时添加的sub就是Dep.target 也就是计算属性的watcher。
+ 主要是依赖项(data 或者 props 下的值) 执行dep.depend()时, 已经将他自己的getter执行完了，dep.target又恢复到了计算属性的watcher, 并且自己已经执行过一次cleanupDeps()
+ 因此在依赖收集的过程中，已经将计算属性添加到了每一个依赖项的__ob__的subs中, 当依赖项进行派发更新时候，会遍历其下所有的sub，并且执行sub.update。只要存在计算属性的watcher, 就会将计算属性watcher实例的成员dirty更新为true(是根据watcher的lazy判断的，计算属性的lazy是true)。而之后的 updateComponent 这个渲染watcher (初始化Vue的时候就已经生成的watcher实例，所有的订阅者的subs中都有) 执行watcher.run()的时候, 就会触发传入getter 也就是 updateComponent 方法，这样就会执行vm._render生成新的VNode，然后执行_update 在其中执行patch方法渲染出真实的DOM更新整个组件，完成组件的更新
+ 其中有一步很重要, 就是渲染watcher的触发，是在最后进行的，并且他的flushSchedulerQueue是最后通过 nextTick 进行一次异步触发(async = false 除外)，放在了所有watcher.update的最后面, 这样他执行的时候, 就会将这一次tick内的任务在下一次tick同步执行, 也就是下一步执行的时候，去触发的所有watcher.run()再去执行watcher.get()求值

### Watch(userWatcher)
+ userWatcher初始化于 initWatch 这个函数中, 通过遍历所有侦听属性的 key, 拿到设置的侦听属性, 一般来说, 他是一个数组, 这个数组中有一个成员, 就是预先设置的侦听属性, 然后执行 createWatcher 这个方法, 这个方法通过前期不同的判断, 对handler做处理, 如果handler直接就是一个函数('test': (newVal, oldVal) => {xxx} 这种类型的侦听属性设置方式), 那么两个判断都不会进入, options 就是undefined, 然后通过 return vm.$watch()再一次柯里化, 将options.user设置为true, 表示即将创建的 watcher 实例是一个 userWatcher, 并且提供一个回调直接触发的判断 immediate, 如果说定义 userWatcher 的时候将 immediate属性设置为true, 那么初始化 userWatcher 时就可以直接触发一次, 并且 $watch 也是一次柯里化, 闭包返回的函数是用来销毁 userWatcher 的函数. 也就是说, 最终销毁 userWatcher 时, 只需要执行一次这个闭包返回的那个函数即可.
+ new Watcher 创建 userWatcher 实例时, 会触发一次 this.get() , 将 Dep类的公有成员 target 设置为当前的 userWatcher , 并且在初始化过程中, 会执行 parsePath 得到 this.getter, this.getter 就是一个返回值为 vm[key] 的函数, key 代表 userWatcher 定义时的键名, 在 get() 中执行 this.getter.call(this.vm, this.vm), 实际上就是将当前 vue 的实例传入 getter 中, 这样访问的就是被侦听对象的 getter, 然后触发 被侦听对象的依赖收集, 执行 dep.depend(), 收集 userWatcher
+ 这样当被侦听对象被赋值的时候, 触发派发更新的时候, 就会执行 userWatcher 的 update 方法, 这样一来, 无论是直接执行 run 还是 执行 queueWatcher, 最终都会执行 userWatcher.run() 去触发 this.cb.call(this.vm, value, oldValue), 然后触发我们定义的回调
+ 如果有deep属性, 那么会在执行get的时候额外的执行一个traverse() 这个方法没有什么特别的, 主要就是将侦听对象 每一层都跑一遍, 触发每一层的getter来收集 userWatcher 的依赖, 当其中任意一层改变后, 就会触发 dep.notify() 方法去跑 userWatcher 的 update, 触发 userWatcher 的回调
+ 如果侦听属性userWatcher 侦听了一个 计算属性, 那么在 userWatcher 初始化 的过程中, 首先触发userWatcher.get(), 会将 Dep.target 置为 userWatcher, 然后在其中执行 userWatcher.getter的时候会通过 this[key] (key代表计算属性的键名) 触发计算属性的getter, 而计算属性的 getter 中会执行其依赖对象的getter进行依赖收集, 在这里有一个很关键的一步, 首先Dep.target 会更新为 computedWatcher, 在执行 computedWatcher 的依赖对象的依赖收集的时候, 也就是dep(依赖对象的dep).depend(), 触发Dep.target.addDep(this(这个this代表computedWatcher的依赖对象)), 这样, 在computedWatcher的deps数组中就包含了其依赖对象的dep, 当computedWatcher执行depend()时,触发其下deps数组中所有dep的depend, 此时的Dep.target是userWatcher, 当执行Dep.target.addDep(计算属性依赖对象的dep)时, 就会在计算属性依赖对象的dep.subs中加入userWatcher的依赖. 自此, 当计算属性的依赖发生改变触发notify时, 不仅仅有computedWatcher.update和renderWatcher.update会执行,还会触发userWatcher.update()最终在触发userWatcher.run执行 userWatcher.cb触发我们设定的回调

### 计算属性和侦听属性总结

+ 计算属性的本质是 computed watcher
+ 侦听属性的本质是 user watcher, 它还支持 depp、 sync、 immediate 等配置
+ 计算属性适合用在模板渲染中、 某个值是依赖了其他的响应式对象甚至是计算属性计算而来; 而侦听属性适用于观测某个值的变化去完成一段复杂的业务逻辑


### 组件更新过程

#### 组件更新的触发
当父组件数据发生变化后, 执行变化数据的setter, 最后执行dep.notify()去派发更新, 到renderWatcher触发run的时候触发renderWatcher的getter也就是updateComponent方法, 去执行vm._update(), 在update中执行vm._render传入render得到的vnode, 然后在执行update方法时会触发patch, 在父组件patch的过程中会执行patchVnode, 而patchVnode会触发updateChildren, 在这其中会递归的去执行vnode下面children的patchVnode, 其中遇到组件Vnode就会触发prepatch方法, 然后在prepatch中会触发updateChildComponent去更新props下面的内容, 而props的更新, 会触发子组件内props的setter, 再一次派发更新, 去执行子组件的patch方法触发子组件更新

#### 组件更新的patch
+ 新旧节点不同, patch接收四个参数, 分别是 oldVnode(旧节点), vnode(新节点), undefined, undefined
    - 首先判断是否定义了新节点, 更新组件时已经有新节点了, 因此这个判断直接跳过
    - 下一步是做一次初始化, 定义两个变量, 将 isInitialPatch 置为 false, 将insertedVnodeQueue 置为 false
    - 组件更新定义了 oldVnode, 因此进入else过程
    - 由于 oldVnode 和 vnode 都是虚拟节点, 因此他们的 nodetype 都是undefined, 所以标志变量 isRealElement 为 false
    - 此处发生变化, 由于新旧节点不同, 因此将进入 else 中
    - 由于 isRealElement 为 false, 因此直接跳过上面最大的判断
    - 存储两个变量, 一个叫做oldElm, 获取 oldVnode 上面的 elm, 也就是旧节点对应的真实DOM, 同时使用 parentElm 存储 旧节点对应的父节点(非占位符类的组件节点, 是真实的父级DOM节点)
    - 执行 createElement 函数, 使用 vnode 创建并插入新的真实DOM, 对 createElement 传入四个参数 依次为 vnode, [], parentElm, 当前组件节点的下一个节点, 若不存在, 则为空, 比如说组件为HelloWord, 他使用时是这样的 <div><hello-word :props="xxx"></hello-word><span>{{wocao}}</span></div>, 那么这最后一个参数就是这个 span 对应的dom节点
    - 接下来将执行整个三步走的第二大步骤 —— 更新父的占位符节点
    - 判断是否存在vnode.parent 也就是 组件的占位符节点, 实际上就是定义组件时使用的那个template所渲染出来的东西, 当然它对应的就是在父组件中展示出来的那个组件名
    - 存在将进入判断中, 使用ancestor祖先 变量来存储 vnode.parent, 也就是组件vnode(组件的占位符节点)
    - 判断vnode 是否是一个可挂载节点, 由于vnode不是组件vnode(占位符), 并不存在 componentInstance 并且存在tag, 因此是一个可挂载节点
    - 注： 如果vnode是一个组件内部的根节点, 但是他同时又是一个组件节点 比如 a-card 这种, 那么他就会递归去找 componentInstance下面的_vnode去找这个下面他真正的渲染vnode
    - 在DOM树往上递归, 直到不存在ancestor, 不停的去对 ancestor执行cbs中的destroy函数, 然后将vnode.elm(之前执行createElement时创建的真实DOM)赋值给ancestor.elm, 发现vnode是可挂载的vnode, 然后在循环执行c0bs中的create下面的方法, 创建新的占位符节点的相关东西, 然后在执行插入钩子, 这样就将占位符更新完成了
    - 为什么要向上递归呢, 主要是为了找到最顶层的祖先,之前就说过, 可能存在根节点是a-card这种情况, 那么他的渲染vnod实际上是a-card中的根节点 而渲染vnode 的父亲就是 a-card 而不是真实的祖先节点, 这个时候就要往上递归一次, 当然, 除此之外, 都只有一次执行, 因为当下一次执行 ancestor = ancestor.parent 的时候就已经是undefined 然后跳出循环了
    - 最后一个大的步骤, 就是删除旧的节点
    - 如果parentElm存在, 就执行removeVnodes方法, 传入 [oldVnode], 0, 0三个参数, 就是将原来的oldVnode删去, 在下一步执行 insert钩子函数, 然后返回vnode.elm
    - 结束

#### updateChildren
+ 首先定义几个变量用于标志对比两个节点的开始结束位置, 比对的开始结束的节点。接收的第一个参数表示变化节点的父亲(他们的父亲是组件更新前后没有发生变化的, 也就是说当前elm代表的就是变化节点的直接父级)
+ 变量 canMove 为true, 因为removeOnly在组件更新时为undefined, 他来自于当前节点执行patchVnode的时候传入, 最主要是来源于patch的过程中传入的最后一个参数
+ 校验一次vnode上面的key值, 若存在重复的key, 则会抛出警告
+ 此处最主要的就是while循环的过程, 这个过程是dom diff的核心
+ while
    - 只要旧的开始位置小于等于旧的结束位置并且新的开始位置小于等于新的结束位置就会不断进入循环
    - 首先判断是否不存在 oldStartVnode, 如果不存在, 则将 oldStartVnode更新为 oldCh[++oldStartIdx], 也就是在oldCh数组中的下一个节点
    - 如果存在 oldStartVnode, 但是不存在 oldEndVnode, 那么就将oldEndVnode置为所在 oldCh 中的前一个位置
    - 如果存在 oldStartVnode 并且存在 oldEndVnode 并且oldStartVnode 和 newStartVnode 满足 sameVnode 方法的判断, 那么就会执行 patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)这个方法, 执行这个方法的时候就和之前一样了, 走到 ch 和 oldCh判断的位置会执行一次 updateChildren方法, 传入 当前oldVnode, ch 和 oldCh, 这就是递归的去执行这个updateChildren, 直到最底下最后只剩下一个text节点(ch 数组中只剩下一个儿子就是一个text节点这种), 相同的text节点, 在patchVnode过程中会很快过去, 然后出来会更新 oldStartIdx和 newStartIdx 以及 oldStartVnode 和 newStartVnode, 然后执行最下面的判断
    - ##### oldEndVnode 和 newStartVnode 相同时
        执行patchVnode将 oldEndVnode上的elm赋值给newStartVnode的elm(因为他们是相同节点)顺手递归去看他们的儿子是不是一样的, 或者说是不是只剩下一个text了, 如果不是, 对他们的儿子重复上面的过程, patchVnode执行完成之后, 将判断是否canMove, 如果是, 则将oldStartVnode.elm 插入到 oldEndVnode.elm的前面, 同时将oldEndVnode往前移动一位， 将newStartVnode往后移动一位,继续循环, 直到循环结束
    - ##### oldStartVnode 和 newStartVnode 相同时
        和上述过程一样, 执行一个patchVnode将 oldStartVnode上面的elm 赋值给 newStartVnode的elm, 顺手看他们的儿子是否相同, 是否已经到最后只剩下一个text, 如果是, 则判断text是否相等, 如果不等, 则将新的text赋值给旧的elm上面, patchVnode执行结束后, 直接将oldStartVnode 往后移动一位, 将 newStartVnode 往后移动一位
    - ##### oldEndVnode 和 newEndVnode 相同时
        和上述过程一样，执行一个patchVnode后, 将oldEndVnode上的elm赋值给newStartVnode的elm, 顺手查看儿子是否需要更新,是否已经到了最后的text节点, 将oldEndVnode往前移动一个，将newEndVnode往前移动一个
    - ##### oldStartVnode 和 newEndVnode相同时
        和上述过程一样, 执行一个patchVnode后, 将oldStartVnode 上的 elm 赋值给 newEndVnode的elm, 顺手查看他们的儿子。然后判断canMove, 满足则将oldEndVnode.elm插入到oldStartVnode的下一个兄弟节点的前面, 如果下一个为空, 则到最后
    - 最后判断 oldStartInd > oldEndIdx 如果大于, 则判断是否存在newCh[newEndIdx + 1], 若不存在则将 refElm 置为null, 如果存在则置为该值的elm, 然后执行addVnodes将这个值插入父节点的儿子中(最后一级的文本节点不需要插入, 判断中的startIdx 已经大于 endIdx 了, 文本节点只需要直接继承旧节点的elm的dom属性, 上面有text表示他的文本内容), for循环执行addVnodes, 只要传入的startIdx 比 endIdx小, 就执行createElm创建新的节点, 在组件更新过程中创建的新节点都是在oldCh中没有的节点, 触发createChildren 创建文本节点, 如果存在data, 则执行invokeCreateHooks, 去执行create中的一系列update方法, 去更新 arrt class domListener props style 指令等。 最后执行插入语句, 如果有参考节点, 就插入到参考节点前, 如果没有就直接插入到最后。也就是说是更新过后新增出来的Vnode会直接插入到之前节点的最后。 判断如果 oldStartIdx <= oldEndIdx 并且 newStartIdx > newEndIdx 则移除旧节点中关于当前节点的信息
#### createElement
+ 组件更新过程中触发
    - 首先 vnode 还是一个虚拟节点, 并且并没有 patch 完成, 因此没有elm, 直接跳过第一个判断
    - 由于组件更新时当前vnode本身就是一个根节点的渲染vnode, 并且并没有传入 nested 这个参数, 因此 vnode.isRootInsert 这个标志根节点插入的变量值为 true
    - 进入判断之前首先会执行 createComponent 方法 传入参数依然是之前的四个, 没有返回值, 因此是一个undefined, 不会进入判断中
    - 使用变量 data 存储 vnode.data, 使用变量 children 存储 vnode.children, 使用变量 tag 存储 vnode.tag
    - 如果存在tag, 表示是一个渲染vnode, 则进入判断, 由于不存在 data.pre, 因此跳出判断中
    - 这一步很重要, 如果存在vnode.ns也就是使用命名空间(namespace), 那么将执行createElementNS创建真实DOM, 如果没有, 那么就使用一般的createElement创建节点
    - 只要标签不是select, 都直接返回 elm, 也就是生成的真实DOM节点
    - 然后执行setScope, 插槽相关, 之后再看
    - 下一步执行createChildren(vnode, children, []), 实际上就是递归的去遍历儿子节点, 然后对儿子节点执行 createElement，步骤是一样的, 是一个深层递归的过程
    - 接下来判断是否存在data, 若存在则执行 invokeCreateHooks 方法, 实际上就是执行cbs下面create中的一系列update方法，去更新attr class domlistener props style 更新指令等
    - 最后就是执行插入语句, insert函数, 传入参数 parentElm, vnode.elm, refElm(vnode的下一个兄弟节点对应的真实DOM), 插入语句就是在这个refElm的前面插入vnode.elm
    - 因此这里就可以看出, 儿子的节点的插入语句在递归过程中会先于父亲节点执行, 这也就是之前说的插入过程是先子后父
    - 结束

#### createComponent
+ 组件更新过程中执行 createElement 的时候触发
    - 使用变量 i 存储 vnode 上面的data(包含了class,title,style等标签上的属性)
    - 如果 data 是空值, 那么就直接跳过, 但就算没有值也是一个空对象, 因此直接进入
    - 如果 vnode 不是一个组件vnode(组件占位符vnode中包含 componentInstance) 或者 在vnode.data 中没有keepAlive 属性, 那么标志变量 isReactivated 为false
    - 如果在vnode.data上存在hook 并且 hook 中存在 init 属性, 那么将执行 init(vnode, false) 方法, 但是在组组件更新过程中执行createComponent的时候 一般这里都是渲染vnode, 除非组件内部根节点还是一个组件, 也就是说他既是一个渲染vnode  也是一个 组件vnode, 比如说 a-card 这种
    - 而没有 componentInstance 因此下一个判断依然不会进去, 因此此函数无返回值, 也就是说是一个undefined
    
### 组件更新总结
+ 组件更新的过程核心就是新旧 vnode diff, 对新旧节点相同以及不同的情况分别做不同的处理
+ 新旧节点不同的更新流程是创建新节点 -> 更新父占位符节点 -> 删除旧节点
+ 新旧节点相同的更新流程是去获取他们的children, 根据不同情况做不同的更新逻辑

### 响应式原理总结
+ 核心就是去观测数据的变化, 当数据发生变化以后, 去通知对应的观察者来执行相关的逻辑。整个更新的实现, 都离不开 Dep, 他是连接数据和对应观察者的一个桥梁
+ 对于data和props, 他会通过 Observe 和 defineRactive 添加一系列的操作把整个data和props上定义的属性都变成响应式的, 同时内部会持有一个自己的dep的实例, 当我们访问这些数据的时候, 就会执行他们的getter方法, 去通过dep.depend这个方法去收集依赖, 收集的依赖就是当前正在计算的watcher, 也就是Dep.target, 作为subScribers(订阅者)来订阅这些数据的变化, 当修改这些数据的时候, 他就会触发setter方法, 去执行 dep.notify() 来通知订阅者做一个update这个逻辑
+ 对于computedWatcher，首先计算属性初始化的时候会执行他的getter方法，他的getter方法就是我们所定义的计算属性函数，在这个函数中，要去拿data或者props中的变量，这样就会触发 data 或者 props 中订阅者的依赖收集(getter)，并且在这个时候，计算属性执行watcher.get()函数时，已经将Dep.target更新成了自己的watcher, 而在其所依赖的值(data 或者 props中的变量)的 依赖收集 过程中, 触发Dep.target.addDep(this) 这个方法 触发watcher下的 adddep(), 在执行dep.addSub(), 此时添加的sub就是Dep.target 也就是计算属性的watcher。因此在依赖收集的过程中，已经将计算属性添加到了每一个依赖项的__ob__的subs中, 当依赖项进行派发更新时候，会遍历其下所有的sub，并且执行sub.update。只要存在计算属性的watcher, 就会将计算属性watcher实例的成员dirty更新为true(是根据watcher的lazy判断的，计算属性的lazy是true)。而之后的 updateComponent 这个渲染watcher (初始化Vue的时候就已经生成的watcher实例，所有的订阅者的subs中都有) 执行watcher.run()的时候, 就会触发传入getter 也就是 updateComponent 方法，这样就会执行vm._render生成新的VNode，然后执行_update 在其中执行patch方法渲染出真实的DOM更新整个组件，完成组件的更新
+ userWatcher初始化于 initWatch 这个函数中, 通过遍历所有侦听属性的 key, 拿到设置的侦听属性, 一般来说, 他是一个数组, 这个数组中有一个成员, 就是预先设置的侦听属性, 然后执行 createWatcher 这个方法, 这个方法通过前期不同的判断, 对handler做处理, 如果handler直接就是一个函数('test': (newVal, oldVal) => {xxx} 这种类型的侦听属性设置方式), 那么两个判断都不会进入, options 就是undefined, 然后通过 return vm.$watch()再一次柯里化, 将options.user设置为true, 表示即将创建的 watcher 实例是一个 userWatcher, 并且提供一个回调直接触发的判断 immediate, 如果说定义 userWatcher 的时候将 immediate属性设置为true, 那么初始化 userWatcher 时就可以直接触发一次, 并且 $watch 也是一次柯里化, 闭包返回的函数是用来销毁 userWatcher 的函数. 也就是说, 最终销毁 userWatcher 时, 只需要执行一次这个闭包返回的那个函数即可. new Watcher 创建 userWatcher 实例时, 会触发一次 this.get() , 将 Dep类的公有成员 target 设置为当前的 userWatcher , 并且在初始化过程中, 会执行 parsePath 得到 this.getter, this.getter 就是一个返回值为 vm[key] 的函数, key 代表 userWatcher 定义时的键名, 在 get() 中执行 this.getter.call(this.vm, this.vm), 实际上就是将当前 vue 的实例传入 getter 中, 这样访问的就是被侦听对象的 getter, 然后触发 被侦听对象的依赖收集, 执行 dep.depend(), 收集 userWatcher 这样当被侦听对象被赋值的时候, 触发派发更新的时候, 就会执行 userWatcher 的 update 方法, 这样一来, 无论是直接执行 run 还是 执行 queueWatcher, 最终都会执行 userWatcher.run() 去触发 this.cb.call(this.vm, value, oldValue), 然后触发我们定义的回调 如果有deep属性, 那么会在执行get的时候额外的执行一个traverse() 这个方法没有什么特别的, 主要就是将侦听对象 每一层都跑一遍, 触发每一层的getter来收集 userWatcher 的依赖, 当其中任意一层改变后, 就会触发 dep.notify() 方法去跑 userWatcher 的 update, 触发 userWatcher 的回调 如果侦听属性userWatcher 侦听了一个 计算属性, 那么在 userWatcher 初始化 的过程中, 首先触发userWatcher.get(), 会将 Dep.target 置为 userWatcher, 然后在其中执行 userWatcher.getter的时候会通过 this[key] (key代表计算属性的键名) 触发计算属性的getter, 而计算属性的 getter 中会执行其依赖对象的getter进行依赖收集, 在这里有一个很关键的一步, 首先Dep.target 会更新为 computedWatcher, 在执行 computedWatcher 的依赖对象的依赖收集的时候, 也就是dep(依赖对象的dep).depend(), 触发Dep.target.addDep(this(这个this代表computedWatcher的依赖对象)), 这样, 在computedWatcher的deps数组中就包含了其依赖对象的dep, 当computedWatcher执行depend()时,触发其下deps数组中所有dep的depend, 此时的Dep.target是userWatcher, 当执行Dep.target.addDep(计算属性依赖对象的dep)时, 就会在计算属性依赖对象的dep.subs中加入userWatcher的依赖. 自此, 当计算属性的依赖发生改变触发notify时, 不仅仅有computedWatcher.update和renderWatcher.update会执行,还会触发userWatcher.update()最终在触发userWatcher.run执行 userWatcher.cb触发我们设定的回调
+ 当数据发生变化的时，最终都是在最后统一在一次tick完成后调用renderWatcher.run去执行update方法然后执行patch来更新整个组件