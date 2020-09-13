'use strict';

/*
module.exports = {
    'button': [{
        'name': '排行榜',
        'sub_button': [{
            'name': '最热',
            'type': 'click',
            'key': 'movie_hot'
        }, {
            'name': '最冷',
            'type': 'click',
            'key': 'movie_cold'
        }]
    }, {
        'name': '分类',
        'sub_button': [{
            'name': '犯罪',
            'type': 'click',
            'key': 'movie_crime'
        }, {
            'name': '动画',
            'type': 'click',
            'key': 'movie_cartoon'
        }]
    }, {
        'name': '帮助',
        'type': 'click',
        'key': 'help'
    }]
}*/
module.exports = {
    "button": [{
        "name": "点击事件",
        "type": "click",
        "key": "menu_click"
    },{
        "name": "点出菜单",
        "sub_button": [{
            "type": "view",
            "name": "跳转url",
            "url": "https://www.baidu.com"
        },{
            "name": "扫码推动事件",
            "type": "scancode_push",
            "key": "qr_scan"
        },{
            "name": "扫码推动...",
            "type": "scancode_waitmsg",
            "key": "qr_scan_wait"
        },{
            "name": "弹出系统拍照",
            "type": "pic_sysphoto",
            "key": "pic_photo"
        },{
            "name": "弹出系统拍照相册",
            "type": "pic_photo_or_album",
            "key": "pic_photo_album"
        }]
    },{
        "name": "点击菜单2",
        "sub_button": [{
            "name": "微信相册发图",
            "type": "pic_weixin",
            "key": "pic_weixin"
        },{
            "name": "地理位置选择",
            "type": "location_select",
            "key": "location_select"
        },
        //     {
        //     "name": "下发图片消息",
        //     "type": "media_id",
        //     "media_id": "S9q5Qiu0GG7i6pIKCeliKWq1hAy09u_4XoHNlTvQ6JHjvUiPH1GoZCt5WnM7G_aQ"
        // },{
        //     "name": "跳转图文消息url",
        //     "type": "view_limited",
        //     "media_id": "S9q5Qiu0GG7i6pIKCeliKWq1hAy09u_4XoHNlTvQ6JHjvUiPH1GoZCt5WnM7G_aQ"
        // }
        ]
    }
    ]
}
