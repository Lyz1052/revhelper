//revhelper

//功能：为jsp中的js和css引用自动添加版本号，并发布到SVN
//提示：
//1.原始引用中的模板变量必须放在开头部位
//2.HASH长度默认为8，如需修改，要更改gruntfile.js和filerev.js两个地方
//3.filterIn方法必须返回不带模板或者参数的直接引用，例如${basePath}/folder/a.css，somewhere/b.js?v=1这类的引用都是不允许的，因为这样无法使用locater在filerev.summary中定位哈希后的文件


//API：
//init
//初始化库，将当前版本作为上一次发布的版本

//refresh （编译，更新资源引用）
//将当前版本（src）复制到预发布目录（pub）下
//比较上一个版本（latest）和预发布版本（pub）
//删除pub中未发生变动的文件
//在pub中，根据这些发生变动的文件，使用usemin更新jsp中的引用，列出所有改动过的引用和文件
//将这些将修改过引用的文件更新回src中

//postcommit（发布后回调）
//将当前库中的资源文件作为最新版本的资源文件，复制到latest中
//给latest中的资源文件添加版本

//TODO
//commit（自动提交SVN）
//序列化  grunt.filerev.summary F:/usemintest/node_modules/grunt-usemin/tasks/usemin.js:40
//序列化版本号，记录提交版本
module.exports = function (grunt) {

    var cfg = {
        ext:{
            res:'js,css',
            page:'jsp,html'
        },
        //css和js引用中包含这些时，不替换引用
        ignorePrefix:['http:','https:','${im_url}'],
        //css和js引用的前缀，不能重复（开头不重复）
        prefix:['${basePath}'],
        //web资源目录路径
        src:'WebRoot',
        pub:'publishing',
        latest:'latest',
        tmp:'tmp',
        hashlen:8,
        filterIn:function(file){
            var prefix = "";
            //忽略不在项目中的资源
            if(cfg.ignorePrefix.some(function(p){
                    return file.indexOf(p)!=-1;
                }))
                return {srcFile:file,prefix:prefix}

            cfg.prefix.forEach(function(p){
                if(file.indexOf(p)>-1){
                    prefix = p;
                }
            })

            file = file.replace(prefix,"");

            if(file.indexOf('?')>-1){
                file = file.substr(0,file.indexOf('?'));
            }

            return {srcFile:file,prefix:prefix}
        },
        filterOut:function(file,fileObj,match,src,srcFileObject){
            //忽略不在项目中的资源
            if(cfg.ignorePrefix.some(function(prefix){
                    return file.indexOf(prefix)!=-1;
                }))
                return file;

            var originSrc = file;
            if(file.indexOf('?')>-1)
                file = file.substring(0,file.indexOf('?'));

            var parts = file.split(".");
            var newname = file;
            var hasNewVersion = false;
            if(parts.length>2){
                var version = parts[parts.length-2];
                var regExp = new RegExp("^[a-zA-Z0-9]{"+cfg.hashlen+"}$","gm");
                if(regExp.test(version)) {//xxx.hashcode.js ==> xxx.js?v=hashcode
                    newname = parts.slice(0, parts.length - 2).join(".") + "." + parts[parts.length - 1] + "?v=" + version;
                    hasNewVersion = true;
                }
            }

            //locater没有定位到更新过版本的资源文件
            if(!hasNewVersion){
                return src;
            }

            newname = srcFileObject.prefix+newname;
            var replaced = match.replace(src, newname);
            if(newname!=src){
                grunt.revhelper = grunt.revhelper || {};
                grunt.revhelper.log = grunt.revhelper.log || {};
                var filePath = fileObj.dir+"/"+fileObj.name;
                grunt.revhelper.log[filePath] = grunt.revhelper.log[filePath] || [];
                grunt.revhelper.log[filePath].push({
                    src:src,
                    replaced:newname
                })
            }
            return newname;
        }
    }


    grunt.initConfig({
        yeoman:cfg,
        copy: {
            publishing: {
                files: [{
                    expand: true,
                    // dot: true,
                    cwd: '<%= yeoman.src%>/',
                    dest: '<%= yeoman.pub %>/',
                    src: [
                        '**/*.{<%= yeoman.ext.res %>}',
                        '**/*.{<%= yeoman.ext.page %>}'
                    ]
                }]
            },
            comparing: {
                files: [{
                    expand: true,
                    // dot: true,
                    cwd: '<%= yeoman.latest%>/',
                    dest: '<%= yeoman.pub %>/',
                    deletesame: true,
                    deleteskip:'<%= yeoman.ext.page %>',
                    src: [
                        '**/*.{<%= yeoman.ext.res %>}'
                    ]
                }]
            },
            latest: {
                files: [{
                    expand: true,
                    // dot: true,
                    cwd: '<%= yeoman.src%>/',
                    dest: '<%= yeoman.latest %>/',
                    src: [
                        '**/*.{<%= yeoman.ext.res %>}',
                        // '**/*.css',
                    ]
                }]
            },
            src: {
                files: [{
                    expand: true,
                    // dot: true,
                    cwd: '<%= yeoman.pub %>/',
                    dest: '<%= yeoman.src%>/',
                    src: [
                        '**/*.{<%= yeoman.ext.page %>}',
                    ]
                }]
            }
        },

        useminPrepare: {
            html: '<%= yeoman.pub %>/**/*.{<%= yeoman.ext.page %>}',
            options: {
                dest: '<%= yeoman.tmp %>'
            }
        },

        usemin: {
            html: '<%= yeoman.pub %>/**/*.{<%= yeoman.ext.page %>}',
            options: {
                assetsDirs: ['<%= yeoman.pub%>/'],
                patterns: {
                    html: [
                        [ /<script.+src=['"]([^"']+)["']/gm, 'Replaceing script',cfg.filterIn,cfg.filterOut],
                        [ /<link[^\>]+href=['"]([^"']+)["']/gm, 'Replaceing script',cfg.filterIn,cfg.filterOut],
                    ]
                },
            },
        },

        filerev: {
            latest: {
                src: [
                    '<%= yeoman.latest %>/**/*.{<%= yeoman.ext.res %>}'
                ]
            },
            publishing: {
                src: [
                    '<%= yeoman.pub %>/**/*.{<%= yeoman.ext.res %>}'
                ]
            }
        }
    })


    //grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('deldirs', function () {
        if(grunt.file.exists(cfg.pub))
            grunt.file.delete(cfg.pub);
        if(grunt.file.exists(cfg.tmp))
            grunt.file.delete(cfg.tmp);
    })

    grunt.registerTask('logrev', function () {
        console.log("\n=========== Summary ===========\n")

        //资源文件版本变更统计
        if(grunt.filerev.summary){
            var cnt = 1;
            console.log("资源文件版本变更统计：")
            var diffcount = Object.getOwnPropertyNames(grunt.filerev.summary).length;
            if(diffcount){
                for(file in grunt.filerev.summary){
                    console.log(""+cnt+++"."+file);
                }
            }else{
                console.log("当前库中的资源文件与上一次发布版本时的资源文件相同.")
            }

            console.log();
        }

        //资源引用更新统计
        console.log("资源引用更新统计：")
        if(grunt.revhelper&&grunt.revhelper.log){
            var cnt = 1;
            console.log("共对 "+Object.getOwnPropertyNames(grunt.revhelper.log).length+" 个文件中的资源引用进行了更新：")
            console.log();
            var cnt = 1;
            for(filePath in grunt.revhelper.log){
                console.log(""+cnt+++"."+filePath+"：");
                grunt.revhelper.log[filePath].forEach(function(e){
                    console.log("  "+e.src+" ===>> "+e.replaced);
                })
                console.log();
            }
            console.log();
        }else{
            console.log("当前库中的资源引用没有需要更新的地方.\n")
        }

        console.log("=========== Summary ===========")
    })

    grunt.registerTask('init', function () {
        grunt.loadNpmTasks('grunt-filerev');

        if(grunt.file.exists(cfg.latest))
            grunt.file.delete(cfg.latest);

        grunt.task.run([
            'deldirs',
            'copy:latest',
            'filerev:latest'
        ]);

    });

    grunt.registerTask('refresh', function (arg) {
        grunt.revhelper = {};
        grunt.loadNpmTasks('grunt-usemin');
        grunt.loadNpmTasks('grunt-filerev');

        console.log(arg)

        grunt.task.run([
            'deldirs',
            'copy:publishing',
            'filerev:publishing',
            'copy:comparing',
            'useminPrepare',
            'usemin',
            'logrev',
            'copy:src',
        ]);
    });

    grunt.registerTask('postcommit', function (arg) {
        grunt.loadNpmTasks('grunt-filerev');

        if(grunt.file.exists(cfg.latest))
            grunt.file.delete(cfg.latest);

        grunt.task.run([
            'copy:latest',
            'filerev:latest',
        ]);
    });

    grunt.registerTask('commit', function () {
        var svnUltimate = require('node-svn-ultimate');
        var readline = require('readline');
        var fs = require('fs');

        // var rl = readline.createInterface({
        //     input: process.stdin,
        //     output: process.stdout
        // });
        // var ask = function(){
        //
        // process.stdin.pause();
        // var response = fs.readSync(process.stdin.fd, 1000, 0, "utf8");
        // process.stdin.resume();
        // remark = response[0].trim();
        //
        //
        //     // rl.question('提交SVN备注: ',function (remark)  {
        //         if(!remark) {
        //             console.log('备注不能为空！')
        //         } else {
        //             // grunt.task.run(['copy:src']);
        //             console.log(remark);
        //             svnUltimate.commands.commit(cfg.src, {
        //                     trustServerCert: true,	// same as --trust-server-cert
        //                     username: "username",	// same as --username
        //                     password: "password",	// same as --password
        //                     // shell: "sh", 			// override shell used to execute command
        //                     // cwd: process.cwd(),		// override working directory command is executed
        //                     params: ['-m "' + remark + '"']
        //                 },
        //                 function () {
        //                     console.log('提交成功');
        //                     grunt.task.run(['copy:latest']);
        //                 });
        //         }
        //         // rl.close();
        //     // });
        // }
        //
        // ask();
    });
};