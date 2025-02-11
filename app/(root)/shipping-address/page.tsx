import React from 'react'
import {auth} from '@/auth'
import {getMyCart} from '@/lib/actions/cart.actions'
import {Metadata} from 'next'
import { redirect } from 'next/navigation'
import { ShippingAddress, User } from '@/types';
import {getUserById} from '@/lib/actions/user.actions'
import ShippingAddressForm from '@/app/(root)/shipping-address/shipping-address-form'
import CheckoutSteps from "@/components/shared/checkout-steps"

export const metadata: Metadata = {
  title: 'Shipping Address'
}

const ShippingAddressPage = async() => {
  const cart = await getMyCart()
  if(!cart || cart.items.length === 0) return redirect('/cart')

  const session = await auth()
  const userId = session?.user?.id
  if(!userId) return redirect('/sign-in')

  const user = await getUserById(userId) as User
  return (
    <>
      <CheckoutSteps current={1}/>
      <ShippingAddressForm address={user?.address as unknown as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;