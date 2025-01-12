import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {z} from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert prisma object into a regular js object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`
}

export function round2(value: number|string): number{
  if(typeof value === "number"){
    return Math.round((value + Number.EPSILON) * 100) / 100
  }
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export function formatError(error: unknown){
  if(error instanceof z.ZodError){
    return error.issues.map(msg => msg.message).join(',')
  }
  if(error instanceof Error){
    return error.message
  }
  else {
    return 'Unknown error'
  }
}