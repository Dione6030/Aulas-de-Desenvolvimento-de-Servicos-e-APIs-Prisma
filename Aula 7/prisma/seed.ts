import { prisma } from "../lib/prisma";
import { type Prisma } from "../generated/prisma/client"

const selecoes: Prisma.AlunoCreateInput[] = [
    { nome: "João", email: "joao@email.com", obs: "Aluno regular", turma: "A", responsavel: "Maria" },
    { nome: "Maria", email: "maria@email.com", obs: "Aluna excelente", turma: "B", responsavel: "Carlos" },
    { nome: "Pedro", email: "pedro@email.com", obs: "Aluno com potencial", turma: "C", responsavel: "Ana" },
    { nome: "Ana", email: "ana@email.com", obs: "Aluna dedicada", turma: "A", responsavel: "João" }
]

async function main() {
    try {
        for (const aluno of selecoes) {
            await prisma.aluno.create({ data: aluno })
        }
    } catch (error) {
        console.error("Erro nas Inclusões (Seeds):", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

await main()
