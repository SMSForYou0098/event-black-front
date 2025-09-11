import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { selectCheckoutDataByKey, updateAttendees } from "@/store/customSlices/checkoutDataSlice";
import { useMyContext } from "@/Context/MyContextProvider";
import { Button, Spinner } from "react-bootstrap";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import DynamicAttendeeForm from "../../../../components/events/Attendees/DynamicAttendeeForm";
import { useDispatch } from "react-redux";

const AttendeePage = () => {
  const router = useRouter();
  const { categoryId, k, event_key } = router.query ?? {};
  const [categoryData, setCategoryData] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [attendeeList, setAttendeesList] = useState([]);
  const dispatch = useDispatch();
  const data = useSelector((state) => (k ? selectCheckoutDataByKey(state, k) : null));
  const { fetchCategoryData } = useMyContext();

  // --- NEW: initialize local attendeeList from redux `data` (if present).
  // This is defensive: supports both `data.attendees` (new slice shape)
  // and `data.data.attendees` (older shape). Only sets when local list is empty.
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

  return (
    <div className="mt-5 pt-5">
      <CartSteps id={2} showAttendee={true} />
      {loadingCategory ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span className="text-muted">Loading attendee fields…</span>
        </div>
      ) : null}

      <DynamicAttendeeForm
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

      <div className="mt-4 d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={() => router.back()} aria-label="Go back">
          Back
        </Button>

        <Button variant="primary" onClick={handleSaveAttendees} disabled={hasMissingFields || attendeeList.length !== quantity}>
          Save Attendees
        </Button>
      </div>

      {hasMissingFields && (
        <div className="mt-2 text-danger">
          Please fill all required fields for each attendee before saving.
        </div>
      )}
    </div>
  );
};

export default AttendeePage;
