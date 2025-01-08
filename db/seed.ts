import { PrismaClient } from '@prisma/client'
import sampleData from "@/db/sample-data"

async function main() {

    const prismaClient = new PrismaClient()
    await prismaClient.product.deleteMany()

    await prismaClient.product.createMany({
        data: sampleData.products
    })

    console.log('Database seeded successfully.')
}

main()