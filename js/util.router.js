// 用于定义不同类型的ajax请求
define(['avalon', 'utilTool', 'mmRouter', 'mmHistory'],
    function (avalon, utilTool) {
        // 定义主视图路由列表
        var mainArr = [
            {
                name: "/",
                navClass: "navHome",
            },
            {
                name: "/home",
                navClass: "navHome",
            },
            {
                name: "/category",
                navClass: "navCategory",
            },
            {
                name: "/lesson/list",
                navClass: "navLessonList",
            },
            {
                name: "/lesson/detail"
            }
        ];

        // 定义系统管理路由列表
        var sysArr = [
            {
                name: "/system"
            },
            {
                name: "/system/"
            },
            {
                name: "/system/nav1",
                navClass: "navSystemNav1"
            },
            {
                name: "/system/nav2",
                navClass: "navSystemNav2"
            },
            {
                name: "/system/nav3",
                navClass: "navSystemNav3"
            },
            {
                name: "/system/nav4",
                navClass: "navSystemNav4"
            },
            {
                name: "/system/nav5",
                navClass: "navSystemNav5"
            }
        ];

        /* 主视图渲染 */
        function mainRender(path, callback) {
            require([path], function () {
                avalon.vmodels.root.content = path + ".html";
                callback && callback();
            });
        }

        /* 系统管理视图渲染 */
        function sysRender(path, callback) {
            var timer = setTimeout(function () {
                require([path], function () {
                    avalon.vmodels.systemCtrl && (avalon.vmodels.systemCtrl.sysContent = path + ".html");
                    callback && callback();
                });
                timer = null; // 释放内存
            });
        }

        // 导航回调
        function callback() {
            var path = this.path; // 获取路径
            avalon.vmodels.root.routerObj = this; // 挂载到根节点
            window.scrollTo(0, 0); // 滚动到顶部，解决单页应用存在的页面缓存问题
            utilTool.handleMainNavBarHash(mainArr); // 每次路由跳转,检测主导航栏

            var flag = false; // 一个找到路由的标志
            // 对主路由进行循环判断
            (function () {
                for (var i = 0, len = mainArr.length; i < len; i++) {
                    if (path === mainArr[i].name) {
                        flag = true;
                        // 针对有回调函数的单独处理
                        switch (path) {
                            case "/":
                                avalon.router.navigate("/home");
                                break;
                            case "/lesson/list":
                                mainRender("pages/lesson/list/list", function () {
                                    // todo 可能有分页参数
                                });
                                break;
                            case "/lesson/detail":
                                mainRender("pages/lesson/detail/detail", function () {
                                    if (avalon.vmodels.lessonDetailCtrl) {
                                        avalon.vmodels.lessonDetailCtrl.cid = avalon.vmodels.root.routerObj.query.id + "timestamp=" + new Date().getTime();
                                    }
                                });
                                break;
                            default:
                                // 无需参数处理的路由
                                mainRender("pages" + mainArr[i].name + mainArr[i].name);
                        }
                        break;
                    }
                }
            })();
            // 没找到继续到后台管理中寻找
            if (!flag) {
                // 对后台管理路由进行循环判断
                (function () {
                    var flag = false; // 用于标识是否识别路由的问题
                    for (var j = 0, len = sysArr.length; j < len; j++) {
                        if (path === sysArr[j].name) {
                            flag = true; // 找到路由
                            switch (path) {
                                case "/system":
                                    flag = false;
                                    avalon.router.navigate("/system/nav1"); // 路由跳转到 /system/nav1
                                    break;
                                case "/system/":
                                    flag = false;
                                    avalon.router.navigate("/system/nav1"); // 路由跳转到 /system/nav1
                                    break;
                                default:
                                    flag = true;
                                    // 首先渲染system
                                    mainRender("pages/system/system", function () {
                                        // 然后寻找并渲染system二级页面
                                        for (var i = 0, _len = sysArr.length; i < _len; i++) {
                                            if (path === sysArr[i].name) {
                                                var third = sysArr[i].name.split("/")[2]; // 例如：["", "system", "nav1"] // 找到第三项
                                                var sysPath = "pages/system/" + third + "/" + third;
                                                sysRender(sysPath, function () {
                                                    utilTool.handleSysNavBarHash(sysArr);
                                                });
                                                break;
                                            }
                                        }
                                    });
                            }
                        }
                    }
                    if (!flag) {
                        avalon.router.navigate("/home");
                    }
                })();
            }
        }

        return {
            init: function () {
                // 加载avalon路由
                avalon.router.get("/", callback); // 首页模块
                avalon.router.get("/home", callback); // 首页模块
                avalon.router.get("/category", callback); // 分类模块
                avalon.router.get("/lesson/list", callback); // 课程列表
                avalon.router.get("/lesson/detail", callback); // 课程详情
                avalon.router.get("/system/", callback); // 后台管理
                avalon.router.get("/system/*path", callback); // 后台管理二级页面

                // 启动历史管理器
                avalon.history.start({
                    basepath: "/",
                    hashPrefix: "!",
                    fireAnchor: true,
                    html5Mode: false
                });

                // 处理默认路由
                avalon.router.error(function () {
                    avalon.router.navigate("/home");
                });

                // 开始扫描
                avalon.scan();
            }
        }
    });
