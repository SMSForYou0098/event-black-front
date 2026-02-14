import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { selectCheckoutDataByKey, updateAttendees } from "@/store/customSlices/checkoutDataSlice";
import { useMyContext } from "@/Context/MyContextProvider";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import DynamicAttendeeForm from "../../../../components/events/Attendees/DynamicAttendeeForm";
import { useDispatch } from "react-redux";
import { TicketDataSummary } from "../../../../components/events/CheckoutComps/checkout_utils";
import CustomBtn from "../../../../utils/CustomBtn";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import Timer from "../../../../utils/BookingUtils/Timer";
import MobileTwoButtonFooter from "../../../../utils/MobileTwoButtonFooter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";

export const useEventFields = (eventId, options = {}) =>
  useQuery({
    queryKey: ['event-fields', eventId],
    enabled: !!eventId,
    queryFn: async ({ queryKey }) => {
      const [_, id] = queryKey;
      if (!id || id === 'undefined' || id === 'null') return [];
      const res = await api.get(`event/attendee/fields/${id}`);
      if (!res?.data?.status) {
        return [];
      }
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => {
      const status = err?.response?.status;
      return status >= 500 && count < 2;
    },
    ...options,
  });

const AttendeePage = () => {
  const router = useRouter();
  const { categoryId, k, event_key } = router.query ?? {};
  const { fetchCategoryData, isMobile } = useMyContext();
  const [categoryData, setCategoryData] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [attendeeList, setAttendeesList] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [event_id, setEventId] = useState(null);

  const dispatch = useDispatch();
  const data = useSelector((state) => (k ? selectCheckoutDataByKey(state, k) : null));
  useEffect(() => {
    if (!data) return;

    // extract attendees from either shape
    const attendeesFromRedux =
      Array.isArray(data.attendees)
        ? data.attendees
        : Array.isArray(data?.data?.attendees)
          ? data.data.attendees
          : [];

    // Only set initial attendees if local list is empty to avoid overwriting edits
    setAttendeesList((prev) => (prev && prev.length > 0 ? prev : attendeesFromRedux));
    setEventId(data?.event?.id);
  }, [data]);

  // fetch category config when categoryId is available
  // Derive switch flag
  const isCategoryAttendeeRequired = data?.event?.category?.attendy_required;
  const isEventAttendeeRequired = data?.event?.attendee_required;

  // New hook for event fields (when attendee_required is false)
  const isEnabled = !isCategoryAttendeeRequired && !!isEventAttendeeRequired && !!event_id;
  const { data: eventFieldsData, isLoading: loadingEventFields } = useEventFields(event_id, {
    enabled: isEnabled
  });

  // fetch category config when categoryId is available (ONLY when attendee_required is true)
  useEffect(() => {
    let mounted = true;
    const getData = async () => {
      if (!categoryId || !isCategoryAttendeeRequired) return;
      setLoadingCategory(true);
      try {
        const CData = await fetchCategoryData(categoryId);
        if (!mounted) return;
        setCategoryData(CData?.customFieldsData ?? []);
      } catch (err) {
        console.error("Failed to fetch category data", err);
        if (mounted) setCategoryData([]);
      } finally {
        if (mounted) setLoadingCategory(false);
      }
    };

    getData();
    return () => {
      mounted = false;
    };
  }, [categoryId, fetchCategoryData, isCategoryAttendeeRequired]);

  // Determine which data to use
  const activeApiData = isCategoryAttendeeRequired ? categoryData : (isEventAttendeeRequired ? (eventFieldsData || []) : []);
  const activeLoading = isCategoryAttendeeRequired ? loadingCategory : loadingEventFields;

  // derive list of required field names (memoized)
  const requiredFieldNames = useMemo(() => {
    if (!Array.isArray(activeApiData)) return [];
    try {
      return activeApiData
        .filter((f) => f.field_required === 1)
        .map((f) => f.field_name);
    } catch {
      return [];
    }
  }, [activeApiData]);

  // memoized check whether any attendee has missing fields
  const hasMissingFields = useMemo(
    () => attendeeList.some((a) => Array.isArray(a?.missingFields) && a.missingFields.length > 0),
    [attendeeList]
  );

  // stable setter to pass down (so child components get stable ref)
  const onSetAttendeesList = useCallback((updater) => {
    setAttendeesList((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const handleSaveAttendees = useCallback(() => {
    // some basic guard
    if (!attendeeList || attendeeList.length === 0) return;
    if (hasMissingFields) {
      console.warn("Cannot save — some attendees have missing fields");
      return;
    }

    // update redux first (so next page can read it)
    dispatch(
      updateAttendees({
        key: k,
        attendees: attendeeList,
        merge: false, // set true if you want to append instead of overwrite
      })
    );

    // then navigate
    router.push(`/events/checkout/${router.query.event_key}/?k=${k}`);

    // TODO: call API to persist attendees if you want
  }, [attendeeList, hasMissingFields, dispatch, k, router]);

  // derive quantity safely from `data`
  // support both shapes: new slice may put selected info at `data` root,
  // older shape might be under `data.data`. Adjust as needed.
  const quantity = useMemo(() => {
    // prefer new shape: data.newQuantity or data.selectedQuantity
    if (!data) return 0;
    const q =
      data.newQuantity ??
      data.selectedQuantity ??
      data?.data?.quantity ??
      data?.data?.selectedQuantity ??
      0;
    return q;
  }, [data]);
  return (
    <div className="">
      <Container>
        <CartSteps id={2} showAttendee={true} />
        <Timer timestamp={data?.timestamp} navigateOnExpire={() => router.push(`/events/cart/${event_key}`)} />
        <Row className="m-0 p-0">
          <Col lg="8" className="px-0 px-sm-2">
            <DynamicAttendeeForm
              loadingCategory={activeLoading}
              requiredFields={requiredFieldNames}
              setAttendeesList={onSetAttendeesList}
              attendeeList={attendeeList}
              apiData={activeApiData}
              categoryId={categoryId}
              data={data}
              selectedTickets={data?.data}
              quantity={quantity}
              event_key={event_key}
              selectedAttendees={selectedAttendees}
              setSelectedAttendees={setSelectedAttendees}
              event_id={event_id}
            />
            {hasMissingFields && (
              <div className="mb-3 text-white fw-bold">
                <span className="text-primary">*</span> Please fill all required fields for each attendee before saving.
              </div>
            )}
          </Col>
          <Col lg="4">
            <TicketDataSummary
              eventName={data?.event?.name}
              ticketName={data?.data?.category}
              price={data?.data?.price}
              quantity={quantity}
              hidePrices={true}
            />
            {isMobile ? (
              <MobileTwoButtonFooter
                leftButton={
                  <CustomBtn
                    className="custom-dark-content-bg border-0 w-100"
                    HandleClick={() => window.history.back()}
                    buttonText="Back"
                    icon={<i className="fa-solid fa-arrow-left"></i>}
                  />
                }
                rightButton={
                  <CustomBtn
                    className="border-0 w-100"
                    disabled={hasMissingFields || (attendeeList?.length !== quantity)}
                    HandleClick={handleSaveAttendees}
                    buttonText="Continue"
                    icon={<i className="fa-solid fa-arrow-right"></i>}
                  />
                }
              />
            ) : (
              <div className="d-flex align-items-center justify-content-between gap-3 mb-sm-5 mt-3 mb-0">
                <CustomBtn
                  size='sm'
                  className="custom-dark-content-bg border-secondary"
                  HandleClick={() => window.history.back()}
                  buttonText={"Back"}
                  icon={<i className="fa-solid fa-arrow-left"></i>}
                />
                <CustomBtn
                  size='sm'
                  disabled={hasMissingFields || (attendeeList?.length !== quantity)}
                  HandleClick={handleSaveAttendees}
                  buttonText={"Save & Continue"}
                />
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AttendeePage;
