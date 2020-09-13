var zTool = require("./zTool");
var onlineUserMap = new zTool.SimpleMap();
var historyContent = new zTool.CircleList(100);

var chatLib = require("./chatLib");
var EVENT_TYPE = chatLib.EVENT_TYPE;
var PORT = chatLib.PORT;
console.log(PORT);
//使用socket.io直接启动http服务
var io = require("socket.io").listen(PORT);

io.sockets.on("connection", function (socket) {
    socket.on("message", function (message) {
        var mData = chatLib.analyzeMessageData(message);
        console.log('mData：', mData);
        if (mData && mData.EVENT) {
            switch (mData.EVENT) {
                case EVENT_TYPE.LOGIN: // 新用户连接
                    socket.name = socket.id;
                    var newUser = {
                        'uid': socket.id,
                        'nick': chatLib.getMsgFirstDataValue(mData)
                    };
                    // 把新连接的用户增加到在线用户列表
                    onlineUserMap.put(socket.id, newUser);
                    console.log('newUser:', newUser);
                    // 把新用户的信息广播给在线用户
                    var data = JSON.stringify({
                        'user': onlineUserMap.get(socket.id),
                        'EVENT': EVENT_TYPE.LOGIN,
                        'values': [newUser],
                        'users': onlineUserMap.values(),
                        'onLineCounts': onlineUserMap.values().length,
                        'historyContent': historyContent.values()
                    });
                    io.sockets.emit('message', data); //广播
                    //socket.emit('message',data);
                    // socket.broadcast.emit('message', data);//无效
                    break;

                case EVENT_TYPE.SPEAK: // 用户发言
                    var content = chatLib.getMsgFirstDataValue(mData);
                    var data = JSON.stringify({
                        'user': onlineUserMap.get(socket.id),
                        'EVENT': EVENT_TYPE.SPEAK,
                        'values': [content]
                    });
                    //socket.emit('message',data);
                    io.sockets.emit('message', data);
                    historyContent.add({
                        'user': onlineUserMap.get(socket.id),
                        'content': content,
                        'time': new Date().getTime()
                    });
                    break;

                case EVENT_TYPE.LOGOUT: // 用户请求退出
                    var user = mData.values[0];
                    onlineUserMap.remove(user.uid);
                    var data = JSON.stringify({
                        'EVENT': EVENT_TYPE.LOGOUT,
                        'values': [user]
                    });
                    io.sockets.emit('message', data);
                    break;

                default:
                    break;
            }

        } else {
            // 事件类型出错，记录日志，向当前用户发送错误信息
            console.log('desc:message,userId:' + socket.id + ',message:' + message);
            var data = JSON.stringify({
                'uid': socket.id,
                'EVENT': EVENT_TYPE.ERROR
            });
            socket.emit('message', data);
        }
    });
    // 监听用户断开连接 (退出聊天室)
    socket.on('disconnect', function () {
        console.log('用户退出了连接: ');
        if (onlineUserMap.map.hasOwnProperty(socket.name)){
            var nick = onlineUserMap.map[socket.name].nick;
            delete onlineUserMap.map[socket.name];
            var data = JSON.stringify({
                'EVENT': 'LOGOUT',
                'values': [nick],
                'onLineCounts': onlineUserMap.values().length
            });
            console.log('广播用户退出消息');
            /* 向所有客户端广播该用户退出群聊 */
            io.sockets.emit('message', data);
        }
    })
});


console.log('监听端口： ' + PORT);