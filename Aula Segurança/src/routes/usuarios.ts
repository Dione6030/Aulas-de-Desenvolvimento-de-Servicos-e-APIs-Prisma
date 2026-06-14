import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { randomInt } from "crypto"
import nodemailer from "nodemailer"

const router = Router()

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_EMAIL,
    pass: process.env.MAILTRAP_SENHA
  },
})

const usuarioSchema = z.object({
  nome: z.string().min(10,
    { message: "Nome deve possuir, no mínimo, 10 caracteres" }),
  email: z.email().min(10,
    { message: "E-mail, no mínimo, 10 caracteres" }),
  senha: z.string()  
})

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany()
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

function validaSenha(senha: string) {

  const mensa: string[] = []

  // .length: retorna o tamanho da string (da senha)
  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  // contadores
  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  // senha = "abc123"
  // letra = "a"

  // percorre as letras da variável senha
  for (const letra of senha) {
    // expressão regular
    if ((/[a-z]/).test(letra)) {
      pequenas++
    }
    else if ((/[A-Z]/).test(letra)) {
      grandes++
    }
    else if ((/[0-9]/).test(letra)) {
      numeros++
    } else {
      simbolos++
    }
  }

  if (pequenas == 0) {
    mensa.push("Erro... senha deve possuir letra(s) minúscula(s)")
  }

  if (grandes == 0) {
    mensa.push("Erro... senha deve possuir letra(s) maiúscula(s)")
  }

  if (numeros == 0) {
    mensa.push("Erro... senha deve possuir número(s)")
  }

  if (simbolos == 0) {
    mensa.push("Erro... senha deve possuir símbolo(s)")
  }

  return mensa
}

router.post("/", async (req, res) => {

  const valida = usuarioSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, email, senha } = valida.data

  const mensaErros = validaSenha(senha)

  if (mensaErros.length > 0) {
    res.status(400).json({erro: mensaErros})
    return
  }

  // gera um "salt" (sal/tempero) que é acrescentado a senha
  // 12 é o número de voltas (repetições) feitas na geração do salt
  // que o torna mais lento (útil para evitar/atrasar ataques de força bruta)
  const salt = bcrypt.genSaltSync(12)

  // gera o hash da senha acrescida do salt
  const hash = bcrypt.hashSync(senha, salt)  

  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash }
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await prisma.usuario.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(usuario)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

function geraHTML(dados: any) {
  const dataEnvio = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; line-height: 1.6;">
        <h2>Recuperação de senha</h2>
        <p><strong>Data do envio:</strong> ${dataEnvio}</p>
        <p><strong>Usuário:</strong> ${dados.nome}</p>
        <p>Olá, aqui está a sua senha de recuperação</p>
        <h1 style="letter-spacing: 4px;">${dados.codigo}</h1>
      </body>
    </html>
  `
}

async function enviaEmail(dados: any) {
  const mensagem = geraHTML(dados)

  const info = await transporter.sendMail({
    from: 'Recuperação de Senha <cantina@gmail.com>',
    to: dados.email,
    subject: "Código de recuperação de senha",
    text: `Olá, aqui está a sua senha de recuperação: ${dados.codigo}`,
    html: mensagem,
  })

  console.log("Message sent:", info.messageId)
}

router.post("/recuperar-senha", async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ erro: "Informe o e-mail do usuário" })
    return
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      res.status(404).json({ erro: "Usuário não encontrado" })
      return
    }

    const codigo = randomInt(0, 9999).toString().padStart(4, '0')

    await prisma.usuario.update({
      where: { email },
      data: { codigorecuperativo: codigo }
    })

    await enviaEmail({
      nome: usuario.nome,
      email: usuario.email,
      codigo
    })

    res.status(200).json({ mensagem: "Código de recuperação enviado com sucesso" })
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/resetar-senha", async (req, res) => {
  const { email, codigo, novaSenha } = req.body

  const mensaPadrao = "E-mail, código ou nova senha inválidos"

  if (!email || !codigo || !novaSenha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })
    if (!usuario || usuario.codigorecuperativo !== codigo) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const mensaErros = validaSenha(novaSenha)

    if (mensaErros.length > 0) {
      res.status(400).json({erro: mensaErros})
      return
    }

    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(novaSenha, salt)

    await prisma.usuario.update({
      where: { email },
      data: { senha: hash, codigorecuperativo: null }
    })

    res.status(200).json({ mensagem: "Senha resetada com sucesso" })
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router
