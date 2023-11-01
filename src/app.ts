import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { expressjwt } from 'express-jwt';
import LoginApi from './user/api';
import HomeApi from './home/api';
import { SECRET_KEY } from './constants';
import { API_PREFIX } from './utils/env';
import SessionError from './Error/SessionError';

const cookieParser = require('cookie-parser');
const session = require('express-session');

// 创建web服务器
const app = express();

// url处理
app.use(bodyParser.urlencoded({ extended: false }))
// 用于使用post请求时进行传递的参数转化为对象
app.use(bodyParser.json());
// 跨域处理
app.use(cors({
  origin: API_PREFIX,
  credentials: true
}));

// app.use(
//   // 解析jwt，并自动对接口进行token认证，会把解析出来的数据挂载到req.auth的属性上供开发者使用
//   expressjwt({
//     secret: SECRET_KEY,
//     algorithms: ["HS256"],
//   }).unless({ path: [/\/login$/, /\/register$/, /\/logout$/] })  // 设置不需要访问权限的接口
// )

app.use(cookieParser());
app.use(session({
  // name: 设置 cookie 中，保存 session 的字段名称，默认为 connect.sid 。
  // store: session 的存储方式，默认存放在内存中，也可以使用 redis，mongodb 等。Express 生态中都有相应模块的支持。
  // secret: 通过设置的 secret 字符串，来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改。
  // cookie: 设置存放 session id 的 cookie 的相关选项，默认为(default: { path: '/', httpOnly: true, secure: false, maxAge: null })
  // genid: 产生一个新的 session_id 时，所使用的函数， 默认使用 uid2 这个 npm 包。
  // rolling: 每个请求都重新设置一个 cookie，默认为 false。
  // resave: 即使 session 没有被修改，也保存 session 值，默认为 true。
  secret: SECRET_KEY, // 加密字符串。 使用该字符串来加密session数据，自定义
  resave: false, // 强制保存session即使它并没有变化
  saveUninitialized: false, // 强制将未初始化的session存储。当新建了一个session且未设定属性或值时，它就处于未初始化状态。
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false
  }
}));

// sesssion过期时的接口处理
app.use(function (req, res, next) {
  // @ts-ignore
  const user = req.session.user;
  const excludeApi = ['/v1/user/login', '/v1/user/register', '/v1/user/logout']
  if (!user && !excludeApi.includes(req.url)) {
    return next(new SessionError('session过期啦', {
      name: 'Session Invalid'
    }))
  }
  next();
});

// 挂载路由对象模块
// 路由对象的导入需要在expressjwt顺序之后，才能够让jwt自行验证
app.use('/v1/home', HomeApi);
app.use('/v1/user', LoginApi);

// 在所有的路由后面添加错误处理中间件，拦截所有的错误，拦截错误好几种这种复用比较防弊
app.use((err: any, req: any, res: any, next: any) => {
  console.log(err.name, '======');
  // 如果token验证不通过，那么需要用户重新登录
  // if (err.name === "UnauthorizedError") {
  //   return res.json({ code: 302, data: { url: `${API_PREFIX}/login` }, message: '用户未登录' });
  // } else if (err.name === 'jwt expired') {
  //   console.log("token过期")
  //   return res.json({ code: 302, data: { url: `${API_PREFIX}/login` }, message: '用户未登录' })
  // }

  const ERROR_NAME_302 = ['Logout', 'Session Invalid']
  if (ERROR_NAME_302.includes(err.name)) {
    return res.json({ code: 302, data: { url: `${API_PREFIX}/login` }, message: '用户未登录' });
  }
  // res.send发送任意类型的响应到客户端
  res.send({
    code: 500,
    msg: '服务器内部错误'
  })
})

// 设置接口响应用户
app.listen(3000, () => {
  console.log('服务器已经启动，访问地址为http://localhost:3000')
});