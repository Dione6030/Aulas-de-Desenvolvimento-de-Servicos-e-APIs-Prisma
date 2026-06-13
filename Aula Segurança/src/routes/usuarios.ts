import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { randomInt } from "crypto"

const router = Router()

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

const codigo = randomInt(0, 9999).toString().padStart(4, '0')

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

    await prisma.usuario.update({
      where: { email },
      data: { codigorecuperativo: codigo }
    })

    // Aqui você poderia gerar um código de recuperação e enviar por e-mail
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
