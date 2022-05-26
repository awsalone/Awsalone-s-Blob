# js相关

## typeof 与 instance of



+ typeof 用于判断变量类型，可以判断number, string, object, boolean, function, undefined, symbol 这7中类型，

  当判断引用数据类型时，却只能返回Object类型。

+ instanceof  用于判断某个实例是否属于某构造函数以及在继承关系中判断一个实例是否属于它的父类型或祖先类型的实例

  底层原理：

  ```javascript
  function instance_of(L,R){
      let R = R.prototype;
      let L = L.__proto__;
      while(true){
          if(L===null){
              return false
          }
          if(L===R){
              return true;
          }
          L===L.__proto__;
      }
  }
  ```

##  `prototype与__proto__`

`__proto__`  (double underscore proto)

对象独有，指向它的原型对象。

访问对象属性时，若对象内部不存在这个属性，就会去它的__proto__属性所指向的原型（父）对象里找，如果父对象也不存在这属性，则继续向上寻找，直到原型顶端null



`prototype`

函数独有，从一个函数指向一个对象。函数的原型对象

包含由特定类型的所有实例共享的属性和方法，也就是让该函数所实例化的对象们都可以找到公用的属性和方法。任何函数创建时，默认同时创建该函数的prototype对象



`constructor`

对象才拥有，从一个对象指向一个函数即指向该对象的构造函数

1. 我们需要牢记两点：①`__proto__`和`constructor`属性是**对象**所独有的；② `prototype`属性是**函数**所独有的，因为函数也是一种对象，所以函数也拥有`__proto__`和`constructor`属性。
2. `__proto__`属性的**作用**就是当访问一个对象的属性时，如果该对象内部不存在这个属性，那么就会去它的`__proto__`属性所指向的那个对象（父对象）里找，一直找，直到`__proto__`属性的终点**null**，再往上找就相当于在null上取值，会报错。通过`__proto__`属性将对象连接起来的这条链路即**我们所谓的原型链**。
3. `prototype`属性的**作用**就是让该函数所实例化的对象们都可以找到公用的属性和方法，即`f1.__proto__ === Foo.prototype`。
4. `constructor`属性的含义就是**指向该对象的构造函数**，所有函数（此时看成对象了）最终的构造函数都指向**Function**。



## promise

promise解决了回调地狱的情况，promise有三个状态： pending、fullfilled、rejected。执行resolve时由pending变为fullfilled状态，执行reject时由pending变为rejected状态,一旦由pending状态转变，状态就会凝固，无法更改。promise执行成功，返回值作为参数传给then方法中，通过then方法链式调用。发生错误则通过catch获取。

promise.race([promise1,promise2])返回一个promise,一旦数组中有解决或拒绝，返回的promise就会解决或拒绝

promise.all([promise1,promise2]) 返回一个数组，等待所有都完成（或第一个失败）

特点：

* 回调函数延迟绑定（回调函数不是直接申明，而是通过then方法传入执行）
* 返回值穿透
* 错误冒泡



引入微任务？

promise中会有异步任务，处理异步任务有三种方式1、同步执行2、宏任务队列执行完毕3、当前宏任务结尾。

同步执行会导致整个脚本阻塞，当前任务等待，后续任务无法执行，延迟绑定也无法实现；

所有宏任务队列执行完毕，若队列长，会导致迟迟无法执行，造成应用卡顿；

所以采用第三种执行方式，加入微任务队列，在当前宏任务执行完毕，将微任务队列推入执行栈中。实现1、异步回调替代同步回调，解决CPU浪费问题2、当前宏任务队列执行，解决回调实时性问题



1. Promise核心观念？**异步链式调用**

2. 手写一个简单的Promise

   ```javascript
   const STATUS_PENDING = 'pending'
   const STATUS_FULFILLED = 'fulfilled'
   const STATUS_REFECTED = 'rejected'
   class Promise {
   	constructor(executor){
   		this.status = STATUS_PENDING;
           this.value = undefined;
           this.reason = undefined;
           
           // 成功存放的数组
           this.onResolvedCallbacks = [];
           // 失败存放的数组
           this.onRejectedCallbacks = [];
           
           let resolve = value =>{
               if (this.status === STATUS_PENDING){
                   this.status = STATUS_FULFILLED
                   this.value = value
                   this.onResolvedCallbacks.forEach(fn=>fn())
               }
           }
           
           let reject = reason =>{
               if (this.status === STATUS_PENDING){
                   this.status = STATUS_REFECTED
                   this.reason = reason
                   this.onRejectedCallbacks.forEach(fn=>fn())
               }
           }
           
           try {
         			// 立即执行，将 resolve 和 reject 函数传给使用者  
               	executor(resolve,reject)
       		} catch (error) {
         			// 发生异常时执行失败逻辑
         			reject(error)
       	}
   
           
   	}
       
       then(onFulfilled = ()=>{},onRejected = ()=>{}){
           if (this.status === STATUS_FULFILLED){
               onFulfilled(this.value)
           }
           if(this.status === STATUS_REJECTED){
               onRejected(this.reason)
           }
           
           // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
       if (this.status === STATUS_PENDING) {
         // onFulfilled传入到成功数组
         this.onResolvedCallbacks.push(() => onFulfilled(this.value))
         // onRejected传入到失败数组
         this.onRejectedCallbacks.push(() => onRejected(this.reason))
       }
   
       }
   }
   ```

   ```javascript
   const PENDING = 'pending'
   const FULFILLED = 'fulfilled'
   const REJECTED = 'rejected'
   function Promise(executor) {
       var _this = this
       this.state = PENDING; //状态
       this.value = undefined; //成功结果
       this.reason = undefined; //失败原因
   
       this.onFulfilled = [];//成功的回调
       this.onRejected = []; //失败的回调
       function resolve(value) {
           if(_this.state === PENDING){
               _this.state = FULFILLED
               _this.value = value
               _this.onFulfilled.forEach(fn => fn(value))
           }
       }
       function reject(reason) {
           if(_this.state === PENDING){
               _this.state = REJECTED
               _this.reason = reason
               _this.onRejected.forEach(fn => fn(reason))
           }
       }
       try {
           executor(resolve, reject);
       } catch (e) {
           reject(e);
       }
   }
   Promise.prototype.then = function (onFulfilled, onRejected) {
       if(this.state === FULFILLED){
           typeof onFulfilled === 'function' && onFulfilled(this.value)
       }
       if(this.state === REJECTED){
           typeof onRejected === 'function' && onRejected(this.reason)
       }
       if(this.state === PENDING){
           typeof onFulfilled === 'function' && this.onFulfilled.push(onFulfilled)
           typeof onRejected === 'function' && this.onRejected.push(onRejected)
       }
   };
   ```

   

   ## EventEmitter(发布订阅模式--简单实现)

   ```js
   class EventEmitter {
       constructor(){
           this.events={}
       }
       on(){
           
       }
       off(){}
       once(){}
   	emit(){}
   }
   ```

   

## js运行机制

#### 浏览器

eventloop:

*  js运行过程中，同步任务放入主线程
* 异步任务在event table中注册函数
* 异步任务满足触发条件后 推入event queue中
* 主线程完成同步任务处于空闲时，event queue中任务推入主线程中

宏任务微任务：

* 宏任务包括整体代码script setTimeout setInterval   -------------------微任务包括 promise（then、catch才是，promise内部不是） process.nextTick
* 执行一个宏任务，执行过程中遇到微任务，将其放入微任务队列中
* 当前宏任务执行完毕，会查看微任务事件队列，并将里面全部微任务依次执行完
* 循环


## Object.create()、new Object()、{}

1. > Object.create(proto，[propertiesObject])

   ```
   proto
   ```

   新创建对象的原型对象。

   ```
   propertiesObject
   ```

   可选。需要传入一个对象，该对象的属性类型参照[`Object.defineProperties()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)的第二个参数。

   Object.create()方法创建一个新的对象，使用现有对象提供新创建对象的`__proto__`,返回一个新的对象，带着指定的原型对象和属性。

2. 字面量方式创建空对象 {} 相当于 Object.create(Object.prototype) 

3. ```javascript
   let o,p;
   function Constructor(){}
   o = new Constructor();
   // 上面的语句相当于:
   p = Object.create(Constructor.prototype)
   ```

4. new操作符：创建一个空的js对象------将空对象的原型指向构造函数原型-----将空对象作为构造函数的上下文（改变this指向）------对构造函数有返回值的判断**如果返回值是引用数据类型，则使用return 的返回，也就是new操作符无效；如果是值类型返回创建的对象**

   ```javascript
   function newOperator(obj,...args){
   	if (typeof obj !== 'function'){
           throw 'newOperator function the first param must be a function';
       }
       let newObj = Object.create(obj)
       let res = newObj.apply(this,args)
       let isObject = typeof res === 'object' && res !== null;
       let isFunction = typeof res === 'function';
       return isObject || isFunction ? res:newObj;
   }
   ```

   

## 实现继承的方式

1. 原型链继承，prototype赋值构造函数实例

2. 借用构造函数继承，子类型构造函数内部调用超类型构造函数，使用apply()或call方法

3. 组合继承，用原型链实现对原型属性和方法继承，用借用构造函数技术实现实例属性的继承（重写constructor指向）

4. 原型式继承，利用空对象作为中介，将某个对象直接赋值给空对象构造函数的原型

   （不能做到函数复用，共享引用类型属性的值，无法传递参数）

5. 寄生式继承

6. 寄生组合式继承

   通过call继承父类私有元素，通过原型继承父类公有元素(child.prototype.__proto__===Parent.prototype)

   由于IE不允许操作`__proto__`,Child.prototype = Object.create(Parent)

   // Object.create();创建一个空对象，让其原型链指向obj

   ```javascript
    function Parent5 () {
       this.name = 'parent5';
       this.play = [1, 2, 3];
     }
     function Child5() {
       Parent5.call(this);
       this.type = 'child5';
     }
     Child5.prototype = Object.create(Parent5.prototype);
     Child5.prototype.constructor = Child5;
   
   
   
   /**
    * 继承
    */
   // 1.借用构造函数   无法复用prototype，每次创建实例都要添加全部方法
   function Test1 (data) {
     this.name = '1'
   }
   
   function SubTest1(data){
     Test1.call(this,data)
   }
   
   let test1 = new SubTest1()
   
   //  console.log(test1.name)
   
   //2.原型链继承 (将父类实例作为子类原型)     引用属性为所有子类共享，相互干扰；无法向父类传参
   function Parent (){
     this.name = 2
   }
   Parent.prototype.age = function (){
     return 'this.name+1'
   }
   
   function Child(){}
   Child.prototype = new Parent()
   let Child1 = new Child()
   
   //3.组合继承  原型链继承原型上的属性和方法，构造函数继承实例属性
   
   //4.原型式继承    传入一个对象返回一个以该对象为原型的新对象，new object（）第二个参数为空时效果相同；与原型链继承缺点一样，无法传参、属性共享
   function object(o){
     function F(){}
     F.prototype = o
     return new F()
   }
   
   // 5.寄生式继承   使用原型式继承对一个目标对象进行浅复制，增强这个浅复制的能力
   function createAnother(initial){
     let newObj = object(initial)
     newObj.add = function(){
       return 'add'
     }
     return newObj
   }
   
   // 6.寄生组合式继承       优点：效率高，避免了在 SubType.prototype 上创建不必要的属性。与此同时还能保持原型链不变，开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式。
   
   function inheritPrototype(subType, superType){
   
     var prototype = object(superType.prototype); // 创建原型对象是超类原型对象的一个实例对象
   
     prototype.constructor = subType; // 弥补因为重写原型而失去的默认的 constructor 属性。
   
     subType.prototype = prototype; // 实现原型继承
   }
   /**
    * 疑问：
    * 为什么要将prototype指向Parent实例？直接指向原型时，只能访问到Parent的原型链，没有执行Parent的构造函数
    * new Object作用？以传入对象为原型创建新对象，避免不必要属性
    */
   
   
   ```

   

7. es6 类继承extends

## 高阶函数

`一个函数`就可以接收另一个函数作为参数或者返回值为一个函数，`这种函数`就称之为高阶函数。

### map

接收两个参数，callback和this指向。回调函数接受3个参数，cur，index，array。创建一个__新数组__，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果，对原数组没有影响



### reduce（累加器）

接收两个参数，一个为回调函数，另一个为初始值。回调函数接收4个参数，（preSum,curVal,curIndex,array）,

不传默认值会以第一个元素作为初始值



### filter

接收一个默认参数，即当前元素。返回一个__新的数组__，包含所有被保留项（true）



### sort

一个用于比较的函数，有两个默认参数，分别代表比较的两个元素

### map方法实现

```javascript
function _map(cb,init){
    
}
```

## call的实现

```javascript
Function.prototype.call = function(context){
    if(!context){
        context = typeof window === 'undefined'?global:window
    }
    context.fn = this // 保存当前函数 this指向的是当前的函数(Function的实例)
    let args = [...arguments].slice(1)
    let res = context.fn(...args) // this隐式绑定，指向context
    delete context.fn
    return res
}
```



## 函数式编程

两个最基本的运算：合成（compose）和柯里化（Currying）

### 纯函数

纯函数是指相同的输入总会得到相同的输出，并且不会产生副作用的函数。（同输入同输出；无副作用）

### 函数合成（compose）

指将代表各个动作的多个函数合并成一个函数

```javascript
function compose() {
  var args = arguments; // functions
  var start = args.length - 1; 
  return function () {
    var i = start - 1;
      // arguments 为 return 的函数的实参
    var result = args[start].apply(this, arguments); 
      while (i >= 0){
      // 将参数传入下一个function
      result = args[i].call(this, result);
      i--;
    }
    return result;
  };
}

```



###  函数柯里化

接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。

应用场景：预加载、动态创建函数

* 接受一个单一参数
* 返回  接受余下的参数而且返回结果的新函数

```javascript
//v 1
// 参数只能从左到右传递
function createCurry(func, arrArgs) {
    var args=arguments; 
    var funcLength = func.length;
    var arrArgs = arrArgs || [];

    return function(param) {
        var allArrArgs=arrArgs.concat([param])

        // 如果参数个数小于最初的func.length，则递归调用，继续收集参数
        if (allArrArgs.length < funcLength) {
            return args.callee.call(this, func, allArrArgs);
        }

        // 参数收集完毕，则执行func
        return func.apply(this, allArrArgs);
    }
}
// v 2
	let  curry = function (fn){
				    let length = fn.length,
				        args = []
				    return function (){
							Array.prototype.push.apply(args,arguments)
				        if (args.length<length){
										return arguments.callee;
				        }
				        return fn.apply(fn,args)
				    }
				}
    
```



## fetch（url(,[`request`](https://developer.mozilla.org/zh-CN/docs/Web/API/Request))）

1. `fetch()`使用 Promise（resolve 对应请求的 [`Response`](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)），不使用回调函数。

2. `fetch()`通过数据流（Stream 对象）处理数据，可以分块读取，有利于提高网站性能表现，减少内存占用，对于请求大文件或者网速慢的场景相当有用。XMLHTTPRequest 对象不支持数据流，所有的数据必须放在缓存里，不支持分块读取，必须等待全部拿到后，再一次性吐出来。

3. `fetch()`采用模块化设计，API 分散在多个对象上（Response 对象、Request 对象、Headers 对象）；相比之下，XMLHttpRequest 的 API 设计并不是很好，输入、输出、状态都在同一个接口管理，容易写出非常混乱的代码。

   `fetch()`发出请求以后，只有网络错误，或者无法连接时，`fetch()`才会报错，其他情况都不会报错(即 Promise 不会变为 `rejected`状态)，而是认为请求成功。可以通过response 对象的ok是否是true来判断是否是真正的成功

   Stream 对象只能读取一次,使用`response.clone()`,创建Stream副本



#  CJS, AMD, UMD 和 ESM

## CJS(commonJs)

```javascript
// importing 
const doSomething = require('./doSomething.js'); 

// exporting
module.exports = function doSomething(n) {
  // do something
}
```

* `CJS` 是同步导入模块

* 你可以从 `node_modules` 中引入一个库或者从本地目录引入一个文件 。如 `const myLocalModule = require('./some/local/file.js')` 或者 `var React = require('react');` ，都可以起作用

* 当 `CJS` 导入时，它会给你一个导入对象的副本

* `CJS` 不能在浏览器中工作。它必须经过转换和打包

## AMD

```javascript
define(['dep1', 'dep2'], function (dep1, dep2) {
    //Define the module value by returning a value.
    return function () {};
});

/**
*	或者
*/

// "simplified CommonJS wrapping" https://requirejs.org/docs/whyamd.html
define(function (require) {
    var dep1 = require('dep1'),
        dep2 = require('dep2');
    return function () {};
});

```

`AMD` 代表异步模块定义。

- `AMD` 是异步(`asynchronously`)导入模块的(因此得名)
- 一开始被提议的时候，`AMD` 是为前端而做的(而 `CJS` 是后端)
- `AMD` 的语法不如 `CJS` 直观。我认为 `AMD` 和 `CJS` 完全相反



## UMD

```javascript
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "underscore"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"), require("underscore"));
    } else {
        root.Requester = factory(root.$, root._);
    }
}(this, function ($, _) {
    // this is where I defined my module implementation

    var Requester = { // ... };

    return Requester;
}));

```

`UMD` 代表通用模块定义（`Universal Module Definition`）。

- 在前端和后端都适用（“通用”因此得名）
- 与 `CJS` 或 `AMD` `不同，UMD` 更像是一种配置多个模块系统的模式。[这里](https://github.com/umdjs/umd/)可以找到更多的模式
- 当使用 `Rollup/Webpack` 之类的打包器时，`UMD` 通常用作备用模块



## ESM

`ESM` 代表 `ES` 模块。这是 `Javascript` 提出的实现一个标准模块系统的方案

```javascript
import React from 'react';
import {foo, bar} from './myLib';

...

export default function() {
  // your Function
};
export const function1() {...};
export const function2() {...};


```

在很多[现代浏览器](https://caniuse.com/es6-module)可以使用

它兼具两方面的优点：具有 `CJS` 的简单语法和 `AMD` 的异步

得益于 `ES6` 的[静态模块结构](https://exploringjs.com/es6/ch_modules.html#sec_design-goals-es6-modules)，可以进行 [ Tree Shaking](https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking/)

`ESM` 允许像 `Rollup` 这样的打包器，[删除不必要的代码](https://dev.to/bennypowers/you-should-be-using-esm-kn3)，减少代码包可以获得更快的加载

可以在 `HTML` 中调用，只要如下

```javascript
<script type="module">
  import {func1} from 'my-lib';

  func1();
</script>
```



## 总结

- 由于 `ESM` 具有简单的语法，异步特性和可摇树性，因此它是最好的模块化方案
- `UMD` 随处可见，通常在 `ESM` 不起作用的情况下用作备用
- `CJS` 是同步的，适合后端
- `AMD` 是异步的，适合前端
- `commonjs` 服务端，同步加载模块，在前端会导致阻塞 导出的是拷贝，模块变化不会影响这个值，运行结果会缓存，需要清空缓存才能让模块再次运行。`amd`，异步加载模块，通过define定义回调。`es6` 一个模块就是一个文件，外部无法获取内部属性；通过exprot 关键字输出变量，可以导出类、方法; 导出的是内存地址，模块的变化也会改变；es module中可以导入commonjs,commonjs中不能导入es module;使用export  import 导入导出对象
- 模块化：解决全局变量污染，命名冲突，模块依赖关系







# 从输入url到页面渲染发生了什么

## 网络篇



当在浏览器地址栏输入网址

> 网络请求

1. 构建请求

   浏览器构建请求行

   ```javascript
   // 请求方法是GET，路径为根路径，HTTP协议版本为1.1
   GET / HTTP/1.1
   ```

2. 查找强缓存

   先检查强缓存，如果命中直接使用，否则进入下一步。

3. DNS解析

   系统域名和IP的映射即DNS

   浏览器提供了DNS缓存功能，即如果一个域名已解析过，则会吧解析结果缓存下来，下次处理直接走缓存，不需经过DNS解析

4. 建立TCP连接

   TCP（Transmission Control Protocol，传输控制协议）是一种面向连接的、可靠的、基于字节流的传输层通信协议。

   建立TCP连接经历3个阶段：

   * 通过三次握手（即共发送3个数据包确认已经建立连接）建立客户端和服务器端的连接。
   * 进行数据传输。这里有一个重要机制，就是接受方接受到数据包后必须向发送方**确认**，如果发送方没有接受到**确认**消息，则判定数据包丢失，并重新发送数据包。发送过程中有一个优化策略，就是把**大的数据包拆分成一个个小包**，依次传输到接收方，接收方按照小包的顺序把它们组装成完整的数据包。
   * 断开连接的阶段。数据传输完成，现在要断开连接了，通过**四次挥手**来断开连接。

    TCP 连接通过什么手段来保证数据传输的可靠性，一是`三次握手`确认连接，二是`数据包校验`保证数据到达接收方，三是通过`四次挥手`断开连接。

5. 发送HTTP请求

   现在`TCP连接`建立完毕，浏览器可以和服务器开始通信，即开始发送 HTTP 请求。浏览器发 HTTP 请求要携带三样东西:**请求行**、**请求头**和**请求体**。

   关于**请求行**，结构很简单，由**请求方法**、**请求URI**和**HTTP版本协议**组成。

   同时也要带上**请求头**，比如我们之前说的**Cache-Control**、**If-Modified-Since**、**If-None-Match**都由可能被放入请求头中作为缓存的标识信息。当然了还有一些其他的属性。

   最后是请求体，请求体只有在`POST`方法下存在，常见的场景是**表单提交**。

   

   > 网络响应

   

   HTTP 请求到达服务器，服务器进行对应的处理。最后要把数据传给浏览器，也就是返回网络响应。

   跟请求部分类似，网络响应具有三个部分:**响应行**、**响应头**和**响应体**。

   响应行由`HTTP协议版本`、`状态码`和`状态描述`组成

   响应头包含了服务器及其返回数据的一些信息, 服务器生成数据的时间、返回的数据类型以及对即将写入的Cookie信息。

   响应完成之后怎么办？TCP 连接就断开了吗？

   不一定。这时候要判断`Connection`字段, 如果请求头或响应头中包含**Connection: Keep-Alive**，表示建立了持久连接，这样`TCP`连接会一直保持，之后请求统一站点的资源会复用这个连接。

   否则断开`TCP`连接, 请求-响应流程结束。![](https://sanyuan0704.top/my_blog/week10/2.jpg)

   

## 解析算法篇

> 构建DOM树

由于浏览器无法直接理解`HTML字符串`，因此将这一系列的字节流转换为一种有意义并且方便操作的数据结构，这种数据结构就是`DOM树`。`DOM树`本质上是一个以`document`为根节点的多叉树。





# 网络协议

## OSI,TCP/IP

OSI七层网络协议 ： 应用层、表示层、会话层、传输层、网络层、数据链路层、物理层

OSI五层网络协议： 应用层                                       传输层、网络层、数据链路层、物理层

TCP/IP：                   应用层												传输层（TCP/UDP）、网际层、网络接口层



1. 应用层：直接为应用进程提供服务。应用层协议定义的是应用进程间通信和交互的规则，不同应用有不同的应用层协议

2. 传输层： 负责两台主机中的进程提供通信服务。

   传输控制协议（TCP）：提供面向连接的、可靠的数据传输服务，数据传输的基本单位是报文段。（可靠传输：1.确认机制 2.重传输  3.重排序 ）

   用户数据报协议（UDP）：提供无连接的、尽最大努力的数据传输服务，但不保证数据传输的可靠性，数据传输的基本单位是用户数据报。（无ACK  无seq）

3. 网络层（网际层）：负责为两台主机提供通信服务，并通过选择合适的路由将数据传递到目标主机

4. 数据链路层：负责将网络层交下来的IP数据报封装成帧，并在链路的相邻节点间传送帧，每一帧包含数据和必要的控制信息。

5. 物理层：切包数据在各种物理媒介上进行传输，为数据传输提供可靠的环境

## TCP/IP三次握手4次挥手

#### 三次握手

![图片](https://mmbiz.qpic.cn/mmbiz/5u0vo0dIkaxLXU9v0oSjAefxR0ro08xTb5JYQibG2tnQ4gBDHBGXAfvtYicuypEhIucmW3NlRFFA5S5YOrEQ0k3A/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

* 第一次握手：客户端向服务器端发送SYN报文，并指明客户端初始化序列号ISN，客户端进入SYN-SENT状态

* 第二次握手：服务器端接收到客户端的SYN报文后，会以自己的SYN报文作为应答，并且也指定自己的ISN，同时将客户端的ISN+1作为ACK值，表示自己收到了客户端的SYN，服务器进入SYN_RCVD状态

* 第三次握手：客户端接受到SYN报文后，会发送ACK报文，表示接受到服务器端的SYN报文，此时客户端进入established状态。服务器收到ACk报文后，也处于ESTABLISHED状态，此时，双方已建立起链接。

  > 凡是需要对端确认的，一定消耗TCP报文的序列号。

  SYN 是需要消耗一个序列号的，下次发送对应的 ACK 序列号要加1，SYN 需要对端的确认， 而 ACK 并不需要，因此 SYN 消耗一个序列号而 ACK 不需要。

#### 四次挥手

![图片](https://mmbiz.qpic.cn/mmbiz/5u0vo0dIkaxLXU9v0oSjAefxR0ro08xTpz5gNGBg1DcYYpf8YjyQabfPuRicaePX5z3WwL12z7IBGaMrt2gROIQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

* 刚开始双方处于`ESTABLISHED`状态。

* 客户端要断开了，向服务器发送 `FIN` 报文，发送后客户端变成了`FIN-WAIT-1`状态。注意, 这时候客户端同时也变成了`half-close(半关闭)`状态，即无法向服务端发送报文，只能接收。

* 服务端接收后向客户端确认，变成了`CLOSED-WAIT`状态。

* 客户端接收到了服务端的确认，变成了`FIN-WAIT2`状态。

* 随后，服务端向客户端发送`FIN`，自己进入`LAST-ACK`状态，

* 客户端收到服务端发来的`FIN`后，自己变成了`TIME-WAIT`状态，然后发送 ACK 给服务端。

  注意了，这个时候，客户端需要等待足够长的时间，具体来说，是 2 个 `MSL`(`Maximum Segment Lifetime，报文最大生存时间`), 在这段时间内如果客户端没有收到服务端的重发请求，那么表示 ACK 成功到达，挥手结束，否则客户端重发 ACK。



1. 为什么要三次握手，两次不行吗？

   两次握手，服务器端不能确认客户端的接收能力；（客户端发送两次连接，第一次网络延迟导致重新发送请求）只要服务器端确认就会建立新的连接，客户端忽略服务端发开的确认，也不发送数据，则服务端一直等待客户端发送数据，浪费资源

   

2. 半连接队列？

   服务器第一次收到客户端的 SYN 之后，就会处于 SYN_RCVD 状态，此时双方还没有完全建立其连接，服务器会把此种状态下请求连接放在一个队列里，我们把这种队列称之为半连接队列。

3. **SYN攻击是什么？**

   服务器端的资源分配是在二次握手时分配的，而客户端的资源是在完成三次握手时分配的，所以服务器容易受到SYN洪泛攻击。SYN攻击就是Client在短时间内伪造大量不存在的IP地址，并向Server不断地发送SYN包，Server则回复确认包，并等待Client确认，由于源地址不存在，因此Server需要不断重发直至超时，这些伪造的SYN包将长时间占用未连接队列，导致正常的SYN请求因为队列满而被丢弃，从而引起网络拥塞甚至系统瘫痪。SYN 攻击是一种典型的 DoS/DDoS 攻击。

   检测 SYN 攻击非常的方便，当你在服务器上看到大量的半连接状态时，特别是源IP地址是随机的，基本上可以断定这是一次SYN攻击。在 Linux/Unix 上可以使用系统自带的 netstats 命令来检测 SYN 攻击。

   ```java
   netstat -n -p TCP | grep SYN_RECV
   ```

   常见的防御 SYN 攻击的方法有如下几种：

   - 缩短超时（SYN Timeout）时间
   - 增加最大半连接数
   - 过滤网关防护
   - SYN cookies技术

4. **四次挥手释放连接时，等待2MSL的意义?**

   - 保证客户端发送的最后一个ACK报文段能够到达服务端。
   - 防止“已失效的连接请求报文段”出现在本连接中。

5. **为什么TIME_WAIT状态需要经过2MSL才能返回到CLOSE状态？**

   理论上，四个报文都发送完毕，就可以直接进入CLOSE状态了，但是可能网络是不可靠的，有可能最后一个ACK丢失。所以TIME_WAIT状态就是用来重发可能丢失的ACK报文。

6. 

参考  https://juejin.cn/post/6844904070889603085#heading-27

​			https://zhuanlan.zhihu.com/p/86426969

## 强缓存、协商缓存

### 强缓存

当向浏览器发起资源请求时，查询是否命中强缓存，若命中则直接使用缓存资源不再发起请求。

通过http头信息中`Expire`属性和`Cache-control`属性。

* 服务器通过在响应头添加Expire属性，指定资源的过期时间。（该时间为绝对时间，因此可能存在与客户端时间不一致或客户端修改时间的问题）
* http1.1 提出Cache-control属性。常用属性：max-age：资源最大存储时间（为相对时间，根据该时间和第一次请求时间计算得出过期时间）；private:只能被客户端缓存，代理服务器无法缓存；no-store，指定资源不能缓存；no-cache:能缓存但立即失效。
* 一起使用是cache-control优先级更高



### 协商缓存

先向服务端发送一个请求，若资源没有修改则返回304状态码，让浏览器使用本地缓存副本。

通过`Etag`和`Last-Modified`设置

* 服务端指定`Last-Modified`指出最后修改时间，浏览器下一次发起请求是，会在请求头添加`If-Modified-Since`属性，属性值为上次返回时的`Last-Modified`。请求发送到服务端时进行比较，判断是否资源已修改。若未修改返回304状态码，已修改则返回资源（缺点：只能精确到秒级。若1s内多次修改会导致不准确）
* 服务器返回资源时，头信息中添加`Etag`属性，是资源生成的唯一标识符，资源发生改变，该值改变。下次请求时，浏览器在请求头添加`If-None-Match`属性，为上次返回资源的`Etag`值。服务端进行比较判断。
* `Etag`优先级更高

## 迭代器

**可迭代协议**允许 JavaScript 对象定义或定制它们的迭代行为.一些内置类型同时是[内置可迭代对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#内置可迭代对象)，并且有默认的迭代行为,如 [`Array`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array) 或者 [`Map`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map),而其他内置类型则不是（比如 [`Object`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object))）。

要成为**可迭代**对象， 一个对象必须实现 `@@iterator` 方法。可通过常量 [`Symbol.iterator`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) 访问该属性

需要`next()` 方法，一个对象才能成为迭代器：`next()` 方法必须返回一个对象，该对象应当有两个属性： `done` 和 `value`，如果返回了一个非对象值（比如 `false` 或 `undefined`），则会抛出一个 [`TypeError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError) 异常（`"iterator.next() returned a non-object value"`）。



#### [`for...of`与`for...in`的区别](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of#for...of与for...in的区别)

[`for...in`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...in) 语句以任意顺序迭代对象的[可枚举属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)。

`for...of` 语句遍历[可迭代对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_Generators#iterables)定义要迭代的数据。



#### function*   	**生成器函数**

返回一个  [`Generator`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator) 对象。



#### Generator



#### yield

`yield` 关键字用来暂停和恢复一个生成器函数（([`function*`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*) 或[遗留的生成器函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/Legacy_generator_function)）。





# 监听DOM树变化

## Mutation Events

Mutation 事件列表

- DOMAttrModified
- DOMAttributeNameChanged
- DOMCharacterDataModified
- DOMElementNameChanged
- DOMNodeInserted
- DOMNodeRemoved
- DOMNodeInsertedIntoDocument
- DOMSubtreeModified

兼容问题：IE9不支持 Mutation Events；webkit内核不支持DomAttrModeifed

性能问题：

* 同步执行的，每次调用都要从事件队列取出事件，执行，从队列中移除，期间需要移动队列元素。触发频繁时，每次执行上面步骤，浏览器会被拖慢。
* 本身是事件，捕获采用的是冒泡的形式，如果捕获阶段又触发其他 Mutation Events，很可能阻塞js线程，甚至浏览器崩溃。



## Mutation Observer

DOM4中定义，所有操作监听及相应处理在其他脚本执行完成后异步执行。变动触发后记录在数组中，统一进行回调。（微任务）

```
new Mutation Observer(function(records,itemself){})
// records 变化记录数组； itemself 观察者对象本身
```





# Vue2 diff算法

* 本质是找出两个对象间的差异，目的是尽可能复用节点。
* DOM节点主要包括三部分：自身标签名、自身属性、子节点



```javascript
function patchVnode(oldVnode, vnode, parentElm){
  patchAttr(oldVnode.attr, vnode.attr, parentElm)
  patchChildren(parentElm, oldVnode.children, vnode.children)
}
```

#### patchAttr

```javascript
function patchAttr(oldVnode = {}, vnode = {}, parentElm){
    each(oldVnode,(key,val)=>{ //遍历  oldVnode 看newTreeAttr 是否还有对应的属性
        if (vode[key]){
            val!==vnode[key]&&setAttr(parentElm,key,vnode[key])
        }else{
            parentElm.removeAttribute(key)
        }
    })
    each(vnode,(key,val)={ //看 oldVnode 是否还有对应的属性，没有就新增
        !oldVnode[key]&&setAttr(parent,key,val)
    })
}

function each(obj,fn){
    if (Object.porototype.toString.call(obj)!=='[Object Object]'){
        console.error('只能遍历对象！')
        return
    }
    for (var key in obj){
        if(obj.hasOwnProperty(key)){
            var val = obj[key];
            fn(key,val)
        }
    }
}

function setAttr(node,key,value){
    switch(key){
            case'style':
            each(value,(key,val)=>{
                node.style[key] = val
            })
            break;
        case 'value':
            var tag = node.tag || '';
            tag = tag.toLowerCase()
            if(
            	tag === 'input' || tag === 'textarea'
            ){
                node.value = value
            }else{
                 // if it is not a input or textarea, use `setAttribute` to set
                node.setAttribute(key,value)
            }
            break
            defaule:
            node.setAttribute(key,value)
            break
    }
}
```

1. 遍历oldVnode 看 newTreeAttr 是否还有对应的属性
2. 如果有并且不相等，修改对应属性
3. 如果没有，删除对应属性
4. 遍历vnode看oldVnode 是否有对应属性，没有就新增



#### patchChildren

```javascript
function patchChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];

  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, elmToMove, refElm;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIdx];
    }

    else if (sameVnode(oldStartVnode, newStartVnode)) { //旧首 和 新首相同
      patchVnode(oldStartVnode.elm, oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }

    else if (sameVnode(oldEndVnode, newEndVnode)) { //旧尾 和 新尾相同
      patchVnode(oldEndVnode.elm, oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }

    else if (sameVnode(oldStartVnode, newEndVnode)) { //旧首 和 新尾相同,将旧首移动到 最后面
      patchVnode(oldStartVnode.elm, oldStartVnode, newEndVnode);
      nodeOps.insertBefore(parentElm, oldStartVnode.elm, oldEndVnode.elm.nextSibling)//将 旧首 移动到最后一个节点后面
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }

    else if (sameVnode(oldEndVnode, newStartVnode)) {//旧尾 和 新首相同 ,将 旧尾 移动到 最前面
      patchVnode(oldEndVnode.elm, oldEndVnode, newStartVnode);
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }

    else {//首尾对比 都不 符合 sameVnode 的话
      //1. 尝试 用 newCh 的第一项在 oldCh 内寻找 sameVnode
      let elmToMove = oldCh[idxInOld];
      if (!oldKeyToIdx) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      idxInOld = newStartVnode.key ? oldKeyToIdx[newStartVnode.key] : null;
      if (!idxInOld) {//如果 oldCh 不存在 sameVnode 则直接创建一个
        nodeOps.createElm(newStartVnode, parentElm);
        newStartVnode = newCh[++newStartIdx];
      } else {
        elmToMove = oldCh[idxInOld];
        if (sameVnode(elmToMove, newStartVnode)) {
          patchVnode(elmToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          nodeOps.createElm(newStartVnode, parentElm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
  }

  if (oldStartIdx > oldEndIdx) {
    refElm = (newCh[newEndIdx + 1]) ? newCh[newEndIdx + 1].elm : null;
    nodeOps.addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    nodeOps.removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }


}
```

createKeyToOldIdx--建立key-index的索引,主要是替代遍历，提升性能

```javascript
function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}
```





* diff 算法的本质是`找出两个对象之间的差异`

* diff 算法的核心是`子节点数组对比`,思路是通过 `首尾两端对比`

* key 的作用 主要是

* - 决定节点是否可以复用
  - 建立key-index的索引,主要是替代遍历，提升性能



参考https://zhuanlan.zhihu.com/p/76384873



#  Vue nextTick







# 稍候看

能不能说说从输入 URL 到页面渲染经历了什么？(被问过很多次了，DNS 解析过程，HTML词法分析和语法分析，CSS解析， 合成图层、合成线程调用光栅化线程池，生成位图后浏览器进程间通信过程，显卡缓存与显示器的关系，面试官说可以)

<!-- 清除缓存 -->？

TS书：

1. TypeScript 50课
2. 使用 TypeScript









<!-- 清除缓存 -->？

<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />

<meta http-equiv="Pragma" content="no-cache" />

<meta http-equiv="Expires" content="0" />

在head标签加上这个好像有用





http://localhost:8096/bcmall-wx/bcmall/773/vendingMachine/productList.htm?machineId=1000000029&&openidDES=6645F2ACB1C5AEA97EECB574B6C2EC84#