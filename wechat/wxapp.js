var Koa = require('koa');
var sha1 = require('sha1');
var path = require('path');
var wechat = require('./wxchat/g');
var config = require('./config');
var weixin = require('./wx/reply');
var views = require('koa-views');
var app = new Koa();

// app.use(function *(next){
//     if(this.href.indexOf('42.51') > -1){
//         this.render('index', {});
//         this.body = '<span>微信测试服务器，关注微信 gh_f32256b18ba8。网络日志请访问：</span><a href="http://42.51.12.57:8000" target="_blank">http://42.51.12.57:8000</a>';
//         return next;
//     }
//     yield next;
// });
// app.use(views(__dirname + '/views', {
    // map: {
    //     html: 'jade'
    // }
// }));
// app.use(async function(ctx, next){
//     ctx.state = {
//         session: this.session,
//         title: 'app'
//     };
//
//     await ctx.render('home.jade', {
//         user: 'John'
//     });
//     next();
// });

app.use(wechat(config.wechat, weixin.reply));

var port = 80;
app.listen(port);
console.log('服务器已经启动! 端口: ' + port);