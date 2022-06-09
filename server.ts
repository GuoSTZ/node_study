// 导入express框架
const express = require("express");
// 导入axios插件
const axios = require("axios");
// 初始化express
const app = express();
// 用来打开默认浏览器
const cp = require("child_process");

const PORT = 5400;

app.use(express.static('./server.html'));

//本地服务器解决跨域，不可缺
app.all('*', function (req: any, res: any, next: any) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

//get接口访问，访问自己这个服务器接口
app.get("/", function (req: any, res: any) {
  //服务器获取数据，将不会产生跨域问题
  axios.get("https://www.jianshu.com/asimov/trending/now?count=15&note_ids= ")
    .then((response: any) => {
      //以json格式将服务器获取到的数据返回给前端。
      res.json(response.data);
    })
})

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}/`);
});

// cp.exec(`start http://localhost:${PORT}/`);