import {z} from 'zod'
import {insertProductSchema} from "@/lib/validators";

type ProductData = z.infer<typeof insertProductSchema> & {
    id: string
    rating: string
    createdAt: Date
}

export type Product = Omit<ProductData, 'price' | 'rating'> & {
    price: number
    rating: string
}

export const dataProducts = <T extends Product, K extends keyof T>(products: T[K]): T[K] => products
