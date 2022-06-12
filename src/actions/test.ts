var cheerio = require('cheerio')  //只能用于jq式的解析html，但注意是解析,所以不能进行事件操作
const axios = require("axios");
import { toFile } from '../utils/toFile';
import { downloadImage } from '../utils/getImage';


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
  axios.get('https://bbs.mihoyo.com/ys/obc/content/2359/detail?bbs_presentation_style=no_header', { headers })
    .then(function (res: any) {
      // 获取网页数据
      let text = unescape(res.data.replace(/\\u/g, "%u")); //将unicode码转换成中文
      let $ = cheerio.load(text, {
        decodeEntities: false,
      });
      /** 此处的路径相对server.ts */
      toFile('./packages/htmls/content.html', $.html())
      $(".detail__body .detail__title").each(function (item: any) {
        // @ts-ignore
        let text = $(this).html();
        console.log(text);
      });
      $(".obc-tmpl__switch-list .obc-tmpl__switch-item:first td a span").each(function (item: any) {
        const imgs = $(".obc-tmpl__switch-list .obc-tmpl__switch-item:first td a img").map((i: number, x: any) => $(x).attr('src')).toArray()
        // @ts-ignore
        let text = $(this).html();
        downloadImage(imgs[item], "./packages/images", text);
      });
    })
    .catch(function (err: Error) {
      console.log("failed", err);
    });
}
