// components/OrganisationEvents.jsx
import React, { useState } from "react";
import SectionSlider from "./SectionSlider";
import GenersCard from "./GanresCard";
import { useMyContext } from "../../Context/MyContextProvider";
import CitySelectModal from "../CustomComponents/CitySelectModal"
const OrganisationEvents = ({ data }) => {
  const { createSlug } = useMyContext();
  const [showCityModal, setShowCityModal] = useState(false);
  const [activeOrg, setActiveOrg] = useState(null);

  const openCityModal = (orgItem) => {
    setActiveOrg(orgItem);
    setShowCityModal(true);
  };

  const closeCityModal = () => {
    setShowCityModal(false);
    setActiveOrg(null);
  };

  return (
    <>
      <SectionSlider
        className="movie-geners-block"
        title="Organisation Events"
        list={data}
        slidesPerView={6}
        link="/genres/all-genre"
      >
        {(item) => (
          <div
            onClick={() => item.cities?.length && openCityModal(item)}
            style={{ cursor: item.cities?.length ? "pointer" : "default" }}
          >
            <GenersCard
              slug={item.slug}
              title={item.organisation}
              image={item.thumbnail}
              type={item.type}
            />
          </div>
        )}
      </SectionSlider>

      <CitySelectModal
        show={showCityModal}
        onHide={closeCityModal}
        org={activeOrg || { organisation: "", cities: [] }}
        createSlug={createSlug}
      />
    </>
  );
};

export default OrganisationEvents;
