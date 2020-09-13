'use strict';
//reply.js

var config = require('./../config');
var path = require('path');
var Wechat = require('./../wxchat/wechat');
var wechatApi = new Wechat(config.wechat);
var menu = require('./menu');

wechatApi.deleteMenu().then(function(){
    return wechatApi.createMenu(menu)
}).then(function(msg){
        console.log(msg);
    });

exports.reply = function *(next){
    var message = this.weixin;
    console.log('this.weixin');
    console.log(message);
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log('扫二维码进来的...' + message.EventKey + ':' + message.ticket)
            }
            console.log('关注成功!');
            var now = new Date().getTime();
            this.body = '你关注了我，你要干啥?';
        }else if(message.Event === 'unsubscribe'){
            this.body = '取消订阅的回送';
        }else if(message.Event === 'LOCATION'){
            this.body = '您上报的地理位置是' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
        }else if(message.Event === 'CLICK'){
            this.body = '您点击了菜单:' + message.EventKey;
        }else if(message.Event === 'SCAN'){
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
            this.body = '看到扫一下!';
        }else if(message.Event === 'VIEW'){
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }else if(message.Event === 'scancode_push'){
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }else if(message.Event === 'scancode_waitmsg'){
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanRusult);
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }else if(message.Event === 'pic_sysphoto'){
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }else if(message.Event === 'pic_photo_or_album'){
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }else if(message.Event === 'pic_weixin'){
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }else if(message.Event === 'location_select'){
            console.log(message.SendLocationInfo.Location_X);
            console.log(message.SendLocationInfo.Location_Y);
            console.log(message.SendLocationInfo.Scale);
            console.log(message.SendLocationInfo.Label);
            console.log(message.SendLocationInfo.Poiname);
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }
    }else if(message.MsgType === 'text'){
        console.log('你发了消息', message.Content);
        var content = message.Content;
        var reply = '我不能识别你说的:( ' + message.Content + ' )';

        if(content === '1'){
            reply = '天下第一吃大米';
        }else if(content === '2'){
            reply = '天下第二吃豆腐';
        }else if(content === '3'){
            reply = '天下第三吃仙丹';
        }else if(content === '4'){
            reply = [
                {
                    title: '技术改变人生',
                    description: '描述',
                    picUrl: 'http://www.gaopinimages.com/webres/upload/20170310/1489116920321.jpg',
                    url: 'http://www.baidu.com'
                 },
                {
                    title: 'nodejs开发',
                    description: 'nodejs',
                    picUrl: 'http://b.hiphotos.baidu.com/zhidao/wh%3D450%2C600/sign=f0c5c08030d3d539c16807c70fb7c566/8ad4b31c8701a18bbef9f231982f07082838feba.jpg',
                    url: 'https://42.51.12.57'
                }
            ]
        }else if(content === '5'){
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'));
            console.log(JSON.stringify(data));
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }else if(content === '6'){
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.mp4'));
            reply = {
                type: 'video',
                tilte: 'dec',
                description: 'des',
                mediaId: data.media_id
            }
        }else if(content === '7'){
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'));
            reply = {
                type: 'music',
                title: '有没有人曾告诉你',
                description: 'http://www.haoduoge.com/',
                musicUrl: 'http://mp3.haoduoge.com/s/2017-03-28/1490711097.mp3',
                thumbMediaId:data.media_id
            }
        }else if(content === '8'){
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {type: 'image'});
            console.log(JSON.stringify(data));
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }else if(content === '9'){
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../2.mp4'), {type: 'video',description: '{"title": "视频素材标题","introduction": "视频素材描述"}'});
            console.log(JSON.stringify(data));
            reply = {
                type: 'video',
                tilte: '视频内容',
                description: '视频描述',
                mediaId: data.media_id
            }
        }else if(content === '10'){
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.jpg'), {});
            console.log('picData:');
            console.log(JSON.stringify(picData));
            var media = {
                articles: [{
                    title: 'tututu4',
                    thumb_media_id: picData.media_id,
                    author: 'Scott',
                    digest: '没有摘要',
                    show_cover_pic: 1,
                    content: '没有内容',
                    content_source_url: 'https://github.com'
                }]
            };

            data = yield wechatApi.uploadMaterial('news', media, {});
            console.log('第一个data：');
            console.log(data);
            data = yield wechatApi.fetchMaterial(data.media_id, 'news', {});

            console.log('data = yield wechatApi.uploadMaterial(news, media, {})');
            console.log(data);
            var items = data.news_item;
            var news = [];
            items.forEach(function(item){
                news.push({
                    title: item.title,
                    decrition: item.digest,
                    picUrl: picDate.url,
                    url: item.url
                });
            });
            console.log('news: ');
            console.log(news);
            reply = news;
        }else if(content === '11'){
            var counts = yield wechatApi.countMaterial();
            console.log(JSON.stringify(counts));
            var results = yield [
                wechatApi.batchMaterial({
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'news',
                    offset: 0,
                    count: 10
                }),
            ];
            var list1 = yield wechatApi.batchMaterial({
                type: 'image',
                offset: 0,
                count: 10
            });
            var list2 = yield wechatApi.batchMaterial({
                type: 'video',
                offset: 0,
                count: 10
            });
            var list3 = yield wechatApi.batchMaterial({
                type: 'voice',
                offset: 0,
                count: 10
            });
            var list4 = yield wechatApi.batchMaterial({
                type: 'news',
                offset: 0,
                count: 10
            });
            console.log(JSON.stringify(results));
            reply = '1';
        }else if(content === '12'){
            var group = yield wechatApi.createGroup('wechat2');
            console.log('新分组 wechat2: ');
            console.log(group);

            var groups = yield wechatApi.fetchGroups();
            console.log('加了wechat后的分组');
            console.log(groups);

            var group2 = yield wechatApi.checkGroup(message.FromUserName);
            console.log(group2);
            reply = '你说了12';
        }else if(content === '13'){
            var user = yield wechatApi.fetchUsers(message.FromUserName);
            console.log(user);

            var openIds = [
                {openid: message.FromUserName, lang: 'zh_CN'}
            ];
            var users = yield wechatApi.fetchUsers(openIds);
            console.log(users);

            reply = JSON.stringify(user);
        }else if(content === '14'){
            var userList = yield wechatApi.listUsers();
            console.log(userList);
            reply = userList.total;
        }else if(content === '15'){
            var mpnews = {
                media_id: 'Ehmii5u20MzHOlxh_ZS0Ptky7hqc9Jn-4pm1pQi1HpY'
            };
            var text = {
                'content': 'hello wechat'
            };
            var msgData = yield wechatApi.sendByGroup('mpnews', mpnews, 1);
            console.log(JSON.stringify(msgData));
            reply = 'yeah';
        }else if(content === '16'){
            // var mpnews = {
            //     media_id: 'Ehmii5u20MzHOlxh_ZS0Ptky7hqc9Jn-4pm1pQi1HpY'
            // };
            var text = {
                'content': 'hello wechat'
            };
            var msgData = yield wechatApi.sendByGroup('text', text, 'oPIExxG33-GYbJTV6rIzctvksMis');
            console.log(JSON.stringify(msgData));
            reply = 'yeah';
        }else if(content === '20'){
            var semanticData = {
                query:"寻龙诀",
                city: "北京",
                category: "move",
                uid: message.FromUserName
            };
            var _semanticData = yield wechatApi.semantic(semanticData);
            reply = JSON.stringify(_semanticData)
        }

        this.body = reply;
    }else if(message.MsgType === 'image'){
        this.body = 'image from user';
    }
    yield next
};