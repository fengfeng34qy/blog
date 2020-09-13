'use strict';

var fs = require('fs');
var Promise = require('bluebird');
var _ = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?';
var api = {
    semanticUrl: semanticUrl,
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?',
        fetch: prefix + 'media/get?',
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        fetch: prefix + 'material/get_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'material/uploadimg?',
        del: prefix + 'material/del_material?',
        update: prefix + 'material/update_news?',
        count: prefix + 'material/get_materialcount?',
        batch: prefix + 'material/batchget_material?',
    },
    group: {
        create: prefix + 'groups/create?',
        fetch: prefix + 'groups/get?',
        check: prefix + 'groups/getid?',
        update: prefix + 'groups/update?',
        move: prefix + 'groups/members/update?',
        batchupdate: prefix + 'groups/members/batchupdate?',
        del: prefix + 'groups/delete?',
    },
    user: {
        remark: prefix + 'user/info/updateremark?',
        fetch: prefix + 'user/info?',
        batchFetch: prefix + 'user/info/batchget?',
        list: prefix + 'user/get?'
    },
    mass: {
        group: prefix + 'message/mass/sendall?',
        openId: prefix + 'message/mass/send?',
        del: prefix + 'message/mass/delete?',
        preview: prefix + 'message/mass/preview?'
    },
    menu: {
        create: prefix + 'menu/create?',
        get: prefix + 'menu/get?',
        del: prefix + 'menu/delete?',
        current: prefix + 'get_current_selfmenu_info?'
    },
    qrcode: {
        create: prefix + 'qrcode/create?',
        show: mpPrefix + 'showqrcode?'
    },
    shortUrl: {
        create: prefix + 'shorturl?'
    }
};

function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.fetchAccessToken();
}

Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = new Date().getTime();
    if(now < expires_in){
        return true;
    }else{
        return false;
    }
};

Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve, reject) {
        request({url: url, json: true}).then(function(response) {
            var data = response.body || response[1];
            if(data)console.log('token已更新.');
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;

            resolve(data)
        })
    })
};

Wechat.prototype.reply = function(){
    var content = this.body;
    var message = this.weixin;
    console.log('this.body is: ');
    console.log(content);
    console.log(message);
    var xml = util.tpl(content, message);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
    console.log(xml);
};

Wechat.prototype.uploadMaterial = function(type, material, permanent){
    var that = this;
    var form = {};
    var uploadUrl = api.temporary.upload;

    if(permanent){
        uploadUrl = api.permanent.upload;
        _.extend(form, permanent);
    }
    if(type === 'pic'){
        uploadUrl = api.permanent.uploadNewsPic;
    }
    if(type === 'news'){
        uploadUrl = api.permanent.uploadNews;
        form = material;
    }else{
        console.log('图片路径: ');
        console.log(material);
        form.media = fs.createReadStream(material);
    }

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = uploadUrl + 'access_token=' + data.access_token;
                console.log('url');
                console.log(url);
                if(!permanent){
                    url += '&type=' + type;
                }else{
                    form.access_token = data.access_token;
                }
                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                };
                if(type === 'news'){
                    options.body = form;
                }else{
                    options.formData = form;
                }
                console.log('最终: ');
                console.log(options);
                request(options).then(function(response) {
                    var _data = response.body || response[1];
                    console.log('_data');
                    console.log(_data);
                    if(_data){
                        resolve(_data);
                    }else{
                        throw new Error('upload material fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                })
            });


    })
};

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent){
    var that = this;
    var fetchdUrl = api.temporary.fetch;

    if(permanent){
        fetchdUrl = api.permanent.fetch;
    }

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                // var url = fetchdUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId;
                var url = fetchdUrl + 'access_token=' + data.access_token;
                var form = {};
                var options = {method: 'POST',url: url, json: true};
                if(permanent){
                    form.media_id = mediaId;
                    form.access_token = data.access_token;
                    options.body = form;
                }else{
                    if(type === 'video'){
                        url = url.replace('https://', 'http://');
                    }
                    url += '&media_id=' + mediaId;
                }
                if(type === 'news' || type === 'video'){
                    request(options).then(function(response) {
                        var _data = response.body || response[1];
                        if(_data){
                            resolve(_data)
                        }else{
                            throw new Error('fetch material fails');
                        }
                    })
                        .catch(function(err){
                            reject(err);
                        });
                }else{
                    resolve(url);
                }

            });


    })
};

Wechat.prototype.deleteMaterial = function(mediaId){
    var that = this;
    var form = {
        mediaId: mediaId
    };

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.del + '&access_token=' + data.access_token + '&media_id=' + mediaId;

                request({method: 'POST',url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('delete material fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.updateMaterial = function(mediaId, news){
    var that = this;
    var form = {
        mediaId: mediaId
    };

    _.extend(form, news);
    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.update + '&access_token=' + data.access_token + '&media_id=' + mediaId;

                request({method: 'POST',url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('update material fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.countMaterial = function(){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.count + '&access_token=' + data.access_token;

                request({method: 'GET',url: url,  json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('count material fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.batchMaterial = function(options){
    var that = this;

    options.type = options.type || 'image';
    options.offset = options.offset || 0;
    options.count = options.count || 1;
    options.type = options.type || 'image';

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.batch + '&access_token=' + data.access_token;

                request({method: 'POST',url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('batch material fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.createGroup = function(name){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.group.create + '&access_token=' + data.access_token;

                var options = {
                    group: {
                        name: name
                    }
                };

                request({method: 'POST',url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('create Group fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.fetchGroups = function(name){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.group.fetch + '&access_token=' + data.access_token;

                request({url: url, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('fetch Group fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.checkGroup = function(openId){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.group.check + '&access_token=' + data.access_token;

                var options = {
                    openid: openId
                }

                request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('checkGroup fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.updateGroup = function(id, name){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.group.fetch + '&access_token=' + data.access_token;

                var options = {
                    group: {
                        id: id,
                        name: name
                    }
                }

                request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('update Group fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.moveGroup = function(openIds, to){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = '';
                var options = {
                    to_groupid: to
                };
                if(_.isArray(openIds)){
                    url = api.group.batchupdate + 'access_token=' + data.access_token;
                    options.openid_list = options;
                }else{
                    url = api.group.move + 'access_token=' + data.access_token;
                    options.openid = options;
                }

                request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('move material fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.deleteGroup = function(id){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.group.del + 'access_token=' + data.access_token;
                var options = {
                    group: {
                        id: id
                    }
                };

                request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('delete Group fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

/* 用户管理 */
Wechat.prototype.remarkUser = function(openId, remark){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.user.remark + 'access_token=' + data.access_token;
                var options = {
                    openid: openId,
                    remark: remark
                };

                request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('Remark user fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

//批量获取用户数据和单个
Wechat.prototype.fetchUsers = function(openIds, lang){
    var that = this;
    lang = lang || 'zh_CN';
    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var options = {
                    json: true
                };
                if(_.isArray(openIds)){
                    options.url = api.user.batchFetch + 'access_token=' + data.access_token;
                    options.body = {
                        user_list: openIds
                    };
                    options.method = 'POST';
                }else{
                    options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang
                }



                request(options).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('batch fetch user fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.listUsers = function(openId){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.user.list + 'access_token=' + data.access_token;
                if(openId){
                    url += '&next_openid=' + openId;
                }

                request({url: url, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('list user fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.sendByGroup = function(type, message, groupId){
    var that = this;
    var msg = {
        filter: {},
        msgtype: type
    };
    msg[type] = message;
    if(!groupId){
        msg.filter.is_to_all = true;
    }else{
        msg.filter = {
            is_to_all: false,
            group_id: groupId
        }
    }

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.mass.group + 'access_token=' + data.access_token;
                console.log('url:');
                console.log(JSON.stringify(msg));
                request({method: 'POST', url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('send to group fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.sendByOpenId = function(type, message, openIds){
    var that = this;
    var msg = {
        msgtype: type,
        touser: openIds
    };
    msg[type] = message;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.mass.openId + 'access_token=' + data.access_token;
                console.log('url:');
                console.log(JSON.stringify(msg));
                request({method: 'POST', url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('send by OpenIds fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.deleteMass = function(msgId){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.mass.del + 'access_token=' + data.access_token;
                var form = {
                    msg_id: msgId
                }
                request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('delete OpenIds fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.previewMass = function(type, message, opendId){
    var that = this;
    var msg = {
        msgtype: type,
        touser: opendId
    };
    msg[type] = message;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.mass.preview + 'access_token=' + data.access_token;
                var form = {
                    msg_id: msgId
                }
                request({method: 'POST', url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('preview OpenIds fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.createMenu = function(menu){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.create + 'access_token=' + data.access_token;

                request({method: 'POST', url: url, body: menu, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('create Menu fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.getMenu = function(menu){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.get + 'access_token=' + data.access_token;

                request({ url: url, json: true }).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('get Menu fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.deleteMenu = function(menu){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.del + 'access_token=' + data.access_token;

                request({url:url, json: true }).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('delete Menu fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.getCurrentMenu = function(){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.menu.current + 'access_token=' + data.access_token;

                request({ body: menu, json: true }).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('Get Current Menu fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

//二维码
Wechat.prototype.createQrcode = function(qr){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.qrcode.create + 'access_token=' + data.access_token;

                request({method: 'POST', url: url, body: qr, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('create Qr fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.showQrcode = function(ticket){
    return api.qrcode.show + 'ticket=' + encodeURL(ticket);
};

Wechat.prototype.createShorturl = function(action, url){
    var that = this;
    action = action || 'long2short';

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.shortUrl.create + 'access_token=' + data.access_token;
                var form = {
                    action: action,
                    long_url: url
                }
                request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('create short fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.semantic = function(semanticData){
    var that = this;

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.semanticUrl + 'access_token=' + data.access_token;
                semanticData.appid = data.appID;
                request({method: 'POST', url: url, body: semanticData, json: true}).then(function(response) {
                    var _data = response.body || response[1];
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('Semantic fails');
                    }
                })
                    .catch(function(err){
                        reject(err);
                    })
            });


    })
};

Wechat.prototype.fetchAccessToken = function(){
    var that = this;

    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this);
        }
    }

    return this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }catch(e){
                return that.updateAccessToken(data);
            }
            console.log('token是否过期:',!(that.isValidAccessToken(data)));
            if(that.isValidAccessToken(data)){
                console.log('token没有过期Promise.resolve: ');
                return Promise.resolve(data);
            }else{
                console.log('token已过期，重新更新token...');
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data);
            return Promise.resolve(data);
        })
};

module.exports = Wechat;