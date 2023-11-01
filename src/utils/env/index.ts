import os from 'os';
import dns from 'dns';

const getIp = () => {


  // 开发环境下，跟随前端地址修改
  return "http://localhost:9966"
}

const API_PREFIX = getIp();

export {
  getIp,
  API_PREFIX
}

