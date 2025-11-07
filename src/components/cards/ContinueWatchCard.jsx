import { FC, Fragment, memo } from "react";
import Link from "next/link";


const ContinueWatchCard = memo(
  ({ link, imagePath, dataLeftTime, progressValue, title }) => {
    const trimmedTitle =
      title && title.length > 15 ? title.substring(0, 25) + "..." : title;

    return (
      <Fragment>
        <div className="iq-watching-block">
          <div className="block-images position-relative">
            <div className="iq-image-box overly-images">
              <Link className="d-block" href={link || ""} passHref>
                <img
                  src={imagePath}
                  alt={title || "movie-card"}
                  className="img-fluid object-cover w-100 d-block border-0 rounded-3"
                />
              </Link>
            </div>

            {title && (
              <div className="mt-2 text-center">
                <h6 className="text-white mb-0 text-truncate">
                  {trimmedTitle}
                </h6>
              </div>
            )}

            <div className="iq-preogress">
              <span className="data-left-timing font-size-14 fw-500 text-lowercase">
                {dataLeftTime}
              </span>
              {/* <ProgressBar now={progressValue} style={{ height: "1px" }} /> */}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
);

ContinueWatchCard.displayName = "ContinueWatchCard";
export default ContinueWatchCard;
