### state

1. state的更新可能是异步更新。多个 `setState()` 调用会合并成一个调用。解决方法是为setState传入函数而不是对象。

1. bind(this)问题(public class field):

   * babel内置了public class field帮助自动绑定this
   * 对public属性，通过`Object.defineproperty`挂载到`this`上，针对静态属性挂载到当前方法的属性上
   * 触发：通过将事件处理函数的实现通过箭头函数赋值`handleClickBtn = () => {}`

   ```js
   /*useReducer
   *定义型
   */
   class Bork {
      static a = 'foo';
      static b;
   
      x = 'bar';
      y;
    }
   // >>> 转换后
   var Bork = function Bork() {
        babelHelpers.classCallCheck(this, Bork);
        Object.defineProperty(this, "x", {
          configurable: true,
          enumerable: true,
          writable: true,
          value: 'bar'
        });
       Object.defineProperty(Bork, "a", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: 'foo'
       });
   }
   /*
   *赋值型
   */
   var Bork = function Bork() {
     babelHelpers.classCallCheck(this, Bork);
     this.x = 'bar';
     this.y = void 0;
   };
   
   Bork.a = 'foo';
   Bork.b = void 0;
   ```

### HOC

高阶组件，接收组件作为参数

### Refs

1. 类组件 (React.createRef)
   ```jsx
   class MyComponent extends React.Component {
     constructor(props) {
       super(props);
       this.inputRef = React.createRef();
     }
     render() {
       return <input type="text" ref={this.inputRef} />;
     }
     componentDidMount() {
       this.inputRef.current.focus();
     }
   }
   ```

   

2. 函数组件 (useRef)
   `useRef` 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数（`initialValue`）。返回的 ref 对象在组件的整个生命周期内持续存在(ref数据更新时不会进行通知，不会导致函数更新或页面重渲染)。可以用于命令式访问子组件，也可用来缓存需要保存但不用渲染的数据。

   ```jsx
   function TextInputWithFocusButton() {
     const inputEl = useRef(null);
     const onButtonClick = () => {
       // `current` 指向已挂载到 DOM 上的文本输入元素
       inputEl.current.focus();
     };
     return (
       <>
         <input ref={inputEl} type="text" />
         <button onClick={onButtonClick}>Focus the input</button>
       </>
     );
   }
   ```
   
   (使用 `ref` 时自定义暴露给父组件的实例值，使用useImprerativeHandle配合forwardRef导出)

   ps: ref正常无法作为props传递给子组件，而是会直接赋予所在组件。此为应用场景。
   
   ```jsx
   function FancyInput(props, ref) {
     const inputRef = useRef();
     useImperativeHandle(ref, () => ({
       focus: () => {
         inputRef.current.focus();
       }
     }));
     return <input ref={inputRef} ... />;
   }
   FancyInput = forwardRef(FancyInput);
   // 在本例中，渲染 <FancyInput ref={inputRef} /> 的父组件可以调用 inputRef.current.focus()。
   // forwardRef起一个转发作用，useImprerativeHandle用作限制父组件对子组件的ref操作。
   ```

### Render Props

 提供一个函数 prop 来动态的确定要渲染什么 —— 一个 render prop。为props添加render函数，render函数返回jsx，在组件中通过props.render渲染传递的组件



### Hooks

1. hook在class内部不起作用
2. 函数组件中没有this，可以通过`useState` hook设置state，定义一个state变量，效果同class中`this.state`;提供参数--初始state，返回值为当前state以及更新state的函数。（可以使用state）

4. hook中`componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 合并为一个api。

5. 需要在最顶部(不在循环、条件或嵌套函数中调用hook)，如果需要判断，放在hook内部。在每次渲染时，hook顺序都需要相同，才能正确地将内部 state 和对应的 Hook 进行关联。

#### useEffect

`useEffect`需要清除副作用时return需要进行的清除副作用操作函数，在unmount时会执行；

接收第二参数，是 effect 所依赖的值数组，同vue watch。（所有 effect 函数中引用的值都应该出现在依赖项数组中）；

想effect仅执行一次（仅在组件挂载和卸载时执行），第二参数传`[]`,告诉react该effect不依赖任何值；

react会在渲染完成后再延迟调用useeffect；

#### useContext

为了避免`prop drilling`，一种常用的方法是使用**React Context**。通过定义提供数据的`Provider`组件，并允许嵌套的组件通过`Consumer`组件或`useContext` Hook 使用上下文数据。

接受一个context对象（React.createContext(defaultValue)的返回值）并返回该context的当前值。context值由最近的上一级<Mycontext.Provider>的value prop决定。

```jsx
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```



#### useReducer

`useState`的替代方案。接受`(state,action) => newState`的reducer，返回当前的state和dispatch方法。

```js
const [state, dispatch] = useReducer(reducer, initialState, init);
// init为惰性初始化函数，返回最终的initialState
```



#### memo PureComponent

目的： 防止不必要地重复渲染，进行性能优化；

类组件中使用`PureComponent`,函数组件中使用`React.memo`。

`PureComponent`会对prop和state进行浅比较（React 使用 [`Object.is` 比较算法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Description) 来比较 state），如果内容相同不会重新渲染；

`React.memo`使用方式是包裹函数组件，仅检查props变更，如果实现中有useState,useReducer,useContext的Hook，state或context变化时，仍会重新渲染(每次调用都会产生新的对象，引用不同)。可以使用`useMemo`处理此问题，传入函数和依赖项，仅在依赖项改变时才重新计算memoized值。只做浅层比较。

`useCallback`是`useMemo`的语法糖

区别仅表现在usememo调用函数缓存结果，usecallback缓存函数本身

```js
useMemo(() => {
    return () => {
      setM({ m: m.m + 1 });
    };
  }, [m])

  const addM = useCallback(() => {
    setM({ m: m.m + 1 });
  }, [m]);

// 在 React 内部的简化实现
function useCallback(fn, dependencies) {
  return useMemo(() => fn, dependencies);
}
```

**当组件的每一个 prop，以及组件本身被缓存的时候**缓存 props 才是有意义的,否则组件还是会re-render。



#### 自定义hook



- [ ] 待会儿看

1. getInitialState ?



# 状态管理工具
## Redux

state => dispatch 

state 不进行直接修改，而是通过return {...state,XXX}

combineReducers 将多个reducer合并从而可以调用createstore方法

可以通过toolkit简化(默认包含redux-thunk)，configureStore,createSlice 

toolkit configStore可以通过传入reducer，为每个reducer都创建单独的state；（使用不同类型的插件（“middleware”和“enhancers”）自定义 store 设置，toolkit 为我们封装了此操作）

```react
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const counterReducer = createSlice({
    name: 'counter',
    initialState: {value: 0},
    reducers: {
        increment: (state) => { 
            // redux中认为值是不可以改变的，toolkit createSlice中允许‘直接修改’state,因为它事实上并未直接过呢更改（使用了immer库，通过proxy跟踪更改，返回一个不可变的值）
            state.value ++
        },
         incrementByAmount: (state, action) => {
      		state.value += action.payload
   		 },
    }
})

export default configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export const incrementAsync = (amount) => (dispatch) => {
  setTimeout(() => {
    dispatch(incrementByAmount(amount))
  }, 1000)
}


// type: counter/incrementByAmount ;payload: 1
useDispatch(incrementByAmount(1))

// 称为thunk函数，用于放置异步逻辑
useDispatch(incrementAsync(2))
// 外部的 thunk creator 函数
const fetchUserById = userId => {
  // 内部的 thunk 函数
  return async (dispatch, getState) => {
    try {
      // thunk 内发起异步数据请求
      const user = await userAPI.fetchById(userId)
      // 但数据响应完成后 dispatch 一个 action
      dispatch(userLoaded(user))
    } catch (err) {
      // 如果过程出错，在这里处理
    }
  }
}

const count = useSelector((state) => state.counter.value)

const { increment, decrement, incrementByAmount } = counterSlice.actions

```

![redux官方文档](C:\Users\801081\AppData\Roaming\Typora\typora-user-images\image-20230714141940457.png)

 **Reducer 中永远不应该计算随机值**，因为这会使结果不可预测。可以在prepare中处理

## Redux-saga

```react
// 定义中间件
// saga.js
import { put, takeEvery, call } from "redux-saga/effects";

const queryStep = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(5);
    }, 200);
  });
};

// 定义effect：等待queryStep这个异步resolve了，派发(put可以等效地理解为dispatch) INCREMENT 这个 action
export function* getStep(){
    const step = yield call(queryStep)
    yield put({'type':'SET_STEP',payload: step})
}

// 监听：GET_STEP 被业务组件dispatch后，中间件会调用上面的 getStep
export function* watchGetStep(){
	yield takeEvery('GET_STEP',getStep)
}

// main.js
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
const sagaMiddlewate = new createSagaMiddleware()
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchGetStep);
//使用 createSagaMiddleware 方法创建 Middleware
const sagaMiddleware = createSagaMiddleware();
//中间件应用到 store 上
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
//启用中间件
sagaMiddleware.run(watchGetStep);

function render() {
  ReactDOM.render(<Counter store={store} />, document.getElementById("root"));
}
render();

//订阅 store
store.subscribe(render);

```



# 使用中踩坑

useState更新参数是异步的，这也是为什么要通过useEffect添加对应要监听的依赖来实现在各个生命周期中的操作

几种情况：

1. 多个useEffect中使用同一个useState,直接拿到的state会是旧的值，导致setState(...state)时新的数据被旧数据覆盖,推荐使用回调setState((pre)=>({...pre})),可以拿到最新的state
2. 避免页面重新渲染，使用useRef，useRef可以保存持久数据，并且不同于useState不会触发组件的重新渲染。
3. 多个setState会被合并成一次更新，但是在异步函数中不会。可以使用`unstable_batchedUpdates`unstable_batchedUpdates(() => {set();set()})



#### 小tips

* 每次渲染时（effect触发时？），state都是一份快照，针对state的set方法会在下一次渲染时批量处理，而不会影响本次的state;
* useState只有初次渲染时会调用初始化，故将props作为setState值时，不能更新，可用作初始化。初始值传入函数调用返回的值`init()`每次渲染都会嗲用函数计算，而只传入函数`init`则仅在初始化调用。
* 组件是纯函数，要保证纯粹----接收相同参数要输出稳定的结果，只使用通过props传递的参数。

* 受控(通过`props`驱动) 非受控(通过`state`驱动)



# 源码

## 异步调度

在 React 中，一次更新 React 无法知道此次更新的波及范围，所以 React 选择从根节点开始 diff ，查找不同，更新这些不同。导致的浏览器卡顿问题，解决方案为在空闲时间执行更新任务。

### 时间分片

为确定浏览器在空闲时间，chrome中提供了api`requestIdleCallback`在浏览器空闲时执行

react模拟了requestIdleCallback以兼容浏览器

- 1 实现的这个 requestIdleCallback ，可以主动让出主线程，让浏览器去渲染视图。
- 2 一次事件循环只执行一次，因为执行一个以后，还会请求下一次的时间片。

满足上述两个条件的是宏任务

**setTimeout(fn, 0)** 会有间隔时间的过长的问题

**MessageChannel** 触发异步宏任务

```js
// React 为了防止 requestIdleCallback 中的任务由于浏览器没有空闲时间而卡死，所以设置了 5 个优先级。
Immediate -1 需要立刻执行。
UserBlocking 250ms 超时时间250ms，一般指的是用户交互。
Normal 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求。
Low 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理。
Idle 一些没有必要的任务，可能不会执行。
```

### 原理

调度方法`schedule_callback`会创建task，判断task是否超时，超时则推入taskqueue，再调用requesthostcallback请求一帧，在workloop中执行taskqueue。未超时则推入timequeue，通过requestHostTimeout内部通过settimeout使未过期任务达到过期状态，

再通过handletimeout 使用advanceTimers将 timeQueue 中过期的任务，放在 taskQueue 中，重新请求requesthostcallback。

![调度流程图.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b54e758e13641adae78499dbddc6b47~tplv-k3u1fbpfcp-jj-mark:2268:0:0:0:q75.awebp)![调和 + 异步调度 流程总图.jpeg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/429a103a732e42b69b6cd9a32f1d265a~tplv-k3u1fbpfcp-jj-mark:2268:0:0:0:q75.awebp)

## fiber

## React.lazy()

React.lazy(() => import('./a'))
内部模拟PromiseA,在初次执行时会进行init，注册then事件返回渲染组件的defaultExport。由于处于PENDING状态，会throw 该promise，在Suspense组件中，会catch到该错误，Suspense 会处理 Promise ，Promise 执行成功回调得到 defaultExport（将想要渲染组件），然后 Susponse 发起第二次渲染，第二次 init 方法已经是 Resolved 成功状态，那么直接返回 result 也就是真正渲染的组件。这时候就可以正常渲染组件了。

[参考地址][https://juejin.cn/book/6945998773818490884/section/6959807335720026150?enter_from=course_center&utm_source=course_center#heading-3]



