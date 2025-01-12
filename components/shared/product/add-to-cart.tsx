"use client"
import React, {useTransition} from 'react';
import {CartItem, Cart} from "@/types";
import {Button} from "@/components/ui/button"
import {useRouter} from "next/navigation"
import {BaggageClaim, ShoppingCart, Plus, Minus, Loader} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {ToastAction} from "@/components/ui/toast";
import {addItemToCart, removeItemFromCart} from "@/lib/actions/cart.actions"

const AddToCart = ({cart, items}: {cart?: Cart, items: CartItem}) => {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()

    const handleAddToCart = async() => {
        startTransition(async(): Promise<void> => {
            const res: {success: boolean, message: string} = await addItemToCart(items)
            if(!res?.success){
                toast({
                    variant: "destructive",
                    description: res.message,
                })
                return
            }
            toast({
                description: res.message,
                variant: "default",
                action: (
                    <ToastAction
                        className="bg-slate-800 hover:bg-gray-800 text-white flex items-center gap-2"
                        altText="Go to cart"
                        onClick={() => router.push("/cart")}>
                        <BaggageClaim size={18}/> Go To Cart
                    </ToastAction>
                )
            })
        })
    }

    const isItemExistInCart = cart && cart.items.find((x: CartItem) => x.productId === items.productId)

    const handleRemoveFromCart = async(): Promise<void> => {
        startTransition(async(): Promise<void> => {
            const res:  {success: boolean, message: string} = await removeItemFromCart(items.productId);
            if(cart){
                const remaining_items = isItemExistInCart!.qty - 1
                if(remaining_items === 0) cart.items = []
            }
            toast({
                variant: res.success ? 'default' : 'destructive',
                description: res.message,
            })
        })
    }

    return isItemExistInCart ? (
        <div>
            <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
                { isPending ? (<Loader className="w-4 h-4 animate-spin"/> ) : (<Minus className="h-4 w-4"/>)}
            </Button>
            <span className="px-2">{isItemExistInCart.qty}</span>
            <Button type="button" variant="outline" onClick={handleAddToCart}>
                { isPending ? (<Loader className="w-4 h-4 animate-spin"/> ) : (<Plus className="h-4 w-4"/>)}
            </Button>
        </div>
        ) : (
        <Button className="w-full" type="button" onClick={handleAddToCart}>
            { isPending ? (<Loader className="w-4 h-4 animate-spin"/> ) : (<ShoppingCart className="h-4 w-4"/>)}
            Add To Cart
        </Button>
    )

};

export default AddToCart;