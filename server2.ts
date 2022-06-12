// // 引入express框架，依赖express框架搭建服务器
// var express = require('express');
// // 创建web服务器
// var app = express();
// // 引入path模块
// const path = require('path');

// // 渲染引擎设置
// app.engine('art', require('express-art-template'));
// // 开启debug
// app.set('view options', {
//   debug: process.env.NODE_ENV !== 'production'
// });
// // 设置视图，表示要解析的模板文件在哪儿
// app.set('views', path.join(__dirname, '/src/htmls'));
// app.set('view engine', 'art');

// // routes
// app.get('/', function (req: any, res: any) {
//   // res.render()渲染模板引擎
//   res.render('test.art', {
//     count: 31,
//     userList: [{
//       id: 1001,
//       userName: '小刘',
//       userPwd: '123',
//       sex: 1
//     },
//     {
//       id: 1002,
//       userName: '小张',
//       userPwd: '456',
//       sex: 1
//     },
//     {
//       id: 1003,
//       userName: '小陈',
//       userPwd: '789',
//       sex: 0
//     }
//     ],
//     pageNum: 1,
//     pageSize: 3,
//     pageCount: 11
//   });
// });

// app.listen(3000, () => {
//   console.log('example app listening on port 3000');
// })