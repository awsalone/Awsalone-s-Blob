## extends
* 接口继承
* 条件判断
``` TypeScript
// 普通用法
  // 示例1
  interface Animal {
    eat(): void
  }
  
  interface Dog extends Animal {
    bite(): void
  }
  
  // A的类型为string
  type A = Dog extends Animal ? string : number
  
  const a: A = 'this is string'

/**
 * 泛型用法
 */
 // `分配条件类型`（对于使用extends关键字的条件类型，如果extends前面的参数是一个泛型类型，当传入该参数的是联合类型，则使用分配律计算最终的结果。分配律是指，将联合类型的联合项拆成单项，分别代入条件类型，然后将每个单项代入得到的结果再联合起来，得到最终的判断结果。）
  type P<T> = T extends 'x' ? string : number;
  type A3 = P<'x' | 'y'>  // A3的类型是 string | number

// 防止条件判断中的分配(将泛型参数使用[]括起来，即可阻断条件判断类型的分配，此时，传入参数T的类型将被当做一个整体，不再分配。)
  type P<T> = [T] extends ['x'] ? string : number;
  type A1 = P<'x' | 'y'> // number
  type A2 = P<never> // string


```

## equal实现
``` TypeScript
type MyEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;
```

## infer
