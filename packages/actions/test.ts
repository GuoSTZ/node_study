var cheerio = require('cheerio')  //只能用于jq式的解析html，但注意是解析,所以不能进行事件操作
const axios = require("axios");
import { toFile } from '../utils/toFile';


let headers = {
  authority: "x",
  method: "x",
  path: "x",
  scheme: "x",
  accept: "x",
  acceptEncoding: "x",
  acceptLanguage: "x",
  cacheControl: "x",
  cookie: "x",
  secFetchDest: "x",
  secFetchMode: "x",
  secFetchSite: "x",
  secFetchUser: "x",
  upgradeInsecureRequests: "x",
  userAgent: "x",
}
export const test = () => {
  axios.get('https://www.bilibili.com/', { headers })
    .then(function (res: any) {
      // 获取网页数据
      let text = unescape(res.data.replace(/\\u/g, "%u")); //将unicode码转换成中文
      let $ = cheerio.load(text, {
        decodeEntities: false,
      });
      /** 此处的路径相对server.ts */
      toFile('./packages/htmls/content.html', $.html())
      console.log("首页推荐" + "in " + new Date().toString());
      $(".video-card-reco .info .title").each(function (item: any) {
        // @ts-ignore
        let text = $(this).html();
        console.log(text);
      });
    })
    .catch(function (err: Error) {
      console.log("failed", err);
    });
}
