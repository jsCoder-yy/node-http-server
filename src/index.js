module.exports=(()=>{
  "user strict";
  console.time('httpServerStart');
  let http=require('http'),//http协议模块
      url=require('url'),//url解析模块
      fs=require('fs'),//文件系统模块
      path=require('path'),//路径解析模块
      cfg=require('../package.json');//ip、port相关配置
  return {
    // 启动服务
    start:function(){
      const {ip,port}=cfg.httpConfig;
      //创建服务
      let httpServer=http.createServer();
      //在指定的端口监听服务
      httpServer.listen(port,()=>{
        console.log('httpServerStarted',`running at http://${ip}:${port}`);
        console.timeEnd('httpServerStart');//记录服务启动用了多少时间
      });
      //监听请求
      httpServer.on('request',(request,response)=>{
        this.processRequest(request,response);
      });
      //处理请求出错
      httpServer.on('error',(error)=>{
        console.error(error);
      });
    },
    /**
     * 请求处理
     * @param request
     * @param response
     */
    processRequest:function(request,response){
      let requestUrl=request.url,//请求地址
          pathName=url.parse(requestUrl).pathname,//路径
          fileFormat=path.extname(url.parse(requestUrl).pathname);//格式
      //访问的是网站根目录
      if(pathName==='/'){
        pathName+='index.html';
      }
      //文件路径
      let filePath=path.join('root',pathName);
      //获取对应文件的文档类型
      let contentType = this.getContentType(filePath);
      console.log(filePath);
      //如果访问的文件地址存在
      fs.exists(filePath,(exists)=>{
        //文件存在
        console.log(exists);
        if(exists){
          //在返回头中写入内容类型
          response.writeHead(200,{"content-type":contentType});
          //创建只读流用于返回
          let stream=fs.createReadStream(filePath,{flags:"r",encoding:null});
          stream.on("error", ()=>{
            //指定如果流读取错误,返回404错误
            response.writeHead(500,{"content-type": "text/html"});
            response.end("<h1>500 Server Error</h1>");
          });
          //连接文件流和http返回流的管道,用于返回实际Web内容
          stream.pipe(response);
        }
        //文件不存在
        else{
          response.writeHead(404, {"content-type": "text/html"});
          response.end("<h1>404 Not Found</h1>");
        }
      });
    },
    /**
     * 获取文档的内容类型
     * @param filePath
     * @returns {*}
     */
    getContentType:function(filePath){
      let contentType = this.config.mime;
      let ext = path.extname(filePath).substr(1);
      if(contentType.hasOwnProperty(ext)){
        return contentType[ext];
      }
      else{
        return contentType.default;
      }
    },
    ///配置信息
    config:{
      mime:{
        html:"text/html",
        js:"text/javascript",
        css:"text/css",
        gif:"image/gif",
        jpg:"image/jpeg",
        png:"image/png",
        ico:"image/icon",
        txt:"text/plain",
        json:"application/json",
        default:"application/octet-stream"
      }
    }
  }
})();
