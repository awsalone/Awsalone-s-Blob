/* blob */
document.querySelector("#test").addEventListener("change", function () {
    var file = this.files[0];
    var img = document.querySelector("#img");
    var url = window.URL.createObjectURL(file);
    img.src = url;
    img.onload = function () {
        // 释放一个之前通过调用 URL.createObjectURL创建的 URL 对象
        window.URL.revokeObjectURL(url);
    };
}, false);
// 分片上传
function upload(blob) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/server', true);
    xhr.onload = function (e) {
        //... 
    };
    xhr.send(blob);
}
document.querySelector('input[type = "file"]').addEventListener("change", function () {
    var fileBlob = this.files[0];
    var start = 0;
    var BYTE_PER_CHUNK = 1024 * 1024;
    var size = fileBlob.size;
    var end = BYTE_PER_CHUNK;
    while (end < size) {
        upload(fileBlob.slice(start, end));
        start = end;
        end += BYTE_PER_CHUNK;
    }
});
/* ts */
// 枚举
function getNum() {
    return 999;
}
var Direction;
(function (Direction) {
    Direction[Direction["up"] = 0] = "up";
    Direction[Direction["down"] = getNum()] = "down";
    Direction[Direction["left"] = 0] = "left";
    Direction[Direction["right"] = 1] = "right";
})(Direction || (Direction = {}));
function test(dir) {
    console.log(dir);
}
test(Direction.right);
test(Direction.down);
function paint(config) {
    return {
        area: config.width * config.height / 2
    };
}
var calArea;
calArea = function (w, h) {
    return w * h / 2;
};
paint({
    width: 1,
    height: 2
});
console.log(calArea(1, 22));
