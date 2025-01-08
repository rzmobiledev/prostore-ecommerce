import React from 'react'
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts} from "@/lib/actions/product.actions";
import {Product} from "@/types";

const Homepage = async() => {
    const latestProducts = await getLatestProducts<Product>();
    return (
        <>
            <ProductList data={latestProducts} title="Newest Arrivals"/>
        </>
    );
};

export default Homepage;