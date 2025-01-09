import {z} from 'zod'
import {insertProductSchema, insertUserSchema} from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
    id: string
    price: number
    rating: string
    numReviews: number
    createdAt: Date
}

export type User = z.infer<typeof insertUserSchema> & {
    role?: string
    emailVerified?: Date
    image?: string
    address?: JSON
    paymentMethod?: string
    createdAt?: Date
    updatedAt?: Date
}

export const dataProducts = <T extends Product, K extends keyof T>(products: T[K]): T[K] => products
