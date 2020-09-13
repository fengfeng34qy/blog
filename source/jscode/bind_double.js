/*
* 1.观察者模式
*/
const queuedObservers = new Set();
const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, { set: set });
function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer(value));
  return result;
}
observe(function (nams) {
  div.innerHTML = nams;
});
let obj = observable({ name: 'sff' })


/*
* 2.订阅者模式
*/
let event = {
  clientList: {}, // 订阅事件列表
  // 订阅
  on(key, fn) {
    // 如果这个事件没有被订阅，那么创建一个列表用来存放事件
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    // 将事件放入已有的事件列表中
    this.clientList[key].push(fn);
  },
  // 发布
  trigger(type, args) {
    let fns = this.clientList[type] // 拿到这个事件的所有监听
    if (!fns || fns.length === 0) {  // 如果没有这条消息的订阅者
      return false
    }
    // 如果存在这个事件的订阅，那么遍历事件列表，触发对应监听
    fns.forEach(fn => {
      // 可以在此处添加过滤等处理
      fn(args)
    })
  }
}

// 绑定
event.on('click', function () {
  obj.name = 'sdsds';
})
// 触发
fb.onclick = function () {
  event.trigger('click');
}