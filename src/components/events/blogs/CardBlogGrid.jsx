import React, { memo, useMemo } from 'react'
import Link from "next/link";
import Image from 'next/image';
import { useMyContext } from '@/Context/MyContextProvider';

const CardBlogGrid = memo((props) => {
    const { id, title, description, thumbnail, date, username } = props;
    const { createSlug } = useMyContext()

    const formattedDate = useMemo(() => {
        if (!date) return "";
        try {
            // Check if date is in DD/MM/YYYY format and convert for Date constructor
            let dateToParse = date;
            if (typeof date === 'string' && date.includes('/')) {
                const [day, month, year] = date.split('/');
                dateToParse = `${year}-${month}-${day}`;
            }

            const d = new Date(dateToParse);
            if (!isNaN(d.getTime())) {
                const options = { month: 'long', day: 'numeric', year: 'numeric' };
                return d.toLocaleDateString('en-US', options).toUpperCase();
            }
        } catch (e) {
            console.error("Date parsing error", e);
        }
        return date?.toUpperCase() || "";
    }, [date]);

    return (
        <div className="iq-blog-box border-0 mb-4 h-100">
            <div className="iq-blog-image clearfix mb-3 overflow-hidden rounded-4 shadow-sm" style={{ aspectRatio: '16/10' }}>
                <Link href={`/blogs/${createSlug(title)}?key=${id}`}>
                    <Image
                        src={thumbnail || "/assets/images/no-banner.jpg"}
                        alt={title}
                        width={400}
                        height={250}
                        className='img-fluid w-100 h-100'
                        style={{
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    />
                </Link>
            </div>
            <div className="iq-blog-detail">
                <div className="iq-blog-meta d-flex align-items-center gap-3 mb-2 text-uppercase" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.8px' }}>
                    <div className="author-meta d-flex align-items-center">
                        <i className="fa fa-user-o me-2" aria-hidden="true" style={{ color: '#b51515' }}></i>
                        <span className="text-white-50">{username || 'JENNY'}</span>
                    </div>
                    <div className="date-meta d-flex align-items-center">
                        <i className="fa fa-calendar-o me-2" aria-hidden="true" style={{ color: '#b51515' }}></i>
                        <span className="text-white-50">{formattedDate}</span>
                    </div>
                </div>
                <div className="blog-title mb-2">
                    <Link href={`/blogs/${createSlug(title)}?key=${id}`} className="text-decoration-none">
                        <h5 className="blog-heading text-primary fw-bold mb-0" style={{ fontSize: '14px', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                            {title}
                        </h5>
                    </Link>
                </div>
                <p className='line-count-2 mb-3' style={{ color: '#ADB5BD', fontSize: '12px' }}>
                    {description || "An anthology series filled with captivating stories that keep us guessing till the end. An anthology series featuring diverse perspectives and haunting mysteries."}
                </p>
                <div className="iq-button link-button">
                    <Link href={`/blogs/${createSlug(title)}?key=${id}`} className="text-decoration-none">
                        <span className='read-more-link d-inline-flex align-items-center' style={{
                            color: '#b51515',
                            fontWeight: '700',
                            borderBottom: '2px solid #b51515',
                            paddingBottom: '2px',
                            fontSize: '12px',
                            transition: 'all 0.3s ease'
                        }}>
                            Read More
                            <i className="fa fa-angle-right ms-2" aria-hidden="true"></i>
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
})

CardBlogGrid.displayName = "CardBlogGrid"
export default CardBlogGrid;