import { PrismaClient } from '@prisma/client'
import sampleData from "@/db/sample-data"

async function main() {

    const prismaClient = new PrismaClient()
    await prismaClient.product.deleteMany()
    await prismaClient.account.deleteMany()
    await prismaClient.session.deleteMany()
    await prismaClient.verificationToken.deleteMany()
    await prismaClient.user.deleteMany()

    await prismaClient.product.createMany({
        data: sampleData.products
    })
    await prismaClient.user.createMany({
        data: sampleData.users
    })

    console.log('Database seeded successfully.')
}

main()