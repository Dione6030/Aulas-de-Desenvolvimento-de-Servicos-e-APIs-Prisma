import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const alunoSchema = z.object({
    nome: z.string("O nome do aluno é obrigatório" )
            .min(10, "O nome do aluno deve conter no mínimo 10 caracteres!" )
            .max(100, "O nome do aluno deve conter no máximo 100 caracteres!" ),
    email: z.email("O email do aluno deve ser um email válido!" )
            .max(60, "O email do aluno deve conter no máximo 60 caracteres!" ),
    obs: z.string().optional(),
    turma: z.string("A turma do aluno é obrigatória" )
            .min(2, "A turma do aluno deve conter no mínimo 2 caracteres!" )
            .max(4, "A turma do aluno deve conter no máximo 4 caracteres!" ),
    responsavel: z.string("O nome do responsável do aluno é obrigatório" )
            .min(10, "O nome do responsável do aluno deve conter no mínimo 10 caracteres!" )
            .max(60, "O nome do responsável do aluno deve conter no máximo 60 caracteres!" )
})

router.get("/", async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany({})
        
        res.status(200).json(alunos)
    } catch (error) {
        res.status(500).json({ erro: "Erro de servidor..."})
    }
})

router.post("/", async (req, res) => {
    const valida = alunoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    // Desestrutura os dados validados
    const { nome, email, obs = "", turma, responsavel} = valida.data

    try {
        const aluno = await prisma.aluno.create({
            data: { nome, email, obs, turma, responsavel }
        })
        res.status(201).json(aluno)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    const valida = alunoSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, obs, turma, responsavel} = valida.data

    try {
        const aluno = await prisma.aluno.update({
            where: { id: Number(id) },
            data: { nome, email, obs, turma, responsavel }
        })
        res.status(200).json(aluno)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        await prisma.aluno.delete({
            where: { id: Number(id) }
        })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const aluno = await prisma.aluno.findUnique({
            where: { id: Number(id) }
        })
        if (!aluno) {
            res.status(404).json({ erro: "Aluno não encontrado" })
            return
        }
        res.status(200).json(aluno)
    } catch (error) {
        res.status(500).json({ error })
    }
})

export default router