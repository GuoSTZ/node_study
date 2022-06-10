import fs from 'fs';

/** 保存内容到文件 */
export const toFile = (path: string, content: any) => {
  // 具有文件名，内容和回调函数的writeFile函数
  fs.writeFile(path, content, function (err) {
    if (err) throw err;
    console.log('目标已完成');
  });
}