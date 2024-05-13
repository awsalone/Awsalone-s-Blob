# npm相关指令

```
// 安装
npm install
npm install <package-name>

//更新
npm update
npm update <package-name>
npm outdated  // 发现新发布的包
// 运行任务
npm run <task-name>

// 安装包
npm install // 默认本地安装
npm install -g // 全局安装

// 包查询
npm list
npm list --depth=0 // 顶级包查询
npm list <package-name> // 指定包查询
npm view <package-name> version // 指定包最新版本查询
```



node避免阻塞业务逻辑的执行通过 事件、异步API、非阻塞I/O

#### node模块系统

如果模块是目录，定义模块文件为index.js；除非存在package文件指明main键取代index.js



# node 连接数据库

knex库，为数据库连接提供封装 并且对不同的查询客户端以及 SQL 方言的执行结果进行了标准化

```js
// 同时需安装对应数据库的包
const config = {
  client: process.env.DB_CONNECTION,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  log: {
    error (message) {
      console.log('[knex error]', message)
    }
  }
}
const knex = require("knex")(config);
//	knex(table).select();
// knex(table).where('id','=',id).update(params)
```

