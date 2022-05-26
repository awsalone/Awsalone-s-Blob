# Webbpack配置详情

## entry

entry:入口起点

1. string --> './src/index.js'，单入口

   打包形成一个 chunk。 输出一个 bundle 文件。此时 chunk 的名称默认是 main

2. array --> ['./src/index.js', './src/add.js']，多入口

   所有入口文件最终只会形成一个 chunk，输出出去只有一个 bundle 文件。

   （一般只用在 HMR 功能中让 html 热更新生效）

3. object，多入口

   有几个入口文件就形成几个 chunk，输出几个 bundle 文件，此时 chunk 的名称是 key 值

   ```javascript
   entry: {
     // 最终只会形成一个chunk, 输出出去只有一个bundle文件。
     index: ['./src/index.js', './src/count.js'], 
     // 形成一个chunk，输出一个bundle文件。
     add: './src/add.js'
   }
   ```



## output

```javascript
output: {
  // 文件名称（指定名称+目录）
  filename: 'js/[name].js',
  // 输出文件目录（将来所有资源输出的公共目录）
  path: resolve(__dirname, 'build'),
  // 所有资源引入公共路径前缀 --> 'imgs/a.jpg' --> '/imgs/a.jpg'
  publicPath: '/',
  chunkFilename: 'js/[name]_chunk.js', // 指定非入口chunk的名称
  library: '[name]', // 打包整个库后向外暴露的变量名
  libraryTarget: 'window' // 变量名添加到哪个上 browser：window
  // libraryTarget: 'global' // node：global
  // libraryTarget: 'commonjs' // conmmonjs模块 exports
},
```



## module

```javascript
module: {
  rules: [
    // loader的配置
    {
      test: /\.css$/,
      // 多个loader用use
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.js$/,
      // 排除node_modules下的js文件
      exclude: /node_modules/,
      // 只检查src下的js文件
      include: resolve(__dirname, 'src'),
      enforce: 'pre', // 优先执行
      // enforce: 'post', // 延后执行
      // 单个loader用loader
      loader: 'eslint-loader',
      options: {} // 指定配置选项
    },
    {
      // 以下配置只会生效一个
      oneOf: []
    }
  ]
},
```



## resolve

```javascript
// 解析模块的规则
resolve: {
  // 配置解析模块路径别名: 优点：当目录层级很复杂时，简写路径；缺点：路径不会提示
  alias: {
    $css: resolve(__dirname, 'src/css')
  },
  // 配置省略文件路径的后缀名（引入时就可以不写文件后缀名了）
  extensions: ['.js', '.json', '.jsx', '.css'],
  // 告诉 webpack 解析模块应该去找哪个目录
  modules: [resolve(__dirname, '../../node_modules'), 'node_modules']
}
```

这样配置后，引入文件就可以这样简写：`import '$css/index';`



## dev server

```javascript
devServer: {
  // 运行代码所在的目录
  contentBase: resolve(__dirname, 'build'),
  // 监视contentBase目录下的所有文件，一旦文件变化就会reload
  watchContentBase: true,
  watchOptions: {
    // 忽略文件
    ignored: /node_modules/
  },
  // 启动gzip压缩
  compress: true,
  // 端口号
  port: 5000,
  // 域名
  host: 'localhost',
  // 自动打开浏览器
  open: true,
  // 开启HMR功能
  hot: true,
  // 不要显示启动服务器日志信息
  clientLogLevel: 'none',
  // 除了一些基本信息外，其他内容都不要显示
  quiet: true,
  // 如果出错了，不要全屏提示
  overlay: false,
  // 服务器代理，--> 解决开发环境跨域问题
  proxy: {
    // 一旦devServer(5000)服务器接收到/api/xxx的请求，就会把请求转发到另外一个服务器3000
    '/api': {
      target: 'http://localhost:3000',
      // 发送请求时，请求路径重写：将/api/xxx --> /xxx （去掉/api）
      pathRewrite: {
        '^/api': ''
      }
    }
  }
}
```

其中，跨域问题：同源策略中不同的协议、端口号、域名就会产生跨域。

正常的浏览器和服务器之间有跨域，但是服务器之间没有跨域。代码通过代理服务器运行，所以浏览器和代理服务器之间没有跨域，浏览器把请求发送到代理服务器上，代理服务器替你转发到另外一个服务器上，服务器之间没有跨域，所以请求成功。代理服务器再把接收到的响应响应给浏览器。这样就解决开发环境下的跨域问题。





参考 http://www.woc12138.com/article/45



## loader

babel: 转译 ES6

* [@babel/core](https://link.juejin.cn?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-core)

* [@babel/preset-env](https://link.juejin.cn?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-preset-env): 包含 ES6、7 等版本的语法转化规则

* [@babel/plugin-transform-runtime](https://link.juejin.cn?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-plugin-transform-runtime%2F): 避免 polyfill 污染全局变量，减小打包体积

* [@babel/polyfill](https://link.juejin.cn?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-polyfill): ES6 内置方法和函数转化垫片

* babel-loader: 负责 ES6 语法转化

```
 // .babelrc配置
 {
 "presets": [
   [
     "@babel/preset-env",
     {
       "useBuiltIns": "usage",
     }
   ]
 ],
 "plugins": ["@babel/plugin-transform-runtime"]
}

// webpack配置loader
module: {
  rules: [
    {
      test: /\.js$/, // 使用正则来匹配 js 文件
      exclude: /node_modules/, // 排除依赖包文件夹
      use: {
        loader: 'babel-loader' // 使用 babel-loader
      }
    }
  ]
}


```

.browserslistrc 配置文件  [兼容浏览器](https://link.juejin.cn/?target=https%3A%2F%2Fbrowserl.ist%2F)（这个配置能够分享目标浏览器和nodejs版本在不同的前端工具。这些工具能根据目标浏览器自动来进行配置；补充: 在vue官方脚手架中，browserslist字段会被 [@babel/preset-env](https://links.jianshu.com/go?to=https%3A%2F%2Fnew.babeljs.io%2Fdocs%2Fen%2Fnext%2Fbabel-preset-env.html) 和 [Autoprefixer](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fpostcss%2Fautoprefixer) 用来确定需要转译的 JavaScript 特性和需要添加的 CSS 浏览器前缀。）

```
// package.json中直接添加或单独创建配置文件
"browserslist": [
  "> 1%",
  "last 2 version",
  "not ie <= 8"
]

```



​		