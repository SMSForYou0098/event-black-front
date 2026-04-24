import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import ProductCard from "@/components/cards/ProductCard";
import SectionSlider from "@/components/slider/SectionSlider";
import SkeletonLoader from "@/utils/SkeletonUtils/SkeletonLoader";
import { Alert } from "react-bootstrap";

const ExhibitionPage = () => {
    const router = useRouter();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["events-stall-layout"],
        queryFn: async () => {
            const response = await api.get(`events/stall-layout`);
            return response.data;
        },
        enabled: !!router.isReady,
    });

    if (isLoading) return <SkeletonLoader />;

    if (isError) return (
        <div className="container py-5">
            <div className="alert alert-danger mb-0" role="alert">
                Unable to load exhibition events right now. {error?.message || "Please try again."}
            </div>
        </div>
    );

    const events = data?.events || [];

    return (
        <div className="">
            {events.length > 0 ? (
                <SectionSlider
                    title="Exhibition Events"
                    list={events}
                    slidesPerView={6}
                    className="recommended-block section-top-spacing streamit-block"
                >
                    {(item, index) => (
                        <ProductCard
                            key={item?.event_key || index}
                            image={item?.thumbnail}
                            title={item?.name}
                            lowest_ticket_price={item?.lowest_ticket_price}
                            lowest_sale_price={item?.lowest_sale_price}
                            on_sale={item?.on_sale}
                            city={item?.city}
                            houseFull={item?.house_full}
                            link={`/events/exhibition/booking?layout_id=${item.stall_layout_id}&event_id=${item.id}`}
                        />
                    )}
                </SectionSlider>
            ) : (
                // No events available
                <div className="  text-center py-5 px-3">
                    <Alert variant="warning">
                        <h6 className="mb-2">No exhibition events available</h6>
                        <p className="text-muted mb-0">Please check back later for upcoming events.</p>
                    </Alert>
                </div>
            )}
        </div>
    );
};

export default ExhibitionPage;
