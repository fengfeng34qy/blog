---
title: vue中使用svg-icon
date: 2019-10-23 16:58:56
tags:
---

1. 在webpack.base.conf.js中加入
``` js
module: {
  rules: [
    ...(config.dev.useEslint ? [createLintingRule()] : []),
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: vueLoaderConfig
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
    },
    {
      test: /\.svg$/,
      loader: 'svg-sprite-loader',
      include: [resolve('src/icons')],  // 1. 看这里
      options: {
        symbolId: 'icon-[name]'
      }
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      exclude: [resolve('src/icons')],  // 2. 这里一定要加上
      options: {
        limit: 10000,
        name: utils.assetsPath('img/[name].[hash:7].[ext]')
      }
    }
  ]
}
```
