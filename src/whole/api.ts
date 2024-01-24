import express from 'express';
import os from 'os';
import { mysqlPool } from '../pool';
import { queryAsync } from '../utils';

//创建路由对象
const router = express.Router();
const mysqlQuery = queryAsync(mysqlPool);

function getIPAdress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName] || [];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}

/**
 * 全部信息聚合
 */
router.post('/info', async (req: any, res: any, next: any) => {
  const user = req.session.user || {};
  const { username } = user;

  const ip = getIPAdress();

  const USER_INFO_SQL = 'SELECT * FROM user_info WHERE username = ?';
  const userData = await mysqlQuery(USER_INFO_SQL, [username]) as Object[];

  res.json({
    code: 0,
    data: {
      user: userData[0],
      system: {
        ip
      }
    },
    message: 'success'
  })
})

export default router;
