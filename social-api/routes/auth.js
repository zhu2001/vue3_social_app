const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { findOne } = require('../models/User')

// REGISTER
router.post('/register', async (req, res) => {
  try {
    User.findOne({ email: req.body.email }, (err, data) => {
      if (data) {
        res.status(409).json('该邮箱已注册用户，不能重复注册')
      } else {
        User.findOne({ username: req.body.username }, async (err, data) => {
          if (data) {
            res.status(409).json('该用户已被使用，请更换名称')
          } else {
            // 用bcrypt给密码加密
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            const newUser = new User({
              username: req.body.username,
              email: req.body.email,
              password: hashedPassword
            })
            const user = await newUser.save()
            res.status(200).json(user)
          }
        })
      }
    })
  } catch (err) {
    res.status(500).json(err)
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    User.findOne({ username: req.body.username },async (err, data) => {
      if (data) {
        // const user = await User.findOne({ username: req.body.username })
        // !user && res.status(404).json('email or password not right')
        const validPassword = await bcrypt.compare(req.body.password, data.password)
        !validPassword && res.status(409).json('email or password not right')
        const { password, ...others } = data._doc
        res.status(200).json(others)
      } else {
        res.status(409).json('用户或密码错误')
      }
    })
  } catch (err) {
    res.status(500).json(err)
  }
})


module.exports = router