import express from 'express';
import bcrypt from 'bcryptjs';
import svgCaptcha from 'svg-captcha';
import { mysqlPool, redisPool } from '../pool';
import { API_PREFIX } from '../utils/env';
import UserError from '../Error/UserError';
import { publicKey, decryptPwd, hashPwd } from '../utils';

//创建路由对象
const router = express.Router();

/**
 * 加密相关配置
 */
router.get('/encryptionConfig', (req: any, res: any, next: any) => {
  res.json({
    code: 0,
    data: {
      publicKey
    },
    message: 'success'
  });

})

/**
 * 用户登录
 * next是下一个的意思 express中的一个方法把错误发送到错误处理的代码块中
 */
router.post('/login', async (req: any, res: any, next: any) => {
  // 获取传递过来的参数体
  const { username, password, pinCode } = req.body;
  const captcha = req.session.captcha;
  if (!username || !password) {
    return res.json({ code: 1, data: null, message: '用户名或密码为空' });
  }
  if (!pinCode) {
    return res.json({ code: 1, data: null, message: '验证码为空' });
  } else if (captcha.expirationTime < Date.now()) {
    return res.json({ code: 1, data: null, message: '验证码过期' });
  } else if (captcha.text !== pinCode) {
    return res.json({ code: 1, data: null, message: '验证码错误' });
  }
  // 验证通过后，删除验证码信息
  req.session.captcha = null;
  let user: any = await redisPool.get(username);
  // const tokenStr = "Bearer " + jwt.sign(
  //   { username: obj.username },
  //   SECRET_KEY,
  //   { expiresIn: '600s' } //有效期
  // )
  const decryptedPassword = decryptPwd(password);

  // 如果缓存中存在用户信息，则使用缓存内容进行处理
  if (user) {
    user = JSON.parse(user);
    if (bcrypt.compareSync(decryptedPassword, user?.password)) {
      req.session.user = user;
      res.json({ code: 0, data: { url: `${API_PREFIX}/app/home` }, message: '登录成功' })
    } else {
      res.json({ code: 1, data: null, message: '用户名或密码错误' })
    }
  } else {
    // 向数据库发送请求 set是自动和传递参数进行匹配，匹配不到的为默认值null
    mysqlPool.query(`select * from user where username = ?`, [username], async (err: any, result: any) => {
      if (err) {
        // 这个地方是把错误返回到app.js最后的代码块处理错误
        return next(err)
      }
      if (!result[0]) {
        res.json({ code: 1, data: null, message: '用户不存在！' })
      } else if (bcrypt.compareSync(decryptedPassword, result[0]?.password)) {
        redisPool.set(username, JSON.stringify(result[0]), 'EX', 3600)
        req.session.user = result[0];
        res.json({ code: 0, data: { url: `${API_PREFIX}/app/home` }, message: '登录成功' })
      } else {
        res.json({ code: 1, data: null, message: '用户名或密码错误' })
      }
    })
  }
})

/**
 * 用户注册
 */
router.post('/register', (req: any, res: any, next: any) => {
  const obj = req.body;
  if (!obj.username || !obj.password) {
    res.send({ code: 1, data: null, message: '请输入用户名和密码' });
  }
  mysqlPool.query('select username from user where username = ?', [obj.username], async (err: any, result: any) => {
    if (err) {
      return next(err);
    }
    if (result.length > 0) {
      res.send({ code: 1, data: null, message: '此用户已被注册' });
    } else {
      const decryptedPassword = decryptPwd(obj.password);
      const storePassword = await hashPwd(decryptedPassword);
      mysqlPool.query(`insert into user value(?, ?, ?, ?)`, [null, obj.username, storePassword, 'visitor'], (err: any, result: any) => {
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
 * 验证码创建
 */
router.post('/pinCode', (req: any, res: any, next: any) => {
  var captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: 'o0i1', // 要排除的字符
    noise: 1, // 干扰线条数量
    color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    background: '#4dffc9', // 验证码图片背景颜色
    width: 96, // 宽度
    height: 32, // 高度
    fontSize: 40,
  });
  req.session.captcha = {
    text: captcha.text.toLowerCase(),
    expirationTime: Date.now() + 1 * 60 * 1000 // 设置5分钟的有效时间
  };
  res.json({ code: 0, data: captcha.data, message: 'success' })
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
