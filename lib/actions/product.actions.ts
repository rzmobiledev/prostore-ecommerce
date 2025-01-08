"use server"
import {PrismaClient} from '@prisma/client'
import {convertToPlainObject} from "@/lib/utils"
import {LATEST_PRODUCTS_LIMIT} from '@/lib/constants'

export async function getLatestProducts<T>(): Promise<T[]> {
    const prismaClient = new PrismaClient()
    const data =  await prismaClient.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: {createdAt: 'desc'}
    })

    return convertToPlainObject(data) as T[];
}