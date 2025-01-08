import {z} from 'zod'
import {insertProductSchema} from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
    id: string
    price: number
    rating: string
    createdAt: Date
}

export const dataProducts = <T extends Product, K extends keyof T>(products: T[K]): T[K] => products
