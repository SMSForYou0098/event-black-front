// utils/ssr.js
import axios from 'axios';

// Base SSR utility with common error handling
const createSSRFetcher = (config = {}) => {
  const {
    timeout = 10000,
    headers = { 'Accept': 'application/json' },
    baseURL = process.env.NEXT_PUBLIC_API_PATH,
  } = config;

  const axiosInstance = axios.create({
    baseURL,
    timeout,
    headers,
  });

  return axiosInstance;
};

// Generic SSR handler
export const withSSR = (fetchFunction) => {
  return async (context) => {
    try {
      const result = await fetchFunction(context);
      return result;
    } catch (error) {
      console.error('SSR Error:', error.message);
      
      // Handle different error types
      if (error.response?.status === 404) {
        return { notFound: true };
      }
      
      if (error.response?.status >= 500) {
        console.error('Server Error:', error.response.data);
      }
      
      // Default fallback
      return { notFound: true };
    }
  };
};

// Event detail SSR
export const getEventSSR = withSSR(async (context) => {
  const { event_key } = context.params;
  const fetcher = createSSRFetcher();
  
  const { data: eventData } = await fetcher.get(`/api/events/${event_key}`);
  
  if (!eventData) {
    return { notFound: true };
  }
  
  return {
    props: {
      eventData,
      event_key,
    },
  };
});

// Multiple events SSR (for listing pages)
export const getEventsSSR = withSSR(async (context) => {
  const { page = 1, limit = 10, category } = context.query;
  const fetcher = createSSRFetcher();
  
  const params = { page, limit };
  if (category) params.category = category;
  
  const [eventsRes, categoriesRes] = await Promise.all([
    fetcher.get('/api/events', { params }),
    fetcher.get('/api/categories')
  ]);
  
  return {
    props: {
      events: eventsRes.data || [],
      categories: categoriesRes.data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: eventsRes.data?.total || 0
      }
    },
  };
});

// Blog post SSR
export const getBlogPostSSR = withSSR(async (context) => {
  const { slug } = context.params;
  const fetcher = createSSRFetcher();
  
  const { data: post } = await fetcher.get(`/api/blog/${slug}`);
  
  if (!post) {
    return { notFound: true };
  }
  
  // Fetch related posts
  const { data: relatedPosts } = await fetcher.get(`/api/blog/related/${slug}?limit=3`);
  
  return {
    props: {
      post,
      relatedPosts: relatedPosts || [],
      slug,
    },
  };
});

// Homepage data SSR
export const getHomePageSSR = withSSR(async () => {
  const fetcher = createSSRFetcher();
  
  const [bannerRes, featuredEventsRes, categoriesRes] = await Promise.all([
    fetcher.get('/api/banners'),
    fetcher.get('/api/events/featured?limit=8'),
    fetcher.get('/api/categories')
  ]);
  
  return {
    props: {
      banners: bannerRes.data || [],
      featuredEvents: featuredEventsRes.data || [],
      categories: categoriesRes.data || [],
    },
  };
});

// User profile SSR (with authentication check)
export const getUserProfileSSR = withSSR(async (context) => {
  const { req } = context;
  const fetcher = createSSRFetcher();
  
  // Check authentication
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  
  // Set authorization header
  fetcher.defaults.headers.Authorization = `Bearer ${token}`;
  
  const { data: user } = await fetcher.get('/api/user/profile');
  const { data: bookings } = await fetcher.get('/api/user/bookings');
  
  return {
    props: {
      user,
      bookings: bookings || [],
    },
  };
});

// Generic single item SSR
export const createSingleItemSSR = (endpoint, paramKey = 'id') => {
  return withSSR(async (context) => {
    const paramValue = context.params[paramKey];
    const fetcher = createSSRFetcher();
    
    const { data } = await fetcher.get(`${endpoint}/${paramValue}`);
    
    if (!data) {
      return { notFound: true };
    }
    
    return {
      props: {
        data,
        [paramKey]: paramValue,
      },
    };
  });
};

// Generic list SSR with pagination
export const createListSSR = (endpoint, defaultLimit = 10) => {
  return withSSR(async (context) => {
    const { page = 1, limit = defaultLimit, ...filters } = context.query;
    const fetcher = createSSRFetcher();
    
    const params = { page, limit, ...filters };
    const { data } = await fetcher.get(endpoint, { params });
    
    return {
      props: {
        items: data?.items || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data?.total || 0,
          totalPages: Math.ceil((data?.total || 0) / limit)
        },
        filters
      },
    };
  });
};

// Search results SSR
export const getSearchSSR = withSSR(async (context) => {
  const { q, category, location, page = 1 } = context.query;
  
  if (!q) {
    return {
      props: {
        results: [],
        query: '',
        filters: { category, location },
        pagination: { page: 1, total: 0 }
      },
    };
  }
  
  const fetcher = createSSRFetcher();
  const params = { q, category, location, page, limit: 20 };
  
  const { data } = await fetcher.get('/api/search', { params });
  
  return {
    props: {
      results: data?.results || [],
      query: q,
      filters: { category, location },
      pagination: {
        page: parseInt(page),
        total: data?.total || 0,
        totalPages: Math.ceil((data?.total || 0) / 20)
      }
    },
  };
});

// SSR with cache headers
export const withCache = (ssrFunction, cacheTime = 300) => {
  return async (context) => {
    const result = await ssrFunction(context);
    
    if (result.props) {
      // Add cache headers
      context.res.setHeader(
        'Cache-Control',
        `public, s-maxage=${cacheTime}, stale-while-revalidate=86400`
      );
    }
    
    return result;
  };
};

// ISR (Incremental Static Regeneration) wrapper
export const withISR = (ssrFunction, revalidate = 60) => {
  return async (context) => {
    const result = await ssrFunction(context);
    
    if (result.props) {
      result.revalidate = revalidate;
    }
    
    return result;
  };
};

// Development helpers
export const withDevLogging = (ssrFunction) => {
  return async (context) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SSR Context:', {
        params: context.params,
        query: context.query,
        url: context.resolvedUrl
      });
      
      const startTime = Date.now();
      const result = await ssrFunction(context);
      const endTime = Date.now();
      
      console.log(`SSR completed in ${endTime - startTime}ms`);
      return result;
    }
    
    return ssrFunction(context);
  };
};

export default {
  withSSR,
  getEventSSR,
  getEventsSSR,
  getBlogPostSSR,
  getHomePageSSR,
  getUserProfileSSR,
  createSingleItemSSR,
  createListSSR,
  getSearchSSR,
  withCache,
  withISR,
  withDevLogging
};