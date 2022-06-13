const http = require('http')
const express = require('express')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient() 

const app = express()
app.use(express.json()) // for parsing application/json
app.post('/users/signup', async (req, res) => { // 1
  try { // 2
   
    const { email, password } = req.body // 3

    if (!email.includes('@') || !email.includes('.')) {
      const error = new Error('INVALID_EMAIL')
      error.statusCode = 400
      throw error
    }

    if (!password.length < 8) {
      const error = new Error('PASSWORD_TOO_SHORT')
      error.statusCode = 400
      throw error
    }

    const [existingUser] = await prisma.$queryRaw`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser) {
      const error = new Error('EXISTING_USER')
      error.satusCode = 409
      throw error
    }

    const createdUser = await prisma.$queryRaw`
      INSERT INTO users(email, password) VALUES (${email}, ${password});
    ` // 4

    return res.status(201).json({ message: "CREATED" }) // 5
  } catch (err) { // 2
    console.log(err)
    return res.status(err.statusCode || 500).json({ message: err.message }) // 6
  }
})

app.get('/postings', async(req, res) => {
  const postings = await prisma.$queryRaw`
    SELECT
      postings.id,
      postings.contents, 
      users.nickname
    FROM users 
    JOIN postings ON postings.user_id = users.id;
  `

  // 1. for loop
  for (let i = 0; i < postings.length; i++) {
    const posting = postings[i]
    posting.username = posting.nickname
    delete posting.nickname
  }

  // 2. map
  postings.map((posting) => {
    posting.username = posting.nickname
    delete posting.nickname
  })

  // 3. spread 연산자 ...

  return res.status(200).json({data: postings})
})

app.get('/postings/:id', async (req, res) => {
  try {

    const { id } = req.params

    const posting = await prisma.$queryRaw`
      SELECT
        postings.id as postingId,
        postings.contents,
        comments.id as commentId,
        users.nickname as username,
        comments.comment
      FROM
        users
      JOIN postings ON postings.user_id = users.id
      JOIN comments ON comments.posting_id = postings.id
      WHERE postings.id = ${id};
    `

    if (posting.length === 0) {
      const error = new Error('POSTING_NOT_FOUND')
      error.statuCode = 404
      throw error
    }

    return res.status(200).json({data: posting})
  } catch (err) {
    console.log(err)
    return res.status(err.statusCode || 500).json({ message: err.message })
  }
})

const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
    await prisma.$disconnect() // 에러가 발생했을 시에 database 연결을 종료합니다.
  }
}

start()