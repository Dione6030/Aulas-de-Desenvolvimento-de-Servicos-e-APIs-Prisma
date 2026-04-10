import express from 'express'
const app = express()
const port = 3000

import notebooksRoutes from "./routes/notebooks"

app.use(express.json())

app.use("/notebooks", notebooksRoutes)

app.get('/', (req, res) => {
  res.send('API: model para loja de notebooks')
})

app.listen(port, () => {
  console.log(`Servidor Rodando na Porta: ${port}`)
})
