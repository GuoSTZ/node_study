import express from 'express';
import { mysqlPool, redisPool } from '../pool';
import { API_PREFIX } from '../utils/env';
import UserError from '../Error/UserError';

//创建路由对象
const router = express.Router();

/**
 * 用户登录
 * next是下一个的意思 express中的一个方法把错误发送到错误处理的代码块中
 */
router.post('/login', async (req: any, res: any, next: any) => {
  // 获取传递过来的参数体
  const obj = req.body;
  if (!obj.username || !obj.password) {
    res.send({ code: 1, data: null, message: '请输入用户名和·密码' })
  }
  let user: any = await redisPool.get(obj.username);
  // const tokenStr = "Bearer " + jwt.sign(
  //   { username: obj.username },
  //   SECRET_KEY,
  //   { expiresIn: '600s' } //有效期
  // )
  // 如果缓存中存在用户信息，则使用缓存内容进行处理
  if (user) {
    user = JSON.parse(user);
    if (user?.password === obj.password) {
      req.session.user = user;
      res.json({ code: 0, data: { url: `${API_PREFIX}/home` }, message: '登录成功' })
    } else {
      res.json({ code: 1, data: null, message: '用户名或密码错误' })
    }
  } else {
    // 向数据库发送请求 set是自动和传递参数进行匹配，匹配不到的为默认值null
    mysqlPool.query(`select * from user where username = ?`, [obj.username], (err: any, result: any) => {
      if (err) {
        // 这个地方是把错误返回到app.js最后的代码块处理错误
        return next(err)
      }
      if (result[0]?.password === obj.password) {
        redisPool.set(obj.username, JSON.stringify(result[0]), 'EX', 3600)
        req.session.user = result[0];
        res.json({ code: 0, data: { url: `${API_PREFIX}/home` }, message: '登录成功' })
      } else {
        res.json({ code: 1, data: null, message: '用户名或密码错误' })
      }
    })
  }
})

/**
 * 用户注册
 */
router.post('/register', async (req: any, res: any, next: any) => {
  const obj = req.body;
  if (!obj.username || !obj.password) {
    res.send({ code: 1, data: null, message: '请输入用户名和密码' });
  }
  mysqlPool.query('select username from user where username = ?', [obj.username], (err: any, result: any) => {
    if (err) {
      return next(err);
    }
    if (result.length > 0) {
      res.send({ code: 1, data: null, message: '此用户已被注册' });
    } else {
      mysqlPool.query(`insert into user value(?, ?, ?, ?)`, [null, obj.username, obj.password, 'visitor'], (err: any, result: any) => {
        if (err) {
          return next(err)
        }
        if (result.affectedRows === 1) {
          res.send({ code: 0, data: null, message: '注册成功' });
        } else {
          res.send({ code: 1, data: null, message: '注册失败' });
        }
      })
    }
  })
})

/**
 * 用户登出
 */
router.post('/logout', async (req: any, res: any, next: any) => {
  const user = req.session.user;
  const { username } = user;
  // 清除该用户的redis缓存
  redisPool.del(username);
  // 销毁session
  req.session.destroy(function (err: any) {
    console.log(err);
  })
  return next(new UserError('用户登出', {
    name: 'Logout'
  }))
})

/**
 * 用户信息获取
 */
router.post('/info', (req: any, res: any, next: any) => {
  const user = req.session.user || {};
  const { username } = user;
  mysqlPool.query('SELECT * FROM user_info WHERE username = ?', [username], (err, result) => {
    if (err) {
      return next(err);
    }
    if (result?.length > 0) {
      res.json({ code: 0, data: result[0], message: 'success' })
    } else {
      res.json({ code: 1, data: null, message: '用户不存在' })
    }
  })

})

export default router;
