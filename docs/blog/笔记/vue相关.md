## MVC和MVVM

### MVC

全名 Model View Control ,即模型-视图-控制器；control将model的数据用view展示出来

* model：处理应用程序的数据
* view：处理数据显示
* control：交互部分，负责从视图读取数据，控制用户输入，并向模型发送数据



### MVVM

全名 Model View ViewModel 

* ViewModel层：实现数据的双向绑定，通过1、数据绑定：将模型转换为视图即后端传递的数据转化为页面

2、DOM监听：将视图转化为模型即将页面转化为模型



区别为实现了 View 和 Model 的自动同步（VUE并没有完全遵循MVVM，它可以通过$refs让Model直接操作View）





## Vue2.0 响应式数据的原理

数据劫持+观察者模式

对象内部通过Object.defineProperty 将属性劫持，数组则是通过重写数组方法。



## Vue3.x

### Composition API

#### setup

组件中使用composition API 的入口，在beforecreated前使用，执行setup时实例尚未创建故访问不到this,接受两个参数 props、context

props为响应式数据，若使用ES6解构会破坏其响应式解构.可使用torefs完成解构操作

context 为解决setup中无法访问this的问题，提供了attr、slot、emit属性



#### reactive、ref与toRefs

vue3中除data外可以使用ref，reactive进行数据定义。

通过value获取定义的属性值，在模板中则不需要value





#### 生命周期钩子

现定义在setup中，vue3中beforeCreated和created移除，这些钩子中执行的代码直接在setup中编写

接受回调函数，钩子被组件调用时执行



#### 响应式计算和侦听

##### watch

watch API 和侦听器property（watch）完全等同，侦听特定数据源，执行回调。默认为惰性，侦听源变化时才执行回调

* 侦听器数据源可以是返回值的getter函数,也可以直接是ref

```
// 侦听getter
const state = reactive({count:0})
watch(
	()=>state.count,
	(count,preCount)=>{
	
	}
)

// 直接侦听ref
const count = ref('')
watch(count,(count,preCount)=>{})
```



* 可用数组侦听多个数据源

```
watch([a,b],(newVal,preVal)=>{})
```

* 侦听响应式对象

```
侦听响应式的值，需要构建值的副本
const num = reactive([1,2,3,4])
watch(()=>[...nums],(cur,pre)=>{})

深度嵌套时需要将deep选项设置为true
```

##### 计算值

computed方法：接收getter函数，并为getter函数返回值返回一个`不可变`的响应式ref对象或

接收一个带get和set函数的`对象`创建一个可写的ref对象。

##### watchEffect

根据响应式状态，`自动`应用和重新应用副作用。`立即执行`传入的函数，同时响应式追踪其依赖，依赖变更时重新运行

* 停止侦听：若在setup或生命周期调用，生命周期结束时被清除；或获取watcheffect返回值，并执行（返回值（））
* 清除副作用：传入`onInvalidate `函数作为入参，注册清理失败时的回调，执行时机：
  * 副作用即将重新执行时
  * 侦听器被停止 (如果在 `setup()` 或生命周期钩子函数中使用了 `watchEffect`，则在组件卸载时)



#### Teleport(传送)

使用teleport标签实现dom上脱离(在id为dialog处渲染)，同时状态完全由内部Vue组件控制；即将组件挂载到指定节点

```
  <teleport to="#dialog">
	</teleport>
```



#### Suspense

#### 变更

* slot具名插槽
* 自定义指令
* v-model升级



#### 其他

可以多个根节点

更好的treeShaking



