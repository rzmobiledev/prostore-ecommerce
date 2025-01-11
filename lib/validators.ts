import { z } from 'zod'
import {formatNumberWithDecimal} from "@/lib/utils";

const currency = z.string().refine((value) => /^\d+(\.\d{2)?$/.test(formatNumberWithDecimal(Number(value))),
        'Price must have exactly two decimal places')

export const insertProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 characters'),
    category: z.string().min(3, 'Category must be at least 3 characters'),
    brand: z.string().min(3, 'Brand must be at least 3 characters'),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1, 'Product must have at least 1 image'),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency
})

export const insertUserSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().min(3, 'Email must be at least 3 characters'),
    password: z.string().min(3, 'Password must be at least 3 characters'),
    address: z.string().nullable(),
})

export const signInFormSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupFormSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email("Wrong email format").min(3, 'Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data): boolean => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ['confirmPassword'],
})