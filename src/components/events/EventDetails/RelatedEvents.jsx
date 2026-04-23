import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/axiosInterceptor';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';
import SectionSlider from '@/components/slider/SectionSlider';
import ProductCard from '@/components/cards/ProductCard';

const fetchOrgDetailsBySlug = async ({ queryKey }) => {
    const [, { slug, city }] = queryKey;
    if (!slug) return null;

    try {
        const resp = await publicApi.get(`/landing-orgs/show-details/${slug}`, {
            params: { city },
        });

        const { status, data, message } = resp?.data ?? {};
        if (typeof status !== "undefined" && !status) {
            throw new Error(message || "No details found for this organization.");
        }
        return Array.isArray(data) ? data : (data?.events || []);
    } catch (err) {
        const backendMessage = err?.response?.data?.message;
        if (backendMessage) {
            throw new Error(backendMessage);
        }
        throw err;
    }
};

const RelatedEvents = ({ eventData }) => {
    const router = useRouter();
    const { createSlug } = useMyContext();
    const { organization, city } = router.query;
    const currentEventId = eventData?.id;

    const { data: orgData, isLoading } = useQuery({
        queryKey: ["landing-orgs-show-details", { slug: organization, city }],
        queryFn: fetchOrgDetailsBySlug,
        enabled: Boolean(organization),
        staleTime: 5 * 60 * 1000,
    });

    if (!organization) return null;

    // filter out the current event
    const relatedEvents = (orgData || []).filter(e => e.id !== currentEventId);

    if (!isLoading && relatedEvents.length === 0) return null;

    return (
        <div className="mt-5 related-events-slider">
            <SectionSlider
                title={<span className='fw-bold'>More Events From This Organizer</span>}
                list={relatedEvents}
                slidesPerView={6}
                autoplay={true}
                spaceBetween={15}
            >
                {(data, index) => (
                    <ProductCard
                        key={data.id}
                        thumbnail={data.thumbnail || data?.eventMedia?.thumbnail}
                        product_name={data.name}
                        lowest_ticket_price={data.lowest_ticket_price}
                        lowest_sale_price={data.lowest_sale_price}
                        message={data.message}
                        on_sale={data.on_sale}
                        city={data.city || data?.venue?.city}
                        link={`/events/${createSlug(data.city || data?.venue?.city)}/${createSlug(
                            data.organisation || data?.organizer?.organisation || organization
                        )}/${createSlug(data.name)}/${data.event_key}`}
                        houseFull={data?.sold_out === true || data?.eventControls?.is_sold_out === true}
                    />
                )}
            </SectionSlider>
            <style jsx>{`
                .related-events-slider :global(.container-fluid) {
                    padding-left: 5px !important;
                    padding-right: 5px !important;
                }
                .related-events-slider :global(.swiper-slide) {
                    padding: 5px;
                }
            `}</style>
        </div>
    );
};

export default RelatedEvents;
