import React, { useState, memo, Fragment,useEffect } from 'react'
import { Minus, Plus } from 'lucide-react';
import { useMyContext } from '@/Context/MyContextProvider';
//React-bootstrap
import { Button } from 'react-bootstrap'

const CustomCounter = memo((props) => {
 const { getTicketCount, category, price, limit, ticketID, disabled = false, selectedTickets, resetCounterTrigger } = props
    const { ErrorAlert } = useMyContext()
    const [counter, setCount] = useState(0);

    useEffect(() => {
        if (resetCounterTrigger) {
            setCount(0)
        }
    }, [resetCounterTrigger]);

    useEffect(() => {
        if (selectedTickets?.id === ticketID) {
            setCount(selectedTickets?.quantity || 0);
        } 
        else {
            // setCount();
        }
    }, [selectedTickets, ticketID]);

    const increase = () => {
        if (parseInt(counter) === parseInt(limit)) {
            ErrorAlert(`You can select max ${limit} tickets`)
            return;
        }
        const newCount = counter < limit ? counter + 1 : counter;
        setCount(newCount);
        // Call getTicketCount after state update
        setTimeout(() => {
            getTicketCount(newCount, category, price, ticketID);
        }, 0);
    };

    const decrease = () => {
        const newCount = counter > 0 ? counter - 1 : 0;
        setCount(newCount);
        // Call getTicketCount after state update
        setTimeout(() => {
            getTicketCount(newCount, category, price, ticketID);
        }, 0);
    };
    return (
        <Fragment>
            <div
                className="btn-group iq-qty-btn custom-qty-btn rounded-3"
                data-qty="btn"
                role="group"
                style={{
                    pointerEvents: disabled ? 'none' : 'auto',
                    fontSize: '1.25rem', // Increase font size
                    minHeight: '48px',   // Increase height
                }}
            >
                <button
                    className='iq-quantity-minus border-0 btn-sm'
                    onClick={decrease}
                    style={{
                        lineHeight: 'initial',
                    }}
                >
                    <Minus size={22} color='white' /> {/* Increased icon size */}
                </button>
                <input
                    name='quantity'
                    type="text"
                    data-qty="input"
                    className="fw-bold btn btn-sm btn-outline-light input-display border-0"
                    value={counter}
                    title="Qty"
                    placeholder=""
                    style={{
                        width: '48px',         // Wider input
                        fontSize: '1.25rem',   // Larger font
                        textAlign: 'center',
                        padding: '8px 0',
                    }}
                    readOnly
                />
                <button
                    className='iq-quantity-plus border-0 btn-sm'
                    onClick={increase}
                    style={{
                        lineHeight: 'initial',
                    }}
                >
                    <Plus size={22} color='white' /> {/* Increased icon size */}
                </button>
            </div>
        </Fragment>
    )
})

CustomCounter.displayName = "CustomCounter"
export default CustomCounter