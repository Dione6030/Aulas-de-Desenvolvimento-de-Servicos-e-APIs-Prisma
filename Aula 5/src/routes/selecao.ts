import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const selecaoSchema = z.object({
    pais: z.string()
        .min(3, { message: "O nome do país deve conter no mínimo 3 caracteres!" })
        .max(50, { message: "O nome do país deve conter no máximo 50 caracteres!" }),
    continente: z.string().max(20, { message: "O nome do continente deve conter no máximo 20 caracteres!" }),
    treinador: z.string().max(40, { message: "O nome do treinador deve conter no máximo 40 caracteres!" }),
    numCopas: z.number().int().min(0).optional()
})

router.get("/", async (req, res) => {
    try {
        const selecoes = await prisma.selecao.findMany({
            include: { jogadores: true }
        })

        const selecoes2 = selecoes.map(selecao => ({
            id: selecao.id,
            pais: selecao.pais,
            continente: selecao.continente,
            treinador: selecao.treinador,
            numCopas: selecao.numCopas,
            jogadores: selecao.jogadores.map(jogador => ({
                id: jogador.id,
                nome: jogador.nome,
                posicao: jogador.posicao,
                numCamisa: jogador.numCamisa,
                dataNasc: jogador.dataNasc
            }))
        }))
        res.status(200).json(selecoes2)

    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", async (req, res) => {
    const valida = selecaoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    // Desestrutura os dados validados
    const { pais, continente, numCopas, treinador } = valida.data

    try {
        const selecao = await prisma.selecao.create({
            data: { pais, continente, numCopas, treinador }
        })
        res.status(201).json(selecao)
    } catch (error) {
        res.status(500).json({ error })
    }
})

/*
router.put("/:id", async (req, res) => {
    const { id } = req.params

    const { modelo, marca, processador, preco, quantidade } = req.body

    if (!modelo || !marca || !processador || !preco) {
        res.status(400).json({ erro: "Informe todos os dados" })
        return
    }

    try {
        const notebook = await prisma.notebook.update({
            where: { id: Number(id) },
            data: { modelo, marca, processador, preco: parseFloat(preco), quantidade }
        })
        res.status(200).json(notebook)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const notebook = await prisma.notebook.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(notebook)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})
*/
export default router