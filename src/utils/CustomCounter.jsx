import { Minus, Plus } from 'lucide-react';
import React, { useState, memo, Fragment } from 'react'

//React-bootstrap
import { Button } from 'react-bootstrap'

const CustomCounter = memo(() => {
    const [counter, setCount] = useState(0);
    const increase = () => setCount(counter + 1);
    const decrease = () => setCount((counter > 0) ? counter - 1 : 0);
    return (
        <Fragment>
            <div className="btn-group iq-qty-btn custom-qty-btn rounded-3" data-qty="btn" role="group">
                <button  className='iq-quantity-minus  border-0 btn-sm' onClick={decrease}>
                    <Minus size={16} color='white' />
                </button>
                <input name='quantity' type="text" data-qty="input" className=" fw-bold btn btn-sm btn-outline-light input-display border-0" value={counter} title="Qty" placeholder="" />
                <button  className='iq-quantity-plus  border-0 btn-sm' onClick={increase}>
                    <Plus size={16} color='white' />
                </button>
            </div>
        </Fragment>
    )
})

CustomCounter.displayName = "CustomCounter"
export default CustomCounter