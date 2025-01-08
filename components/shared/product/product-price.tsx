import React from 'react'
import { cn } from '@/lib/utils'

const ProductPrice = ({ value, className}: {value: number, className?: string}) => {
    // ensure two decimal places
    const stringValue: string = value.toFixed(2)
    // get the int/float
    const [intValue, floatValue] = stringValue.split('.')

    return (
        <p className={ cn('text-2xl', className) }>
            <span className="text-xs align-super">$</span>
            {intValue}
            <span className="text-xs align-super">.{floatValue}</span>
        </p>
    );
};

export default ProductPrice;