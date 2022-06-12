// 导入express框架
const express = require("express");
// 初始化express
const app = express();
const path = require('path');
// 用来打开默认浏览器
const cp = require("child_process");

// import { test } from './src/actions/test';

const PORT = 3000;

// 渲染引擎设置
app.engine('art', require('express-art-template'));
// 开启debug
app.set('view options', {
  debug: process.env.NODE_ENV !== 'production'
});
// 设置视图，表示要解析的模板文件在哪儿
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'art');

//本地服务器解决跨域，不可缺
app.all('*', function (req: any, res: any, next: any) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

//get接口访问，访问自己这个服务器接口
app.get("/", function (req: any, res: any) {
  res.render('test.art', {name: "zheng"})
})

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}/`);
});

// test();

// cp.exec(`start http://localhost:${PORT}/`);
