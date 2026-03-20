import { prisma } from "../../lib/prisma"
import { Router } from "express"

const router = Router()

function parseIsoUtcDate(value: unknown): Date | null {
    if (typeof value !== "string") return null

    const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    if (!isoUtcRegex.test(value)) return null

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return null

    const normalized = parsedDate.toISOString().replace(".000Z", "Z")
    if (normalized !== value) return null

    return parsedDate
}

router.get("/", async (req, res) => {
    try {
        const viagens = await prisma.viagem.findMany()
        res.status(200).json(viagens)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", async (req, res) => {
    const { localSaida, destino, transporte, dataSaida, dataRetorno, roteiro = null, preco } = req.body

    if (!localSaida || !destino || !transporte || !dataSaida || !dataRetorno || !preco) {
        res.status(400).json({ erro: "Informe todos os dados" })
        return
    }

    const dataSaidaDate = parseIsoUtcDate(dataSaida)
    const dataRetornoDate = parseIsoUtcDate(dataRetorno)

    if (!dataSaidaDate || !dataRetornoDate) {
        res.status(400).json({
            erro: "Datas inválidas. Use o formato ISO UTC: YYYY-MM-DDTHH:mm:ssZ"
        })
        return
    }

    try {
        const viagen = await prisma.viagem.create({
            data: { localSaida, destino, transporte, dataSaida: dataSaidaDate, dataRetorno: dataRetornoDate, roteiro, preco: parseFloat(preco)}
        })
        res.status(201).json(viagen)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    // recebe as variáveis vindas no corpo da requisição
    const { localSaida, destino, transporte, dataSaida, dataRetorno, roteiro, preco } = req.body

    // verifica se os campos obrigatórios foram passados
    if (!localSaida || !destino || !transporte || !dataSaida || !dataRetorno || !preco) {
        res.status(400).json({ erro: "Informe todos os dados" })
        return
    }

    const dataSaidaDate = parseIsoUtcDate(dataSaida)
    const dataRetornoDate = parseIsoUtcDate(dataRetorno)

    if (!dataSaidaDate || !dataRetornoDate) {
        res.status(400).json({
            erro: "Datas inválidas. Use o formato ISO UTC: YYYY-MM-DDTHH:mm:ssZ"
        })
        return
    }

    try {
        const viagen = await prisma.viagem.update({
            where: { id: Number(id) },
            data: { localSaida, destino, transporte, dataSaida: dataSaidaDate, dataRetorno: dataRetornoDate, roteiro, preco: parseFloat(preco) }
        })
        res.status(200).json(viagen)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    // realiza a exclusão do viagen
    try {
        const viagen = await prisma.viagem.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(viagen)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router