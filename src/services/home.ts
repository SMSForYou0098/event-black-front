import { api, publicApi } from "@/lib/axiosInterceptor";

export interface Page {
  id: number;
  title: string;
  content: string;
  status: number;
  footer_menu_id: number;
  meta_title: string;
  meta_tag: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * @description Defines the structure of a single menu item based on the API response.
 * The 'path' for navigation will likely be derived from 'external_url' or the 'page.title'.
 */
export interface MenuItem {
  id: number;
  sr_no: number;
  title: string;
  page_id: number | null;
  menu_group_id: number;
  status: number;
  type: number | null;
  external_url: string | null;
  new_tab: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  page: Page | null;
  children?: MenuItem[]; // Keep for potential nested menu structures
}

/**
 * @description Represents the expected structure of the API response.
 */
export interface MenuApiResponse {
  status: boolean;
  message: string;
  menu: {
    id: number;
    title: string;
    status: number;
    navigation_menu: MenuItem[];
  };
}

/**
 * @description Asynchronously fetches the active menu data from the API.
 * This function uses the configured `api` instance, so it will benefit from your interceptors.
 *
 * @returns {Promise<MenuItem[]>} A promise that resolves to the array of menu items.
 * @throws Will throw an error if the API call fails, allowing the caller to handle it.
 */
export const getActiveMenu = async (): Promise<MenuItem[]> => {
  try {
    const { data } = await api.get<MenuApiResponse>('/active-menu');
    // Safely access and return the nested navigation_menu property
    return data?.menu?.navigation_menu || [];
  } catch (error) {
    console.error("Failed to fetch active menu:", error);
    // Re-throw the error so the component that calls this function can handle it
    throw error;
  }
};


//// home page banners

export interface RawBanner {
  [key: string]: string | null;
}

// Interface for the processed banner data
export interface Banner {
  url: string | null;
  type: string;
  redirectUrl: string | null;
}

// Interface for the structured banner data (mobile and pc)
export interface BannerData {
  mobile: Banner[];
  pc: Banner[];
}

/**
 * Fetches and processes banner data from the API.
 * The API returns a complex object which is parsed here into separate
 * arrays for mobile and PC banners.
 * @returns {Promise<BannerData>} A promise that resolves to the structured banner data.
 */
export const getBanners = async (): Promise<BannerData> => {
  try {
    const response = await publicApi.get<{ banners: RawBanner[] }>('/banners');
    const rawBanners = response.data.banners;

    const mobileBanners: Banner[] = [];
    const pcBanners: Banner[] = [];

    rawBanners.forEach((banner) => {
      const keys = Object.keys(banner);
      const bannerIndex = keys[0].split("_")[1];

      if (bannerIndex) {
        const mobileObj: Banner = {
          url: banner[`banners_${bannerIndex}_mobileUrl`],
          type: banner[`banners_${bannerIndex}_type`]?.split("/")[0] || "image",
          redirectUrl: banner[`banners_${bannerIndex}_redirectUrl`],
        };

        const pcObj: Banner = {
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


interface EventUser {
  organisation: string;
}

// Define the structure of a single Event object
export interface FeatureEvent {
  id: number;
  thumbnail: string;
  name: string;
  date_range: string;
  city: string;
  user: EventUser;
  event_key: string;
}

/**
 * Fetches the list of feature events from the API.
 * This is an authenticated request and will use the 'api' instance.
 * @returns {Promise<FeatureEvent[]>} A promise that resolves to an array of feature events.
 */
export const getFeatureEvents = async (): Promise<FeatureEvent[]> => {
  try {
    const response = await api.get<{ status: boolean; events: FeatureEvent[] }>('/feature-event');
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


/**
 * @interface SuccessfulEvent
 * @description Defines the structure of a single event object from the API.
 */
export interface SuccessfulEvent {
  id: number;
  user_id: number | null;
  thumbnail: string;
  url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * @interface SuccessfulEventResponse
 * @description Defines the structure of the entire API response payload.
 */
interface SuccessfulEventResponse {
  status: boolean;
  message: string;
  eventData: SuccessfulEvent[];
}

/**
 * Fetches the list of successful events from the API.
 * * @returns A promise that resolves to an array of SuccessfulEvent objects.
 * @throws An error if the API call fails or if the API returns a status of false.
 */
export const getSuccessfulEvents = async (): Promise<SuccessfulEvent[]> => {
  try {
    const response = await api.get<SuccessfulEventResponse>('/successfulEvent');
    
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

export interface FooterConfig {
  footer_logo: string;
  footer_address: string;
  footer_contact: string;
  site_credit: string;
  nav_logo: string | null;
  footer_whatsapp_number: string;
  footer_email: string;
}

/**
 * @interface FooterLink
 * @description Defines a single link item within a footer group's menu.
 */
export interface FooterLink {
  id: number;
  title: string;
  footer_group_id: number;
  page_id: number;
}

/**
 * @interface FooterGroup
 * @description Defines a group of links in the footer, e.g., "Help".
 */
export interface FooterGroup {
  id: number;
  title: string;
  footer_menu: FooterLink[];
}

/**
 * @interface SocialLinksObject
 * @description Defines the structure for the single social media links object.
 */
export interface SocialLinksObject {
  id: number;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  twitter: string | null;
  linkedin: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * @interface FooterApiResponse
 * @description Defines the complete structure of the API response from '/footer-group'.
 */
interface FooterApiResponse {
  status: boolean;
  message?: string;
  FooterData: FooterConfig;
  GroupData: FooterGroup[];
  SocialLinks: SocialLinksObject;
}

/**
 * @interface FooterData
 * @description A clean, combined object type that the service function will return.
 */
export interface FooterData {
  config: FooterConfig;
  groups: FooterGroup[];
  socialLinks: SocialLinksObject;
}

// --- SERVICE FUNCTION ---

/**
 * Fetches all data required for the footer from the '/footer-group' endpoint.
 * This includes configuration, link groups, and social media links.
 * @returns {Promise<FooterData>} A promise that resolves to a combined object of all footer data.
 * @throws An error if the API call fails or if the API returns a status of false.
 */
export const getFooterData = async (): Promise<FooterData> => {
  try {
    const response = await api.get<FooterApiResponse>('/footer-group');
    
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

