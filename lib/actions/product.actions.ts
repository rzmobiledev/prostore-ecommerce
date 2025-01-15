"use server"
import { prisma } from "@/db/prisma"
import {Prisma} from "@prisma/client"
import {convertToPlainObject} from "@/lib/utils"
import {LATEST_PRODUCTS_LIMIT} from '@/lib/constants'

export async function getLatestProducts<T>(): Promise<T[]> {

    try{
        const data =  await prisma.product.findMany({
            take: LATEST_PRODUCTS_LIMIT,
            orderBy: {createdAt: 'desc'}
        })

        return convertToPlainObject(data) as T[];
    } catch(e){
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            if (e.code === 'P2002') {
                console.log(
                  'There is a unique constraint violation, a new user cannot be created with this email'
                )
                return []
            }
        }
        return []
    }
}

export async function getProductBySlug<T>(slug: string): Promise<T> {

    try{
        return await prisma.product.findFirst({
            where: { slug: slug }
        }) as T
    }catch(e){
        return e as T
    }

}