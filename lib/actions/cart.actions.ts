"use server"
import { cookies} from "next/headers"
import {CartItem} from "@/types"
import {auth} from "@/auth"
import {Session} from "@auth/core/types";
import {prisma} from "@/db/prisma";
import {convertToPlainObject, formatError, round2} from "@/lib/utils";
import {cartItemSchema, insertCartSchema} from "@/lib/validators";
import {revalidatePath} from "next/cache"
import {Prisma} from "@prisma/client";

const calcPrice = (items: CartItem[]) => {

    const itemsPrice: number = round2(
        items.reduce((acc: number, item: CartItem): number => acc + Number(item.price) * item.qty, 0)
    )
    const shippingPrice: number = round2(itemsPrice > 100 ? 0 : 10)
    const taxPrice: number = round2(0.15 * itemsPrice)
    const totalPrice: number = round2(itemsPrice + taxPrice + shippingPrice)

    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
    }
}
const toastResponse = (success: boolean, message: string) : {success: boolean, message: string} => {
    return {
        success: success,
        message: message
    }
}
const session = async(): Promise<Session|null> => await auth()
const sessionCartId = async(): Promise<string|undefined> => (await cookies()).get("sessionCartId")?.value

export async function addItemToCart(cartItem: CartItem){
    try{
        const sessCartId: string | undefined = await sessionCartId() as string
        if(!sessCartId) return{
            success:false,
            message:'Item cart id not found.'
        }

        const sess: Session|null = await session()
        const userId: string|undefined = sess?.user?.id ? (sess.user.id as string) : undefined

        const myCartItems = await getMyCart()
        const itemSchema = cartItemSchema.parse(cartItem)

        const product = await prisma.product.findFirst({
            where: {id: itemSchema.productId},
        })

        if(!product) return toastResponse(false, "Could not find product")

        if(!myCartItems) {
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [itemSchema],
                sessionCartId: sessCartId,
                ...calcPrice([itemSchema])
            })
            await prisma.cart.create({
                data: newCart
            })

            revalidatePath(`/product/${product.slug}`)
            return toastResponse(true, `${product.name} added to cart`)
        }

        const existItem = (myCartItems.items).find((x: CartItem): boolean => x.productId === cartItem.productId)
        if(existItem) {

            if(product.stock < (existItem.qty + 1)) {
                return toastResponse(false, 'Not enough stock')
            }
            (myCartItems.items as CartItem[]).find((x: CartItem): boolean => x.productId === existItem.productId)!.qty = existItem.qty + 1
        } else {
            if(product.stock < 1) {
                return toastResponse(false, 'Not enough stock')
            }

            myCartItems.items.push(cartItem)
        }

        await prisma.cart.update({
            where: {id: myCartItems.id},
            data: {
                items: myCartItems.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(myCartItems.items as CartItem[])
            }
        })
        revalidatePath(`/product/${product.slug}`)
        return toastResponse(true, `${product.name} ${existItem ? 'updated in' : 'added to'} cart`)

    }catch(err){
        const msg: string = formatError(err)
        return{
            success: false,
            message: msg,
        }
    }
}


export async function getMyCart() {
    const sess = await session()
    const userId: string|undefined = sess?.user?.id ? (sess.user.id as string) : undefined

    const cart = await prisma.cart.findFirst({
        where: userId ? {userId: userId} : {sessionCartId: await sessionCartId()}
    })
    if(!cart) return undefined

    return convertToPlainObject({
        ...cart,
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString(),
    })
}

export async function removeItemFromCart(productId: string) {
    try{
        const product = await prisma.product.findFirst({
            where: {id: productId}
        })
        if(!product) return toastResponse(false, "Product not found")

        const getMyCartItems = await getMyCart()
        if(!getMyCartItems) return toastResponse(false, "Cart is empty")

        const itemToDelete = (getMyCartItems.items).find((x: CartItem): boolean => x.productId === productId)
        if(!itemToDelete) return toastResponse(false, "Item not found")

        if(itemToDelete.qty === 1) {
            getMyCartItems.items = getMyCartItems.items.filter((x: CartItem): boolean => x.productId !== itemToDelete.productId)
        } else {
            getMyCartItems.items.find((x: CartItem): boolean=> x.productId === productId)!.qty = itemToDelete.qty - 1
        }

        if(!getMyCartItems.items.length){
            const sessCartId: string | undefined = await sessionCartId() as string
            await prisma.cart.delete({
                where: {
                    id: getMyCartItems.id,
                    sessionCartId: sessCartId
                },
            })
            getMyCartItems.items = []
            return toastResponse(false, "All product were removed from cart")
        }

        await prisma.cart.update({
            where: {id: getMyCartItems.id},
            data: {
                items: getMyCartItems.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(getMyCartItems.items as CartItem[])
            }
        })

        revalidatePath(`/product/${product.slug}`)
        return toastResponse(true, `${product.name} was removed from cart`)

    }catch(err){
        const msg: string = formatError(err)
        return toastResponse(false, msg)
    }
}