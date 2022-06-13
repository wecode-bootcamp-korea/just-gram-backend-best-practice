const http = require('http')
const { sendProducts } = require('./sendProducts')
const { signUp } = require('./signUp')

const server = http.createServer((req, res) => {
  const { url, method } = req
  res.setHeader('Content-Type', 'application/json')

  if (url === '/ping') {
    return res.end(JSON.stringify({ message: '/ pong' }))
  }
  if (url === '/signup' && method === 'POST') return res.end(JSON.stringify({ message: '회원가입 실패!' }))
  if (url === '/signup' && method === 'POST') return signUp(req, res) 
  if (url === '/login' && method === 'POST') return res.end(JSON.stringify({ message: '로그인 완료!' }))
  if (url === '/products' && method === 'GET') return sendProducts(res)

  res.end(JSON.stringify({ message: 'this response answers to every request' }))
})

server.listen(8000, () => { console.log('server is listening on PORT 8000')})