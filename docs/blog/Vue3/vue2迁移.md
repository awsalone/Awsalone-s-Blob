在 Vue 3 中，全局和内部 API 都经过了重构，并考虑到了 tree-shaking 的支持。因此，全局 API 现在只能作为 ES 模块构建的命名导出进行访问
例：
```js
import { nextTick } from 'vue'

nextTick(() => {
  // 一些和DOM有关的东西
})
```