var express = require('express');
//生成一个express实例 app
var app = express();

//用于处理目录的对象，提高开发效率
var path = require('path');

//在控制台中，显示req请求的信息[]
var logger = require('morgan');
// logger.format('binbin', '[leapLog] :date[iso] :method :url :status :res[content-length] - :response-time ms');
//加载日志中间件，定义日志和输出级别
app.use(logger('dev'));

//解析客户端请求的body中的内容,内部使用JSON编码处理,url编码处理以及对于文件的上传处理
var bodyParser = require('body-parser');
//加载解析json的中间件,接受json请求 
app.use(bodyParser.json());
//加载解析urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: true }));

//加载cookie模块，用于获取web浏览器发送的cookie中的内容[]
var cookieParser = require('cookie-parser');
//加载解析cookie的中间件
app.use(cookieParser());
//
var session = require('express-session')
//
var mongoStore = require('connect-mongo')(session)
//
var mongoose = require('mongoose')
// 
var dbUrl = 'mongodb://root:10251@120.26.86.124:27017/admin';
//
mongoose.connect(dbUrl)
//
var db = mongoose.connection;
db.on('error', console.error.bind(console, '连接错误：'));
db.once('open', (callback) => {
  console.log('MongoDB连接成功！！');
});
//
app.use(session({
  name: 'hubble',     // 这里的name值得是cookie的name，默认cookie的name是：connect.sid
  secret: 'lpcloud',  // 用来对session id相关的cookie进行签名
  saveUninitialized: true,  // 是否自动保存未初始化的会话，建议false
  resave: false,  // 是否每次都重新保存会话，建议false
  cookie: {
    secure: false,// 当 secure 值为 true 时，cookie 在 HTTP 中是无效，在 HTTPS 中才有效
    httpOnly: false,// 浏览器不允许脚本操作 document.cookie 去更改 cookie
    maxAge: 5 * 60 * 1000  // 有效期，单位是毫秒
  },
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}))

// 视图引擎设置
app.set('view engine', 'pug');
//设置VIEWS文件夹，__dirname是node.js里面的全局变量。取得执行js所在的路径
app.set('views', path.join(__dirname, 'views'));

//静态文件目录设置,设置public文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

// 路由
var routes = require('./routes/index');
//路由控制器
app.use('/', routes);

// 捕获404错误，并转发到错误处理器
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// 开发环境下的500错误处理器，将错误信息渲染error模版并显示到浏览器中
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    // res.sendStatus(err.status || 500)
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

//导出app实例供其他模块调用
module.exports = app;