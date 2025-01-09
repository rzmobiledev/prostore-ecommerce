"use client"
import React from 'react';
import Image from 'next/image'
import { cn } from '@/lib/utils'

const ProductImages = ({ images}: { images: string[] }) => {

    const [current, setCurrent] = React.useState(0)

    return (
        <div className="space-y-4">
            <Image src={images[current]} alt='Product Image' width={1000} height={1000} className="min-h-[300px]
            object-cover object-center"/>
            <div className="flex">
                {
                    images.map((image: string, i: number) => (
                        <div key={i} onClick={(): void => setCurrent(i)}
                             className={ cn('border mr-2 cursor-pointer hover:border-orange-600', current === i && 'border-orange-500') }>
                            <Image src={image} alt='image' width={100} height={100}/>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default ProductImages;