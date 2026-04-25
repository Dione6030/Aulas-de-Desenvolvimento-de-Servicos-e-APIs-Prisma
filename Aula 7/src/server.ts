import express from 'express'
const app = express()
const port = 3000

import alunoRoutes from "./routes/aluno"
import produtoRoutes from "./routes/produto"
import depositoRoutes from "./routes/deposito"
import vendaRoutes from "./routes/venda"

app.use(express.json())

app.use("/aluno", alunoRoutes)
app.use("/produto", produtoRoutes)
app.use("/deposito", depositoRoutes)
app.use("/venda", vendaRoutes)

app.get('/', (req, res) => {
  res.send('API: Controle de Cantina Escolar')
})

app.listen(port, () => {
  console.log(`Servidor Rodando na Porta: ${port}`)
})
