import React, { Fragment, memo } from 'react'
//react-router-dom
import Link from "next/link";
import Image from 'next/image';
import { useMyContext } from '@/Context/MyContextProvider';
import CustomBtn from '@/utils/CustomBtn';
import { Calendar, Clock, MoveRight } from 'lucide-react';
import {CustomTooltip} from '@/utils/CustomTooltip';
const CardBlogGrid = memo((props) => {
    const { id, title, description, thumbnail, date, categories, content } = props;
    const { formatDateDDMMYYYY } = useMyContext()
    const estimatedReadTime = Math.max(1, Math.ceil(content / 1000));
    return (
        <Link href={`/blogs/${id}`} className='text-decoration-none'>
            <div className="iq-blog-box border-0">
                <div className="iq-blog-image border-0 clearfix mb-1">
                    <Image
                        src={props.thumbnail}
                        alt="blog-img"
                        width={370}
                        height={240}
                        className='img-fluid rounded-3 border-0'
                        style={{
                            objectFit: 'cover', // This ensures images maintain aspect ratio while filling the container
                            width: '100%',
                            height: '240px' // Fixed height for all images
                        }}
                    />
                    <div className="iq-blog-meta d-flex position-absolute bottom-0 start-0 z-2 mx-2">
                        {/* <ul className="list-inline mb-0">
                            <li className="border-gredient-left">
                                <Link href="/blogs/filter/date">
                                    <span>{formatDateDDMMYYYY(props.date)}</span>
                                </Link>
                            </li>
                        </ul> */}
                        {props.categories.map(cat =>
                            <ul key={cat.id} className="iq-blogtag list-inline">
                                <li className="border-gredient-left">
                                    {cat.title}
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
                <div className="iq-blog-detail px-2">
                    <div className="blog-title mb-2">
                        <Link href={`/blogs/${props.id}`}>
                            <h5 className="line-count-1 blog-heading m-0">
                                {props.title}
                            </h5>
                        </Link>
                    </div>
                    {/* <p className='line-count-2'>{props.description}this is the decription portion</p> */}
                    <div className="mb-2">
                        <div className="iq-button link-button d-flex justify-content-between">
                            <small className='d-flex align-items-center gap-2'>
                                <CustomTooltip text={`${estimatedReadTime} min read`}>
                               <Clock size={16}/> <strong className='text-white'>{estimatedReadTime} min</strong> 
                                </CustomTooltip>
                            </small>
                            <small className="d-flex align-items-center gap-2 fw-bold custom-text-secondary">
                               <Calendar size={16}/> {formatDateDDMMYYYY(props.date)}
                            </small>
                        </div>
                        <CustomBtn
                            buttonText="Read More"
                            linkUrl={`/blogs/${props.id}`}
                            size="sm"
                            icon={<MoveRight className="icon"  />}
                            className="btn-primary w-100 rounded-3 mt-2"
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
})

CardBlogGrid.displayName = "CardBlogGrid"
export default CardBlogGrid