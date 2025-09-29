import React from 'react'
import { Image, Table } from 'react-bootstrap';
import CustomCounter from '../Events/Counter/customCounter';
import CommonPricingComp from './CommonPricingComp';
import { useMyContext } from "@/Context/MyContextProvider";
import Link from 'next/link';

const CheckOutTickets = (props) => {
    const { event, resetCounterTrigger, getTicketCount, selectedTickets, isMobile,loading ,tickets} = props;
    const { getCurrencySymbol, loader } = useMyContext()
    if (loading) {
        return (
            <div className="text-center p-4">
                <Image src={loader} alt="loading" loading='lazy' width={150} />
                <p className="mt-2 text-primary">Fetching tickets...</p>
            </div>
        );
    }
    return (
        <Table responsive className="mb-0">
            <tbody>
                {(tickets || event?.tickets)?.map((item, index) => {
                    return (
                        <tr data-item="list" key={index} className={`${(item.sold_out === 1 || item.booking_not_open === 1) && 'opacity-50'}`} style={{ pointerEvents: (item.sold_out === 1 || item.booking_not_open === 1) && 'none' }}>
                            <td className={`pe-0 ${isMobile ? 'h5' : 'h6'}`}>
                                <div className="d-flex align-items-center gap-4">
                                    <div>
                                        <p className="mb-3">{item.name}{'  '}
                                            <span className="text-danger">
                                                {item.sold_out === 1 ? 'Booking Closed' : item.booking_not_open === 1 && 'Booking Not Started Yet'}
                                            </span>
                                        </p>
                                        <p className="mb-1 d-flex gap-2 text-black">Price:
                                            <CommonPricingComp
                                                currency={item?.currency}
                                                price={item?.price}
                                                isSale={item?.sale}
                                                salePrice={item?.sale_price} />
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-0">
                                <CustomCounter
                                    selectedTickets={selectedTickets}
                                    resetCounterTrigger={resetCounterTrigger}
                                    getTicketCount={getTicketCount}
                                    category={item.name}
                                    price={item?.sale === 1 ? item?.sale_price : item?.price}
                                    limit={item?.booking_per_customer}
                                    ticketID={item.id}
                                />
                            </td>
                            {!isMobile &&
                                <td className="ps-0">
                                    <div className="d-flex gap-3">
                                        <p className="text-decoration-line-through mb-0">
                                        </p>
                                        <Link href="#" className="text-decoration-none h5">
                                            {item.currency !== 'undefined' ? getCurrencySymbol(item.currency) : '₹'}{
                                                (selectedTickets?.quantity > 0 && selectedTickets?.id === item.id) ?
                                                (item?.sale === 1 ? item?.sale_price : item?.price) * selectedTickets?.quantity : 0
                                            }
                                        </Link>
                                    </div>
                                </td>
                            }
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    )
}

export default CheckOutTickets