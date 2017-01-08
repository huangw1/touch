# touch
移动端手势库，轻量。

具体使用，可查看demo演示。

##目前支持哪些事件：
 * tap：轻击
 * doubleTap：双击
 * longTap：长按
 * swipeUp：上划
 * swipeRight：右划
 * swipeDown：下划
 * swipeleft：左划
 * swipeEnd：滑动结束
 * scale：缩放
 * scale：旋转

##DEMO
请使用移动设备或使用调试工具模拟移动设备查看。

touch.html：基本事件

slide.html：轮播实例

##如何使用

```javascript

var touch = new Touch('touch')
touch.on('tap', function() {
    console.log('tap')
})
touch.on('doubleTap', function() {
    console.log('doubleTap')
})
touch.on('swipe', function() {
    console.log('swipe')
})
touch.on('swipeLeft', function(e) {
   	console.log('swipeLeft: ' + e.dx)
})
touch.on('swipeEnd', function() {
    console.log('swipeEnd')
})

```

