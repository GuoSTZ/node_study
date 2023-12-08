import { hashPwd, queryAsync } from '../utils';
import { mysqlPool } from '../pool';

const mysqlQuert = queryAsync(mysqlPool);

// mysql数据库中内置角色
export const createDefaultUser = async () => {
  const defaultUsers = [
    {
      username: 'guostz',
      password: 'qweasd',
      role: 'admin'
    }
  ]

  // 创建用户表
  const CREATE_USER_TABLE: string = `
    CREATE TABLE IF NOT EXISTS  user (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(20),
      password VARCHAR(500),
      role VARCHAR(20)
    );
  `;
  // 创建用户视图
  const CREATE_USER_TABLE_VIEW: string = `CREATE OR REPLACE VIEW user_info AS SELECT id, username, role FROM user;`;

  try {
    await mysqlQuert(CREATE_USER_TABLE);
    console.log("用户表创建成功");
    await mysqlQuert(CREATE_USER_TABLE_VIEW);
    console.log("用户表视图创建成功");
    defaultUsers.forEach((user) => {
      checkAndAddUser(user);
    });
  } catch(err) {
    console.log("用户表创建Error: ", err)
  }
}

// 检查并添加用户
const checkAndAddUser = (user: {username: string, password: string, role: string}) => {
  const { username } = user;
  const checkUserQuery = 'SELECT * FROM user WHERE username = ?';
  mysqlPool.query(checkUserQuery, [username], (error, results) => {
    if (error) {
      console.error('Error checking user:', error.message);
      return;
    }
    if (results.length === 0) {
      // 用户不存在，添加用户
      addUser(user);
    } else {
      console.log(`User '${username}' already exists`);
    }
  });
};

// 添加用户
const addUser = async (user: {username: string, password: string, role: string}) => {
  const { username, password, role } = user;
  const addUserQuery = 'INSERT INTO user (username, password, role) VALUES (?, ?, ?);';
  const storePassword = await hashPwd(password);
  mysqlPool.query(addUserQuery, [username, storePassword, role], (error) => {
    if (error) {
      console.error('Error adding user:', error.message);
      return;
    }
    console.log(`User '${username}' added successfully`);
  });
};
