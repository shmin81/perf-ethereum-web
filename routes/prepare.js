const express = require('express')

const router = express.Router()

// GET / 라우터
router.get('/', (req, res, next) => {
  console.log('prepare query', req.query)
  if (req.query.agent == undefined) {
    //alert('Accessed via an invalid path. You are returned to the main page.')
    res.redirect('/')
    return
  }
  res.render('prepare', { title: 'Prepare for Test' })
})

module.exports = router
