import { PrismaClient } from '@prisma/client'
import sampleData from "@/db/sample-data"
import {hash} from "@/lib/encrypt"

async function main() {

    const prismaClient = new PrismaClient()
    await prismaClient.product.deleteMany()
    await prismaClient.account.deleteMany()
    await prismaClient.session.deleteMany()
    await prismaClient.verificationToken.deleteMany()
    await prismaClient.user.deleteMany()

    const users = []
    for(let i = 0; i < users.length; i++){
        users.push({
            ...sampleData.users[i],
            password: await hash(sampleData.users[i].password),
        })
    }

    await prismaClient.product.createMany({
        data: sampleData.products
    })
    await prismaClient.user.createMany({
        data: users
    })

    console.log('Database seeded successfully.')
}

main()