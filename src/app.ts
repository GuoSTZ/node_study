import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { expressjwt } from 'express-jwt';
import LoginApi from './login/api';
import HomeApi from './home/api';
import { SECRET_KEY } from './constants';

// 创建web服务器
const app = express();

// url处理
app.use(bodyParser.urlencoded({ extended: false }))
// 用于使用post请求时进行传递的参数转化为对象
app.use(bodyParser.json());
// 跨域处理
app.use(cors());

app.use(
  // 解析jwt，并自动对接口进行token认证，会把解析出来的数据挂载到req.auth的属性上供开发者使用
  expressjwt({
    secret: SECRET_KEY,
    algorithms: ["HS256"],
  }).unless({ path: [/\/login$/, /\/register$/, /\/logout$/] })  // 设置不需要访问权限的接口
)

// 在所有的路由后面添加错误处理中间件，拦截所有的错误，拦截错误好几种这种复用比较防弊
app.use((err: any, req: any, res: any, next: any) => {
  // err 接收路由中传递的错误信息
  console.log(err);
  // 如果token验证不通过，那么需要用户重新登录
  if (err.name === "UnauthorizedError") {
    // res.json发送JSON格式的响应到客户端
    res.json({ code: 302, data: {url: 'http://localhost:9966/login'}, message: '用户未登录' })
  }
  // res.send发送任意类型的响应到客户端
  res.send({
    code: 500,
    msg: '服务器内部错误'
  })
})

// 挂载路由对象模块
// 路由对象的导入需要在expressjwt顺序之后，才能够让jwt自行验证
app.use('/v1/user', LoginApi);
app.use('/v1/home', HomeApi);

// 设置接口响应用户
app.listen(3000, () => {
  console.log('服务器已经启动')
});