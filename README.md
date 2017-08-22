# Revhelper
 用途：自动更新项目中资源文件的引用
 目前只支持替换项目中的绝对路径引用
 
# 依赖
 - [Nodejs](http://nodejs.cn/download/)
 - [grunt-cli](https://gruntjs.com/getting-started)
 - [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy/)
 - [grunt-usemin](https://github.com/yeoman/grunt-usemin)
 - [grunt-filerev](https://github.com/yeoman/grunt-filerev)
 
# 初始化


### 安装 [nodejs](http://nodejs.cn/download/)
安装完成后可以使用`npm config set registry http://registry.npm.taobao.org/`命令使用国内镜像下载npm包，加快速度

### 安装 [grunt-cli](https://gruntjs.com/getting-started)
```
npm install -g grunt-cli
```

> 以下操作均在资源库目录下进行

### 克隆 Revhelper
```
git clone https://github.com/Lyz1052/revhelper
```

### 安装 grunt 插件
在项目目录中，执行下面的命令行命令
```
npm install grunt-filerev --save-dev
npm install grunt-usemin --save-dev
npm install grunt-contrib-copy --save-dev
```

### 替换库文件

使用 node_modules_modified 替换 node_modules 中的库文件


### 拉取资源库（SVN）中Web资源目录的代码




# 配置

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
        * usemin:工具的引用替换后过滤器
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
        * usemin:工具的引用替换后过滤器
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
                     //pattern，匹配页面内容的正则，Replaceing script 是替换之后的控制台输出log信息
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


