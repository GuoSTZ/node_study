import mysql from 'mysql';
import Redis from 'ioredis';
/** 
 * 涉及环境信息，host文件不做上传
 * @example { host: '127.0.0.1', password: '123456', ... }
 */
import { mysql_host, redis_host } from '../../host';

const mysqlPool = mysql.createPool({
  multipleStatements: true, // 允许一次发送多条sql命令
  ...mysql_host
});

// 创建一个 Redis 客户端实例，此时已经连接到redis数据库
const redisPool = new Redis({
  db: 0, // 要使用的 Redis 数据库的索引，默认为 0
  ...redis_host
});

// 确保与 Redis 服务器建立连接
// redis.connect((error, result) => {
//   if(!error) {
//     console.log('成功连接到 Redis');
//   }
// });

// 关闭 Redis 连接
process.on('SIGINT', () => {
  redisPool.quit(() => {
    console.log('已关闭 Redis 连接');
    process.exit(0);
  });
});

export {
  mysqlPool,
  redisPool
}
