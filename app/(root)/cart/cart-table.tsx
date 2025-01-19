"use client"
import React from 'react';
import {Cart, CartItem} from "@/types"
import {useRouter} from "next/navigation"
import {useToast} from '@/hooks/use-toast'
import {addItemToCart, removeItemFromCart} from '@/lib/actions/cart.actions'
import {ArrowRight, Loader, Minus, Plus} from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { Table, TableBody, TableHeader, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  sumQtyAndRemoveDuplicatedProducts,
  formatCurrency,
  sumTotalProductInCart,
} from '@/lib/utils';


const CartTable = ({cart }: {cart?: Cart}) => {

  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = React.useTransition()

  return (
    <>
      <h1 className='py-4 h2-bold'>Shopping Cart</h1>
      { !cart || (cart.items.length === 0) ? (
        <div>
          Cart is empty. <Link href='/'>Go Shopping</Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-center'>Quantity</TableHead>
                  <TableHead className='text-right'>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  cart.items.map((cartItem: CartItem, index) =>
                  {
                    return (
                    <TableRow key={index}>
                     <TableCell>
                       <Link
                         href={`/product/${cartItem.slug}`}
                         className='flex cartItems-center'
                       >
                         <Image
                           src={cartItem.image}
                           alt={cartItem.name}
                           width={50}
                           height={50}
                         />
                         <span className='px-2'>{cartItem.name}</span>
                       </Link>
                     </TableCell>
                     <TableCell className='flex-center gap-2'>
                       <Button
                         disabled={isPending}
                         variant='outline'
                         type='button'
                         onClick={() =>
                           startTransition(async () => {
                             const res = await removeItemFromCart(
                               cartItem.productId
                             );

                             if (!res.success) {
                               toast({
                                 variant: 'destructive',
                                 description: res.message,
                               });
                               router.replace('/cart')
                             }
                           })
                         }
                       >
                         {isPending ? (
                           <Loader className='w-4 h-4 animate-spin' />
                         ) : (
                           <Minus className='w-4 h-4' />
                         )}
                       </Button>
                       <span>{cartItem.qty}</span>
                       <Button
                         disabled={isPending}
                         variant='outline'
                         type='button'
                         onClick={() =>
                           startTransition(async () => {
                             const res = await addItemToCart(cartItem);

                             if (!res.success) {
                               toast({
                                 variant: 'destructive',
                                 description: res.message,
                               });
                             }
                           })
                         }
                       >
                         {isPending ? (
                           <Loader className='w-4 h-4 animate-spin' />
                         ) : (
                           <Plus className='w-4 h-4' />
                         )}
                       </Button>
                     </TableCell>
                     <TableCell className='text-right'>${cartItem.price}</TableCell>
                   </TableRow>
                 )})
                }
              </TableBody>
            </Table>
          </div>

          <Card>
            <CardContent className='p-4 gap-4'>
              <div className='pb-3 text-xl'>
                Subtotal ({sumTotalProductInCart(cart.items)}):
                <span className='font-bold'>
                  {formatCurrency(cart?.itemsPrice)}
                </span>
              </div>
              <Button
                className='w-full'
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push('/shipping-address'))
                }
              >
                {isPending ? (
                  <Loader className='w-4 h-4 animate-spin' />
                ) : (
                  <ArrowRight className='w-4 h-4' />
                )}{' '}
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;