/* blob */
document.querySelector("#test").addEventListener("change",function(){
  let file = this.files[0]
  const img: HTMLImageElement = document.querySelector("#img")
  const url = window.URL.createObjectURL(file)
  img.src = url;
  img.onload = function() {
        // 释放一个之前通过调用 URL.createObjectURL创建的 URL 对象
        window.URL.revokeObjectURL(url);
  }
},false)


// 分片上传
function upload(blob:Blob):void{
  let xhr = new XMLHttpRequest()
  xhr.open('POST', '/server', true);
  xhr.onload = function(e) { 
    //... 
  };
  xhr.send(blob);
}

document.querySelector('input[type = "file"]').addEventListener("change",function(){
  let fileBlob:Blob = this.files[0]
  let start:number = 0;
  const BYTE_PER_CHUNK:number = 1024*1024;
  let size = fileBlob.size;
  let end:number = BYTE_PER_CHUNK;

  while(end<size){
    upload(fileBlob.slice(start,end));
    start = end;
    end += BYTE_PER_CHUNK;
  }
})

/* ts */
// 枚举
function getNum ():number{
return 999
}

enum Direction {
  up=0,
  down=getNum(),
  left=0,
  right
}

function test(dir:Direction):void{
  console.log(dir)
}

test(Direction.right)
test(Direction.down)

// 接口
interface transagleConfig {
  width:number,
  height:number,
  color?:string,
}

interface transagleArea {
  (width:number,height:number,color?:string):number
}

function paint (config:transagleConfig):{color?:string,area:number}{
  return {
    area:config.width*config.height/2
  }
}

let calArea:transagleArea;
calArea = function (w,h){
  return w*h/2
}

paint({
  width:1,
  height:2
})

calArea(1,22)

interface stringArray {
  [index:number]:string
}

interface ClockInterface {
  currentTime:Date;
}

class Clock implements ClockInterface {
  currentTime:Date = new Date();
  constructor(h:number,m:number){}
}

//接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员。当一个类实现了一个接口时，只对其实例部分进行类型检查。


//断言
let someValue: any = 'sv';
let svlength:number = (<string>someValue).length
let svlength1:number = (someValue as string).length
//非空断言 忽略null、undefined类型  赋值断言


// 类型守卫
//in关键字、typeof、instanceof