import express from 'express'
const app = express()
const port = 3000

import viagensRoutes from "./routes/viagens"

app.use(express.json())

app.use("/viagens", viagensRoutes)

app.get('/', (req, res) => {
  res.send('API: model de viagens')
})

app.listen(port, () => {
  console.log(`Servidor Rodando na Porta: ${port}`)
})
