import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { Tipo } from "../../generated/prisma/enums"

const router = Router()

const depositoSchema = z.object({
    alunoId: z.number().int(),
    tipo: z.enum(Tipo),
    valor: z.number().min(5, "O valor do depósito deve ser no mínimo R$5,00!")
})

router.get("/", async (req, res) => {
    try {
        const depositos = await prisma.deposito.findMany({
            include: { aluno: true }
        })
        res.status(200).json(depositos)
    } catch (error) {
        res.status(500).json({ erro: "Erro de servidor..."})
    }
})

router.post("/", async (req, res) => {
    const valida = depositoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    // Desestrutura os dados validados
    const { alunoId, tipo, valor } = valida.data
    
    const aluno = await prisma.aluno.findUnique({
        where: { id: alunoId }
    })

    if (!aluno) {
        res.status(404).json({ erro: "Aluno não encontrado" })
        return
    }

    try {
        const [deposito, aluno] = await prisma.$transaction([
            prisma.deposito.create({ data: { alunoId, tipo, valor}}),
            prisma.aluno.update({
                where: { id: alunoId },
                data: { saldo: { increment: valor } }
            })
        ])

        res.status(201).json({deposito, aluno})
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", async (req, res) => {
    const valida = depositoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { id } = req.params

    const { alunoId, tipo, valor } = valida.data

    const aluno = await prisma.aluno.findUnique({
        where: { id: alunoId }
    })
    if (!aluno) {
        res.status(404).json({ erro: "Aluno não encontrado" })
        return
    }

    try {
        const [deposito, aluno] = await prisma.$transaction([
            prisma.deposito.update({
                where: { id: Number(id) },
                data: { alunoId, tipo, valor }
            }),
            prisma.aluno.update({
                where: { id: alunoId },
                data: { saldo: valor }
            })
        ])
        res.status(200).json({ deposito, aluno })
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const deposito = await prisma.deposito.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(deposito)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router