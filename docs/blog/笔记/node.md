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



