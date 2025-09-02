import React from 'react'
import { useMyContext } from "@/Context/MyContextProvider";

const CommonPricingComp = ({currency, isSale, price, salePrice }) => {
    const {getCurrencySymbol} = useMyContext()
    return (
        <span>
            {
                isSale === 1 ?
                    <>
                        <span className="mb-0 text-muted" style={{ textDecorationLine: 'line-through', textDecorationStyle: 'solid' }}>
                            {getCurrencySymbol(currency)+price}
                        </span>
                        <span className="mb-0">
                            {getCurrencySymbol(currency)+salePrice}
                        </span>
                    </>
                    :
                    getCurrencySymbol(currency)+price
            }
        </span>
    )
}

export default CommonPricingComp
