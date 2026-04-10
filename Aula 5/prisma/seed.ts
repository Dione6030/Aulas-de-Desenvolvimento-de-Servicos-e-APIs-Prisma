import { prisma } from "../lib/prisma";
import { type Prisma } from "../generated/prisma/client"

const notebooks: Prisma.NotebookCreateInput[]  = [
    {
        "modelo": "Dell Inspiron 15",
        "marca": "Dell",
        "processador": "Intel",
        "preco": 3500.00,
        "quantidade": 10
    },
    {
        "modelo": "HP Pavilion 14",
        "marca": "HP",
        "processador": "AMD",
        "preco": 2800.00,
        "quantidade": 15
    },
    {
        "modelo": "Lenovo IdeaPad 3",
        "marca": "Lenovo",
        "processador": "Intel",
        "preco": 3200.00,
        "quantidade": 8
    },
    {
        "modelo": "Acer Aspire 5",
        "marca": "Acer",
        "processador": "AMD",
        "preco": 2900.00,
        "quantidade": 12
    },
    {
        "modelo": "Asus VivoBook 15",
        "marca": "Asus",
        "processador": "Intel",
        "preco": 3400.00,
        "quantidade": 20
    },
    {
        "modelo": "Samsung Galaxy Book 2",
        "marca": "Samsung",
        "processador": "Intel",
        "preco": 4200.00,
        "quantidade": 6
    },
    {
        "modelo": "MacBook Air M2",
        "marca": "Apple",
        "processador": "AMD",
        "preco": 8500.00,
        "quantidade": 5
    },
    {
        "modelo": "Dell XPS 13",
        "marca": "Dell",
        "processador": "Intel",
        "preco": 7200.00,
        "quantidade": 4
    },
    {
        "modelo": "HP Envy x360",
        "marca": "HP",
        "processador": "AMD",
        "preco": 4800.00,
        "quantidade": 9
    },
    {
        "modelo": "Lenovo ThinkPad E14",
        "marca": "Lenovo",
        "processador": "Intel",
        "preco": 4100.00,
        "quantidade": 11
    },
    {
        "modelo": "Acer Nitro 5",
        "marca": "Acer",
        "processador": "Intel",
        "preco": 5200.00,
        "quantidade": 7
    },
    {
        "modelo": "Asus ROG Strix",
        "marca": "Asus",
        "processador": "AMD",
        "preco": 6800.00,
        "quantidade": 3
    },
    {
        "modelo": "MSI Modern 14",
        "marca": "MSI",
        "processador": "Intel",
        "preco": 3600.00,
        "quantidade": 14
    },
    {
        "modelo": "LG Gram 17",
        "marca": "LG",
        "processador": "Intel",
        "preco": 6500.00,
        "quantidade": 2
    },
    {
        "modelo": "Surface Laptop 5",
        "marca": "Microsoft",
        "processador": "Intel",
        "preco": 5900.00,
        "quantidade": 8
    },
    {
        "modelo": "Vaio FE15",
        "marca": "Vaio",
        "processador": "AMD",
        "preco": 3100.00,
        "quantidade": 16
    },
    {
        "modelo": "Positivo Master",
        "marca": "Positivo",
        "processador": "Intel",
        "preco": 2200.00,
        "quantidade": 25
    },
    {
        "modelo": "Samsung Book 4",
        "marca": "Samsung",
        "processador": "Intel",
        "preco": 3800.00,
        "quantidade": 13
    },
    {
        "modelo": "HP Victus 16",
        "marca": "HP",
        "processador": "AMD",
        "preco": 4500.00,
        "quantidade": 10
    },
    {
        "modelo": "Lenovo Legion 5",
        "marca": "Lenovo",
        "processador": "AMD",
        "preco": 7500.00,
        "quantidade": 5
    },
    {
        "modelo": "Dell G15",
        "marca": "Dell",
        "processador": "Intel",
        "preco": 4900.00,
        "quantidade": 9
    }
]

async function main() {
    try {
        await prisma.notebook.createMany({ data: notebooks })
        console.log(`${notebooks.length} Notebooks Cadastrados...`)
    } catch (error) {
        console.error("Erro nas Inclusões (Seeds):", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

await main()
