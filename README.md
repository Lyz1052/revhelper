# Revhelper
 用途：自动更新项目中资源文件的引用
 目前只支持替换项目中的绝对路径引用
 
# 依赖
 - [Nodejs](http://nodejs.cn/download/)
 - [grunt-cli](https://gruntjs.com/getting-started)
 - [grunt](https://gruntjs.com/getting-started)
 - [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy/)
 - [grunt-usemin](https://github.com/yeoman/grunt-usemin)
 - [grunt-filerev](https://github.com/yeoman/grunt-filerev)
 
# 初始化



###### 1. 全局安装


### 安装 [nodejs](http://nodejs.cn/download/)
安装完成后可以使用以下命令使用国内镜像下载npm包，加快速度
```
npm config set registry http://registry.npm.taobao.org/
```


### 安装 [grunt-cli](https://gruntjs.com/getting-started)
```
npm install -g grunt-cli
```

---

###### 2. 项目目录（资源目录的上一级目录）中安装

### 初始化npm
执行下面的命令，然后按提示输入项目信息，一路回车最后输入yes就可以了
```
npm init
```

### 安装 grunt 插件
在项目目录中，依次执行下面的命令
```
npm install grunt --save-dev
npm install grunt-filerev --save-dev
npm install grunt-usemin --save-dev
npm install grunt-contrib-copy --save-dev
```
### 下载 Revhelper，替换库文件
下载链接如下，下载完成后，使用 node_modules_modified 中的文件替换项目目录下的 node_modules 中的库文件，然后copy Gruntfile.js到项目目录下
```
https://github.com/Lyz1052/revhelper/archive/master.zip
```

### 初始化完成后，目录结构应如下所示

```
+-- node_modules（库文件夹，包含相关模块）
| +-- ...
| +-- ...
+-- WebRoot（web资源文件夹目录，包含页面和css，js等资源）
| +-- ...
| +-- ...
+-- package.json
+-- Gruntfile.js（Grunt相关配置）
```

# 配置（Gruntfile.js）

### revhelper配置
```
 var cfg = {
         ext:{
             //资源文件后缀名，逗号分割
             res:'js,css',
             
             //引用资源文件的页面文件后缀名，逗号分割
             page:'jsp,html'
        },
        
        //忽略的引用：css和js引用中包含这些时，不替换引用
        ignorePrefix:['http:','https:','${im_url}'],
        
        //引用中绝对路径的前缀
        prefix:'${basePath}',
        
        //当前版本的资源目录，包含所有资源文件和引用所在的页面文件，可用SVN进行版本控制
        src:'WebRoot',
        
        //预发布目录
        pub:'publishing',
        
        //最新一次发布版本目录
        latest:'latest',
        
        //临时文件夹目录
        tmp:'tmp',
        
        //检测的文件哈希串长度
        hashlen:8,
        
        /**
        * usemin工具的引用替换前过滤器
        *
        * file:根据指定正则（options.patterns）寻找到的引用
        *       当正则是 /<script.+src=['"]([^"']+)["']/gm 时，
        *       如果页面中找到了 <script src="${basePath}/js/index.js?v=1">，
        *       那么file就是 ${basePath}/js/index.js?v=1
        **/
        filterIn:function(file){
            //return: 可识别的相对路径，上述情况时，返回值应该是 /js/index.js
            return file;
        },
        
        /**
        * usemin工具的引用替换后过滤器
        *
        * file:当前资源文件的地址
        * fileObj:file的相关对象
        * match:正则的匹配（全部匹配）
        * src:原始匹配
        **/
        filterOut:function(file,fileObj,match,src){
        ...
			//return：替换后的匹配
            return newname;
        }
    }
```

### grunt-usemin 配置
```
 grunt.initConfig({
	 ...
	 usemin: {
         ...
         patterns:{
             html: [
                     //第一个参数：匹配页面内容的正则
                     //第二个参数：替换之后的控制台输出log信息
                     //第三个参数：匹配前过滤器
                     //第四个参数：匹配后过滤器
                     [ /<script.+src=['"]([^"']+)["']/gm, 'Replaceing script',cfg.filterIn,cfg.filterOut],
                     [ /<link[^\>]+href=['"]([^"']+)["']/gm, 'Replaceing script',cfg.filterIn,cfg.filterOut],
                 ]
         }
         ...
 });
```

# 使用流程：

- 等待版本更新的节点

	更新资源库，将当前版本（1.0）提交
	
	grunt init
	
- 等待下一次版本更新（2.0）

	更新资源库
	
	grunt refresh
	
	提交 2.0 版本
	
	grunt postcommit
	
- 等待下一次版本更新（3.0）

	更新资源库
	
	grunt refresh
	
	提交 3.0 版本
	
	...
	
# API

### grunt init
执行初始化命令，清空相关文件夹，并将当前目录视为最新一次提交的版本

### grunt refresh
执行更新命令，对比当前目录和最新提交目录，比对差异，替换当前目录中更新过的资源文件引用，并且输出统计

### grunt postcommit
执行提交操作后，必须执行该操作，目的是记录当前资源文件版本，以用作之后提交的比对


