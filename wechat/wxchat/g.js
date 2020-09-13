'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body'); //把request对象去拼装它的数据，得到buffer的xml数据;
var Wechat = require('./wechat');
var util = require('./util');

var Koa = require('koa');
var app = new Koa();
var views = require('koa-views');

module.exports = function(config, handler){
    var wechat = new Wechat(config);
    return function *(next){
        var that = this;
        var token = config.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);
        console.log('请求进来了！',this.method);
        console.log(signature);
        if(this.method === 'GET'){
            if(sha === signature){
                this.body = echostr + '';
            }else{
                // this.render('index');
                this.body = '<span>微信测试服务器，关注微信 gh_f32256b18ba8。网络日志请访问：</span><a href="http://42.51.12.57:8000" target="_blank">http://42.51.12.57:8000</a>';
            }
        }else if(this.method === 'POST'){
            if(sha !== signature){
                this.body = 'wrong';
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });
            var content = yield util.parseXMLAsync(data);
            var message = util.formatMessage(content.xml);

            this.weixin = message;
            yield handler.call(this, next);
            wechat.reply.call(this);
        }
    };
};