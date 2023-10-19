import express from 'express';
import { mysqlPool, redisPool } from '../pool';

//创建路由对象
const router = express.Router();

/**
 * 首页信息
 */
router.post('/info', async (req: any, res: any, next: any) => {
  // 获取传递过来的参数体
  const obj = req.body;
  res.json({
    code: 0,
    data: [],
    message: 'success'
  })
})

export default router;
