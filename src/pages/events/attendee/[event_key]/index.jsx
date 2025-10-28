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

const AttendeePage = () => {
  const router = useRouter();
  const { categoryId, k, event_key } = router.query ?? {};
  const { fetchCategoryData, isMobile } = useMyContext();
  const [categoryData, setCategoryData] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [attendeeList, setAttendeesList] = useState([]);
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
  }, [data]);

  // fetch category config when categoryId is available
  useEffect(() => {
    let mounted = true;
    const getData = async () => {
      if (!categoryId) return;
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
  }, [categoryId, fetchCategoryData]);

  // derive list of required field names (memoized)
  const requiredFieldNames = useMemo(() => {
    if (!Array.isArray(categoryData)) return [];
    try {
      return categoryData
        .filter((f) => f.field_required === 1)
        .map((f) => f.field_name);
    } catch {
      return [];
    }
  }, [categoryData]);

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
      data?.data?.newQuantity ??
      data?.data?.selectedQuantity ??
      0;
    return q;
  }, [data]);
//  console.log(k)
  return (
    <div className="mt-5 pt-5">
      <Container>
        <CartSteps id={2} showAttendee={true} />
         <Timer timestamp={data?.timestamp}/>
        <Row className="m-0 p-0">
          <Col lg="8" className="px-0 px-sm-2">
            <DynamicAttendeeForm
              loadingCategory={loadingCategory}
              requiredFields={requiredFieldNames}
              setAttendeesList={onSetAttendeesList}
              attendeeList={attendeeList}
              apiData={categoryData}
              categoryId={categoryId}
              data={data}
              selectedTickets={data?.data}
              quantity={quantity}
              event_key={event_key}
            />
            {hasMissingFields && (
              <div className="mt-2 text-danger">
                Please fill all required fields for each attendee before saving.
              </div>
            )}
          </Col>
          <Col lg="4">
            <TicketDataSummary
              eventName={data?.event.name}
              ticketName={data?.ticket.name}
              price={data?.ticket.price}
              quantity={quantity}
              hidePrices={true}
            />
            {isMobile ? (
              <BookingMobileFooter
                HandleClick={handleSaveAttendees}
                selectedTickets={data?.data}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-between gap-3 mb-sm-5 mb-0">
                <CustomBtn
                  className="custom-dark-content-bg border-secondary"
                  HandleClick={() => window.history.back()}
                  buttonText={"Back to Tickets"}
                  icon={<i className="fa-solid fa-arrow-left"></i>}
                />
                <CustomBtn
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
