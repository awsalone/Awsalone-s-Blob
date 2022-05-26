# Babel处理流程

源码 `解析(Parsing)` 开始，解析包含两个步骤：

**1️⃣词法解析(Lexical Analysis)**：

 `词法解析器(Tokenizer)`将字符串形式的代码转换成`Tokens(令牌)`.Tokens可以视作一些语法片段组成的数组.



**2️⃣语法解析(Syntactic Analysis)**：

语法`解析器(Parser)`会把`Tokens`转换成`抽象语法树(Abstract Syntax Tree，AST)`

AST? 		是一颗‘对象树’，用来表示代码的语法结构

**AST 是 Babel 转译的核心数据结构，后续的操作都依赖于 AST**。

接着就是**转换(Transform)**了，转换阶段会对 AST 进行遍历，在这个过程中对节点进行增删查改。Babel 所有插件都是在这个阶段工作, 比如语法转换、代码压缩。

**Javascript In Javascript Out**, 最后阶段还是要把 AST 转换回字符串形式的Javascript，同时这个阶段还会生成Source Map。

