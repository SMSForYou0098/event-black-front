// pages/[city]/[organisation]/[events]/[event id]/index.jsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const EventbyOrgs = () => {
  const router = useRouter();

  useEffect(() => {


    // If your folder names are [city], [organisation], [events], [eventId] (use exact bracket names),
    // they will appear as keys in router.query. For example:
    const { city, organisation, events, event_id /* try both */ } = router.query;

    // Generic log of important pieces:
    console.log({ city, organisation, events, event_id });

    // If there are search params in the URL (?foo=bar), extract them:
    const qs = router.asPath.split("?")[1];
    if (qs) {
      const search = Object.fromEntries(new URLSearchParams(qs).entries());
    }
  }, [router.query, router.asPath]);

  return <div>Check devtools console for params (pages router)</div>;
};

export default EventbyOrgs;
