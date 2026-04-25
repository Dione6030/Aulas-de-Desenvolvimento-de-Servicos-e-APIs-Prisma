import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const produtoSchema = z.object({
    nome: z.string({ message: "O nome do produto é obrigatório" })
            .min(3, { message: "O nome do produto deve conter no mínimo 3 caracteres!" })
            .max(100, { message: "O nome do produto deve conter no máximo 100 caracteres!" }),
    quantidade: z.number({ message: "A quantidade do produto é obrigatória" })
            .int("A quantidade do produto deve ser um número inteiro!")
            .nonnegative("A quantidade do produto deve ser um número positivo!"),
    preco: z.number({ message: "O preço do produto é obrigatório" })
            .nonnegative("O preço do produto deve ser um número positivo!")
            .refine(value => /^\d+(\.\d{1,2})?$/.test(value.toString()), { message: "O preço do produto deve ser um número decimal com até 2 casas decimais!" })
})

router.get("/", async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({})

        res.status(200).json(produtos)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", async (req, res) => {
    const valida = produtoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    // Desestrutura os dados validados
    const { nome, quantidade, preco } = valida.data

    try {
        const selecao = await prisma.produto.create({
            data: { nome, quantidade, preco }
        })
        res.status(201).json(selecao)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", async (req, res) => {
    const valida = produtoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    const { id } = req.params

    const { nome, quantidade, preco } = req.body

    if (!nome || !quantidade || !preco) {
        res.status(400).json({ erro: "Informe todos os dados" })
        return
    }

    try {
        const produto = await prisma.produto.update({
            where: { id: Number(id) },
            data: { nome, quantidade, preco: parseFloat(preco) }
        })
        res.status(200).json(produto)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const produto = await prisma.produto.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(produto)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router