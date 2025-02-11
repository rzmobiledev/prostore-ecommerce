import React, {Suspense} from 'react'
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts} from "@/lib/actions/product.actions";
import {Product} from "@/types";
import Loading from "@/app/loading";


const Homepage = async() => {
    const latestProducts = await getLatestProducts<Product>();
    return (
        <>
            <Suspense fallback={<Loading />}>
                <ProductList data={latestProducts} title="Newest Arrivals"/>
            </Suspense>
        </>
    );
};

export default Homepage;