// 渲染图片

const fs = require("fs");
const image = require("imageinfo");

function readFileList(path, filesList) {
  var files = fs.readdirSync(path);
  files.forEach(function (itm, index) {
    var stat = fs.statSync(path + itm);
    if (stat.isDirectory()) {
      //递归读取文件
      readFileList(path + itm + "/", filesList)
    } else {
      var obj = {};//定义一个对象存放文件的路径和名字
      obj.path = path;//路径
      obj.filename = itm//名字
      filesList.push(obj);
    }

  })

}

var getFiles = {
  //获取文件夹下的所有文件
  getFileList: function (path) {
    var filesList = [];
    readFileList(path, filesList);
    return filesList;
  },
  //获取文件夹下的所有图片
  getImageFiles: function (path) {
    var imageList = [];

    this.getFileList(path).forEach((item) => {
      var ms = image(fs.readFileSync(item.path + item.filename));
      console.log(ms);
      ms.mimeType && (imageList.push(item.filename))
    });
    console.log(imageList, '===')
    return imageList;
  }
};

module.exports = getFiles;

//获取文件夹下的所有图片
getFiles.getImageFiles("../images");
//获取文件夹下的所有文件
// getFiles.getFileList("./QRCode/");
