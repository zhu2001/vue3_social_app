const bcrypt = require('bcryptjs')
const User = require('../models/User')
const router = require('express').Router()


// update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.body.userId, {
        $set: req.body
      })
      console.log(req.body)
      res.status(200).json('Account has been updated')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('You can update only your account!')
  }
})

// delete user
router.delete('/:id', async (req, res) => {
  if (req.body.username === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      res.status(200).json(`用户名${user.username}被删除`)
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    res.status(403).json('You can update only your account!')
  }
})


// get a user
router.get('/', async (req, res) => {
  const userId = req.query.userId
  const username = req.query.username
  try {
    const user = userId ? await User.findById( userId ):await User.findOne({username:username})
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json(err)
  }
})
// router.get('/:id', (req, res) => {
//   User.findOne({ _id: req.params.id }, (err, doc) => {
//     if (err) {
//       res.status(500).json('用户不存在')
//     } else{
//       res.status(200).json(123)
//     }
//   })

// })

// get friends
router.get('/friends/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    const friends = await Promise.all(
      user.followings.map(friendId => {
        return User.findById(friendId)
      })
    )
    let friendList = []
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend
      friendList.push({_id, username, profilePicture})
    })
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err)
  }
})

// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.params.id !== req.body.userId) {
    try {
      const user = await User.findById(req.params.id)// 用户关注的
      const currentUser = await User.findById(req.body.userId)// 用户自己
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { followings: req.params.id } })
        res.status(200).json('user has been followed')
      } else {
        res.status(403).json('you already follow this user')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('you can\'t follow yourself')
  }
})

// unFollow a user
router.put('/:id/unFollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { followings: req.params.id } })
        res.status(200).json('user has been unFollowed')
      } else {
        res.status(403).json('you haven\'t follow this user')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('you can\'t unFollow yourself')
  }
})

module.exports = router