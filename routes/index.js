const express = require('express')

const router = express.Router()

// GET / 라우터
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Performance Test' })
})

module.exports = router
