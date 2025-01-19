import React, { Suspense } from 'react';
import CartTable from '@/app/(root)/cart/cart-table';
import {getMyCart} from '@/lib/actions/cart.actions';
import { Cart } from "@/types"
import Loading from '@/app/loading';

export const metadata = {
  title: "Shopping Cart",
}

const Page = async() => {
  const cart: Cart|undefined = await getMyCart()

  return (
    <div>
      <Suspense fallback={<Loading/>}>
        <CartTable cart={cart} />
      </Suspense>
    </div>
  );
};

export default Page;