const express = require('express')
const morgan = require('morgan')
const path = require('path')
const nunjucks = require('nunjucks')
const cors = require('cors')

const indexRouter = require('./routes')
const userRouter = require('./routes/user')
const prepareRouter = require('./routes/prepare')
const testcaseRouter = require('./routes/testcase')

const app = express()
app.set('port', process.env.PORT || 10010)
app.set('view engine', 'html')
nunjucks.configure('views', {
  express: app,
  watch: true,
})

app.use(morgan('dev'))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors()) // Enable All CORS Requests

app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/prepare', prepareRouter)
app.use('/testcase', testcaseRouter)

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  next(error)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중')
})
