import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { Posicao } from "../../generated/prisma/enums"

const router = Router()

const jogadorSchema = z.object({
    nome: z.string().max(60, { message: "O nome do jogador deve conter no máximo 60 caracteres!" }),
    posicao: z.enum(Posicao),
    selecaoId: z.number().int().positive('ID da seleção deve ser um número positivo'),
    dataNasc: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD")
        .transform((value) => new Date(value))
        .refine((date) => !isNaN(date.getTime()), {
            message: "Data inválida"
        }),
    numCamisa: z.number().int().min(1).max(26, 'Número da camisa entre 1 e 26'),
})

router.get("/", async (req, res) => {
    try {
        const jogadores = await prisma.jogador.findMany({
            include: { selecao: true }
        })
        
        const jogadores2 = jogadores.map(jogador => ({
            id: jogador.id,
            nome: jogador.nome,
            posicao: jogador.posicao,
            numCamisa: jogador.numCamisa,
            selecao: jogador.selecao.pais
        }))
        
        res.status(200).json(jogadores2)
    } catch (error) {
        res.status(500).json({ erro: "Erro de servidor..."})
    }
})

router.post("/", async (req, res) => {
    const valida = jogadorSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    // Desestrutura os dados validados
    const { nome, posicao, selecaoId, dataNasc, numCamisa } = valida.data

    try {
        const jogador = await prisma.jogador.create({
            data: { nome, posicao, selecaoId, dataNasc, numCamisa }
        })
        res.status(201).json(jogador)
    } catch (error) {
        res.status(500).json({ error })
    }
})

export default router