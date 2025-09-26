// utils/seo.js
import Head from 'next/head';

// SEO Meta Tags Component
export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = "website",
  customTags = {},
  structuredData = null,
  noIndex = false 
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Get Yout Ticket";
  
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image?.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={fullImage} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={fullImage} />}
      
      {/* Custom Tags */}
      {Object.entries(customTags).map(([key, value]) => (
        <meta key={key} name={key} content={value} />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

// Event-specific SEO utility
export const generateEventSEO = (eventData, event_key) => {
  const {
    meta_title,
    meta_description,
    meta_keyword,
    meta_tag,
    name,
    description,
    image,
    date_range,
    venue,
    price_range,
    category
  } = eventData || {};

  const [startDate, endDate] = date_range?.split(",") || [];

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": description || meta_description,
    "image": image,
    "startDate": startDate,
    "endDate": endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": venue?.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": venue?.address,
        "addressLocality": venue?.city,
        "addressCountry": "IN"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": price_range?.min,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event_key}`
    },
    "performer": {
      "@type": "Organization", 
      "name": "Event Organizer"
    }
  };

  const customTags = {};
  if (meta_tag) customTags["custom-tag"] = meta_tag;
  if (category) customTags["event-category"] = category;

  return {
    title: meta_title || `${name} - Book Tickets Online`,
    description: meta_description || description || `Book tickets for ${name}. Don't miss out!`,
    keywords: meta_keyword || `${name}, event tickets, ${category}, book online`,
    image: image,
    url: `/events/${event_key}`,
    customTags,
    structuredData
  };
};

// Blog/Article SEO utility
export const generateArticleSEO = (articleData, slug) => {
  const {
    title,
    description,
    featured_image,
    author,
    published_date,
    category,
    tags
  } = articleData || {};

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": featured_image,
    "author": {
      "@type": "Person",
      "name": author?.name
    },
    "publisher": {
      "@type": "Organization",
      "name": process.env.NEXT_PUBLIC_SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      }
    },
    "datePublished": published_date,
    "dateModified": published_date
  };

  return {
    title: `${title} | Blog`,
    description: description,
    keywords: tags?.join(", "),
    image: featured_image,
    url: `/blog/${slug}`,
    type: "article",
    structuredData
  };
};

// Product/Service SEO utility
export const generateProductSEO = (productData, slug) => {
  const {
    name,
    description,
    image,
    price,
    currency = "INR",
    availability = "InStock",
    brand,
    category
  } = productData || {};

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "category": category,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability}`
    }
  };

  return {
    title: `${name} - Best Price Online`,
    description: `${description} Order now with best price and fast delivery.`,
    keywords: `${name}, ${category}, buy online, best price`,
    image: image,
    url: `/products/${slug}`,
    type: "product",
    structuredData
  };
};

// Generic page SEO utility
export const generatePageSEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = "website" 
}) => {
  return {
    title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description,
    keywords,
    image: image || "/default-og-image.jpg",
    url,
    type
  };
};

// SEO Hook for easy usage
export const useSEO = (seoData) => {
  return <SEOHead {...seoData} />;
};

// Breadcrumb structured data utility
export const generateBreadcrumbSchema = (breadcrumbs) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${siteUrl}${crumb.url}`
    }))
  };
};

// FAQ structured data utility
export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Organization schema utility
export const generateOrganizationSchema = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      "https://facebook.com/yourpage",
      "https://twitter.com/yourhandle",
      "https://instagram.com/yourprofile"
    ]
  };
};

export default {
  SEOHead,
  generateEventSEO,
  generateArticleSEO,
  generateProductSEO,
  generatePageSEO,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  useSEO
};


// category seo

// Category-specific SEO utility
export const generateCategorySEO = (categoryData, categorySlug) => {
  const {
    category,
    seo: {
      meta_title,
      meta_description,
      meta_keyword,
      meta_tag
    } = {},
    events = []
  } = categoryData || {};

  // Generate structured data for event category listing
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category} Events`,
    "description": meta_description,
    "numberOfItems": events.length,
    "itemListElement": events.map((event, index) => ({
      "@type": "Event",
      "position": index + 1,
      "name": event.name,
      "image": event.thumbnail,
      "startDate": event.date_range?.split(',')[0],
      "endDate": event.date_range?.split(',')[1],
      "location": {
        "@type": "Place",
        "name": event.city,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": event.city,
          "addressCountry": "IN"
        }
      },
      "organizer": {
        "@type": "Organization",
        "name": event.organisation
      },
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.event_key}`
    }))
  };

  const customTags = {};
  if (meta_tag) customTags["category-tag"] = meta_tag;
  if (category) customTags["event-category"] = category;

  return {
    title: meta_title || `${category} Events - Book Tickets Online`,
    description: meta_description || `Discover and book tickets for ${category} events. Find the best ${category.toLowerCase()} events near you.`,
    keywords: meta_keyword || `${category}, events, tickets, book online, ${category.toLowerCase()} events`,
    image: events[0]?.thumbnail || "/default-category-image.jpg",
    url: `/events/category/${categorySlug}`,
    type: "website",
    customTags,
    structuredData
  };
};
