import { prisma } from "../../lib/prisma"
import { Router } from "express"

const router = Router()

router.get("/", async (req, res) => {
    try {
        const notebooks = await prisma.notebook.findMany()
        res.status(200).json(notebooks)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.get("/ordem", async (req, res) => {
    try {
        const notebooks = await prisma.notebook.findMany({
            orderBy: { preco: "asc"},
            select: {
                modelo: true,
                marca: true,
                preco: true
            }
        })
        res.status(200).json(notebooks)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.get("/media", async (req, res) => {
    try {
        const stats = await prisma.notebook.aggregate({
            _avg: {preco: true},
            _sum: {quantidade: true},
            _count: true
        })

        const mediaPreco = stats._avg.preco?.toFixed(2) ?? 0
        const quantidadeEstoque = stats._sum.quantidade ?? 0
        const totalNotebooks = stats._count

        res.status(200).json({
            mediaPreco,
            quantidadeEstoque,
            totalNotebooks
        })
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.get("/pesquisa", async (req, res) => {
    const { marca, preco } = req.query

    try {
        const filtros: any = {}

        if (marca) filtros.marca = marca;
        if (preco) filtros.preco = { lte: Number(preco) }

        const notebooks = await prisma.notebook.findMany({ where: filtros })
        res.status(200).json(notebooks)
    } catch (error) {
        console.log(error)
        res.status(500).json({ erro: "Erro no servidor..." })
    }
})

router.get("/marca", async (req, res) => {
    try {
        const marcasCount = await prisma.notebook.groupBy({
            by: ["marca"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } }
        })

        const retorno = marcasCount.map((item) => ({
            marca: item.marca,
            quantidade: item._count.id
        }))

        res.status(200).json(retorno)

    } catch (error) {
        console.log(error)
        res.status(500).json({ erro: "Erro no servidor..." })
    }
})

router.get("/promocao", async (req, res) => {
    try {
        const notebooks = await prisma.notebook.findMany({
            select: {
                
            }
        })
    }
})

router.post("/", async (req, res) => {
    const { modelo, marca, processador, preco, quantidade } = req.body

    if (!modelo || !marca || !processador || !preco) {
        res.status(400).json({ erro: "Informe todos os dados" })
        return
    }

    try {
        const notebook = await prisma.notebook.create({
            data: { modelo, marca, processador, preco: parseFloat(preco), quantidade }
        })
        res.status(201).json(notebook)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    // recebe as variáveis vindas no corpo da requisição
    const { modelo, marca, processador, preco, quantidade } = req.body

    // verifica se os campos obrigatórios foram passados
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
    // recebe o id passado como parâmetro
    const { id } = req.params

    // realiza a exclusão do registro
    try {
        const notebook = await prisma.notebook.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(notebook)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router