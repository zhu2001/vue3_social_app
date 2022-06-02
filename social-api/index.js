const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const userRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/posts')
const multer = require('multer')
const path =require("path")

dotenv.config()
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to mongoDB'))
  .catch(err => console.log(err))

app.use("/images", express.static(path.join(__dirname, "images")))
  
// Middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,'images')
  },
  filename: (req,file, cd)=> {
    cd(null,req.body.name)
  }
})

const upload = multer({storage})
app.post("/api/upload", upload.single("file"), (req, res) =>{
  try {
    return res.status(200).json("File uploaded successfully")
  } catch (err) {
    console.log(err)
  }
})

app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)

app.listen('3000', (err) => {
  if (err) console.log(err)
  console.log('http://localhost:3000 服务器启动成功')
})