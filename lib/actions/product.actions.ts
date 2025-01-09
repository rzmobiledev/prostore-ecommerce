"use server"
import { prisma } from "@/db/prisma"
import {convertToPlainObject} from "@/lib/utils"
import {LATEST_PRODUCTS_LIMIT} from '@/lib/constants'

export async function getLatestProducts<T>(): Promise<T[]> {

    const data =  await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: {createdAt: 'desc'}
    })

    return convertToPlainObject(data) as T[];
}

export async function getProductBySlug<T>(slug: string): Promise<T> {
    return await prisma.product.findFirst({
        where: { slug: slug }
    }) as T
}