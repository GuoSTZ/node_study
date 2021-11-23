const fs = require("fs");

// 小文件拷贝
function smallFileCopy(source, target) {
  fs.writeFileSync(target, fs.readFileSync(source));
}

function copySmallFile(argu) {
  smallFileCopy(argu[0], argu[1]);
}

// process是一个全局变量，可通过process.argv获得命令行参数。
// 由于argv[0]固定等于NodeJS执行程序的绝对路径，argv[1]固定等于主模块的绝对路径
copySmallFile(process.argv.splice(2));

exports.copySmallFile = copySmallFile;