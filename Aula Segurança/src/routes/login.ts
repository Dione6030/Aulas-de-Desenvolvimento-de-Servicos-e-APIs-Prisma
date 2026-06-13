import { prisma } from "../../lib/prisma"
import { Router } from "express"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body

  // em termos de segurança, o recomendado é exibir uma mensagem padrão
  // a fim de evitar de dar "dicas" sobre o processo de login para hackers
  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    // res.status(400).json({ erro: "Informe e-mail e senha do usuário" })
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuario == null) {
      // res.status(400).json({ erro: "E-mail inválido" })
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    // se o e-mail existe, faz-se a comparação dos hashs
    if (bcrypt.compareSync(senha, usuario.senha)) {

      // se login válido, gera o token
      const payload = { userLogadoId: usuario.id, userLogadoNome: usuario.nome }
      const secret = process.env.JWT_SECRET as string
      const options = { expiresIn: '15m' } as object

      const token = jwt.sign(payload, secret, options)

      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token
      })
    } else {
      // res.status(400).json({ erro: "Senha incorreta" })
      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router