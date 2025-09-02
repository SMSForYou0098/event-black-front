import { memo } from "react";

// hero slider
import OttHeroSlider from "@/components/slider/OttHeroSlider";

// sections
import ContinueWatching from "@/components/sections/ContinueWatching";
import TopTenMoviesToWatch from "@/components/sections/TopTenMoviesToWatch";
import VerticalSectionSlider from "@/components/slider/VerticalSectionSlider";
import OnlyOnStreamit from "@/components/sections/OnlyOnStreamit";
import YourFavouritePersonality from "@/components/sections/YourFavouritePersonality";
import PopularMovies from "@/components/sections/PopularMovies";
import TabSlider from "@/components/sections/TabSlider";
import RecommendedForYou from "@/components/sections/RecommendedForYou";
import TopPicsForYou from "@/components/sections/TopPicsForYou";
import GenreSlider from "@/components/sections/GenreSlider";

import { ottVerticleLatestMovies } from "@/StaticData/data";
import TvShowHeroSlider from "@/components/slider/TvShowHeroSlider";
import TVPopularShows from "@/components/sections/TVPopularShows";
import BestOfInternationalShows from "@/components/sections/BestOfInternationalShows";
import ShowsWeRecommend from "@/components/sections/ShowsWeRecommend";
import { useEnterExit } from "@/utilities/usePage";
import FooterSlider from "@/components/sections/FooterSlider";

const OTT = memo(() => {
  useEnterExit()

  return (
    <>
      {/* <OttHeroSlider />
      <ContinueWatching />
      <TopTenMoviesToWatch />
      <OnlyOnStreamit />
      <VerticalSectionSlider sliderData={ottVerticleLatestMovies} />
      <YourFavouritePersonality />
      <PopularMovies />
      <TabSlider />
      <GenreSlider />
      <RecommendedForYou />
      <TopPicsForYou /> */}
      <TvShowHeroSlider />
      <TVPopularShows />
      <BestOfInternationalShows />
      <ShowsWeRecommend />
      <FooterSlider />
    </>
  );
});

OTT.displayName = "OTT";
export default OTT;
