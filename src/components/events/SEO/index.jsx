import { SEOHead, generateCategorySEO, generateEventSEO, generatePageSEO,generateArticleSEO } from '../../../utils/seo/seo';

// Event SEO Component - Drop-in replacement
export const EventSEO = ({ eventData, event_key }) => {
  const seoData = generateEventSEO(eventData, event_key);
  return <SEOHead {...seoData} />;
};

// Page SEO Component
export const PageSEO = ({ title, description, keywords, image, url }) => {
  const seoData = generatePageSEO({ title, description, keywords, image, url });
  return <SEOHead {...seoData} />;
};

// Blog SEO Component  
export const BlogSEO = ({ articleData, slug }) => {
  const seoData = generateArticleSEO(articleData, slug);
  return <SEOHead {...seoData} />;
};

// Category Seo Component
export const CategorySEO = ({ categoryData, categorySlug }) => {
  const seoData = generateCategorySEO(categoryData, categorySlug);
  return <SEOHead {...seoData} />;
};