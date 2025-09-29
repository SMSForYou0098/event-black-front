import React from "react";

// components
import SectionSlider from "./SectionSlider";
import GenersCard from "./GanresCard";

// static data
import { geners } from "../../StaticData/data";

const OrganisationEvents = () => {
  return (
    <SectionSlider
      className="movie-geners-block"
      title="Organisation Events"
      list={geners}
      slidesPerView={6}
      link="/genres/all-genre"
    >
      {(data) => (
        <GenersCard
          slug={data.slug}
          title={data.title}
          image={data.thumbnail}
          type={data.type}
        />
      )}
    </SectionSlider>
  );
};

export default OrganisationEvents;
