import { api, publicApi } from "@/lib/axiosInterceptor";

/**
 * @description Asynchronously fetches the active menu data from the API.
 * This function uses the configured `api` instance, so it will benefit from your interceptors.
 *
 * @returns {Promise} A promise that resolves to the array of menu items.
 * @throws Will throw an error if the API call fails, allowing the caller to handle it.
 */
export const getActiveMenu = async () => {
  try {
    const { data } = await api.get('/active-menu');
    // Safely access and return the nested navigation_menu property
    return data?.menu?.navigation_menu || [];
  } catch (error) {
    console.error("Failed to fetch active menu:", error);
    // Re-throw the error so the component that calls this function can handle it
    throw error;
  }
};

//// home page banners

/**
 * Fetches and processes banner data from the API.
 * The API returns a complex object which is parsed here into separate
 * arrays for mobile and PC banners.
 * @returns {Promise} A promise that resolves to the structured banner data.
 */
export const getBanners = async () => {
  try {
    const response = await publicApi.get('/banners');
    const rawBanners = response.data.banners;

    const mobileBanners = [];
    const pcBanners = [];

    rawBanners.forEach((banner) => {
      const keys = Object.keys(banner);
      const bannerIndex = keys[0].split("_")[1];

      if (bannerIndex) {
        const mobileObj = {
          url: banner[`banners_${bannerIndex}_mobileUrl`],
          type: banner[`banners_${bannerIndex}_type`]?.split("/")[0] || "image",
          redirectUrl: banner[`banners_${bannerIndex}_redirectUrl`],
        };

        const pcObj = {
          url: banner[`banners_${bannerIndex}_pcUrl`],
          type: banner[`banners_${bannerIndex}_type`]?.split("/")[0] || "image",
          redirectUrl: banner[`banners_${bannerIndex}_redirectUrl`],
        };

        mobileBanners.push(mobileObj);
        pcBanners.push(pcObj);
      }
    });

    return { mobile: mobileBanners, pc: pcBanners };
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    throw new Error("Could not fetch banners.");
  }
};

/**
 * Fetches the list of feature events from the API.
 * This is an authenticated request and will use the 'api' instance.
 * @returns {Promise} A promise that resolves to an array of feature events.
 */
export const getFeatureEvents = async () => {
  try {
    const response = await api.get('/feature-event');
    if (response.data.status) {
      return response.data.events;
    }
    // If the API returns a status of false, throw an error
    throw new Error('API returned unsuccessful status for feature events.');
  } catch (error) {
    console.error("Failed to fetch feature events:", error);
    // Re-throw the error to be caught by React Query
    throw error;
  }
};
export const expiredEvents = async () => {
  try {
    const response = await api.get('/expired-events');
    if (response.data.status) {
      return response.data.events;
    }
    // If the API returns a status of false, throw an error
    throw new Error('API returned unsuccessful status for expired events.');
  } catch (error) {
    console.error("Failed to fetch expired events:", error);
    // Re-throw the error to be caught by React Query
    throw error;
  }
};

/**
 * Fetches the list of successful events from the API.
 * @returns A promise that resolves to an array of SuccessfulEvent objects.
 * @throws An error if the API call fails or if the API returns a status of false.
 */
export const getSuccessfulEvents = async () => {
  try {
    const response = await api.get('/successfulEvent');

    // Check if the response data and status are valid
    if (response.data && response.data.status) {
      return response.data.eventData;
    }

    // If the API returns a status of false or the data is malformed, throw an error
    throw new Error('API returned an unsuccessful status for successful events.');

  } catch (error) {
    console.error("Failed to fetch successful events:", error);
    // Re-throw the error so it can be caught by React Query and handled in the UI
    throw error;
  }
};

// footer types and api call

/**
 * Fetches all data required for the footer from the '/footer-group' endpoint.
 * This includes configuration, link groups, and social media links.
 * @returns {Promise} A promise that resolves to a combined object of all footer data.
 * @throws An error if the API call fails or if the API returns a status of false.
 */
export const getFooterData = async () => {
  try {
    const response = await api.get('/footer-group');

    // If the API response has a truthy status, return the structured data
    if (response.data && response.data.status) {
      return {
        config: response.data.FooterData,
        groups: response.data.GroupData,
        socialLinks: response.data.SocialLinks,
      };
    }

    // If the API returns a status of false, it's considered an error
    throw new Error('API returned an unsuccessful status for footer data.');

  } catch (error) {
    console.error("Failed to fetch footer data:", error);
    // Re-throw the error so TanStack Query can handle the error state
    throw error;
  }
};
