import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const vendaSchema = z.object({
    alunoId: z.number(),
    produtoId: z.number(),
    quantidade: z.number().positive("Quantidade deve ser positiva!")
})

router.get("/", async (req, res) => {
    try {
        const vendas = await prisma.venda.findMany({
            include: {
                aluno: true,
                produto: true
            }
        })
        res.status(200).json(vendas)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.post("/", async (req, res) => {
    const valida = vendaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { alunoId, produtoId, quantidade } = valida.data

    const dadoAluno = await prisma.aluno.findUnique({
        where: { id: alunoId }
    })

    if (!dadoAluno) {
        res.status(400).json({ erro: "Erro... Código do aluno inválido!"})
        return
    }

    const dadoProduto = await prisma.produto.findUnique({
        where: { id: produtoId }
    })

    if (!dadoProduto) {
        res.status(400).json({ erro: "Erro... Código do produto inválido!"})
        return
    }

    if (dadoProduto.quantidade < quantidade) {
        res.status(400).json({ erro: `Erro... Tem apenas ${dadoProduto.quantidade} unidades em estoque!`})
        return
    }

    if (quantidade * Number(dadoProduto.preco) > Number(dadoAluno.saldo)) {
        res.status(400).json({ erro: `Erro... Saldo do Aluno é de R$: ${dadoAluno.saldo}`})
        return
    }

    try {
        const [venda, aluno, produto] = await prisma.$transaction([
            prisma.venda.create({
                data: { alunoId, produtoId, quantidade, preco: Number(dadoProduto.preco) }
            }),
            prisma.aluno.update({
                where: { id: alunoId },
                data: { saldo: { decrement: quantidade * Number(dadoProduto.preco) } }
            }),
            prisma.produto.update({
                where: { id: produtoId },
                data: { quantidade: { decrement: quantidade } }
            })
        ])
        res.status(201).json(venda)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const vendaExcluida = await prisma.venda.findUnique({
            where: { id: Number(id) }
        })

        const [venda, aluno, produto] = await prisma.$transaction([
            prisma.venda.delete({ where: { id: Number(id) }}),
            prisma.aluno.update({
                where: { id: vendaExcluida?.alunoId },
                data: { saldo: { increment: vendaExcluida ? Number(vendaExcluida.preco) * vendaExcluida.quantidade : 0 } }
            }),
            prisma.produto.update({
                where: { id: vendaExcluida?.produtoId},
                data: { quantidade: { increment: vendaExcluida ? Number(vendaExcluida.quantidade) : 0 } }
            })
        ])

        res.status(200).json({ venda, aluno, produto })
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

export default router