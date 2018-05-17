var express = require('express');
var router = express.Router();
var Account = require('../models/user')
var _ = require('underscore')

// 账户
router.get('/', function (req, res, next) {
  if(req.session.account) {
    res.render('index', {username: req.session.name});
  } else {
    res.redirect('/login')
  }
});
router.get('/login', function (req, res) {
  res.render('login', { title: 'login' });
});
router.post('/account/login', function (req, res) {
  const _account = req.body
  if (req.session && req.session.account) {
    res.send({success: true, result: 0})
  } else {
    Account.findOne({name: _account.name}).exec((err, account) => {
      if (err) {
        res.send({success: false, result: -1, message: err})
      }
      if(account) {
        account.comparePassword(_account.password, (err, isMatched) => {
          if (err) {
            res.send({success: false, result: -1, message: err})
          }
          if(isMatched) {
            req.session.account = {name: account.name, _id: account.id}
            res.send({success: true, result: 0, account: {_id: account.id, name: account.name}})
            // return res.redirect('/index')
          } else {
            res.send({success: true, result: 1, message: '密码错误'})
          }
        })
      } else {
        res.send({success: true, result: 2, message: '未注册用户'})
      }
    })
  }
});
router.get('/logout', function(req, res) {
  req.session.destroy()
  res.redirect('/login')
})

// API请求登录拦截
router.use((req, res, next) => {
  if (!req.session.account) {
    res.send({ success: true, result: -2, message: '请登录！' })
  } else {
    next()
  }
})


router.get('/index', function (req, res) {
  res.render('index', { username: req.session.name })
})

module.exports = router;