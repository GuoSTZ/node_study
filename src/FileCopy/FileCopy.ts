const fs = require("fs");

// 小文件拷贝
function smallFileCopy(source: string, target: string) {
  fs.writeFileSync(target, fs.readFileSync(source));
}

function main(argu: string[]) {
  smallFileCopy(argu[0], argu[1]);
}

main(process.argv.splice(2));