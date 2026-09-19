# [兔子波比5 重制版](https://bc5r.xujinkai.net)

> Web Game / Engine

<div id="bc5r" style="width:100%;height:420px;display:grid;place-items:center;
  border:1px solid #254868;background:#071522;color:#c9e6f7">Loading Bobby Carrot 5 Remake…</div>

<script>
window.BC5R = window.BC5R || { queue: [] };
BC5R.queue.push({
  "target": "#bc5r",
  "lang": "zh-CN",
  "audio": false,
  "musicStyle": "modern",
  "input": {
    "keyboard": "focus",
    "joystick": "auto",
    "pointer": true
  },
  "camera": {
    "zoom": 1,
    "minZoom": 0.5,
    "maxZoom": 3,
    "pinchZoom": true,
    "wheelZoom": false
  },
  "mapUrl": "/assets/posts/home-demo.bc5r.json"
});
</script>

<script async src="https://bc5r.xujinkai.net/embed/v1/bc5r.js"></script>

运行在浏览器中的《兔子波比5》，通过完全重写的游戏引擎，复刻原版400关的冒险体验。

另外额外修改和添加了很多新的机制，以及支持地图编辑器、录像、分享等功能。