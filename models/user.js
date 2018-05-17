/**
* 数据的更新和查找，以及密码加盐
*/
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FSCTOR = 10; // 计算强度,越大破解越困难
const UserSchema = new mongoose.Schema({
  name: {
    unique: true,
    type: String
  },
  password: String,
  email: String,
  state: {
    type: Boolean // 0禁用 1启用
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// 每次存入数据时都进行判断
UserSchema.pre('save', function (next) {
  const user = this
  // 数据是新数据
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  // 密码加盐
  bcrypt.genSalt(SALT_WORK_FSCTOR, function (err, salt) {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

// 添加实例方法
UserSchema.methods = {
  comparePassword: function (_password, cb) {
    bcrypt.compare(_password, this.password, function (err, res) {
      if (err) {
        return cb(err)
      }
      cb(null, res)
    })
  }
}

// 声明静态方法（模型实例化调用）
UserSchema.statics = {
  fetch: function (cb) {
    return this.find({}).sort('meta.updateAt').exec(cb)
  },
  findById: (id, cb) => {
    return this.findOne({ _id: id }).sort('meta.updateAt').exec(cb)
  }
}

// 编译模型
const User = mongoose.model('User', UserSchema)

module.exports = User