import React from 'react';

/**
 * ResponsiveRenderer - A utility component for conditional rendering based on Bootstrap breakpoints
 */

const ResponsiveRenderer = ({ 
  children, 
  show, 
  hide, 
  showOnly, 
  hideOnly, 
  customClass = '' 
}) => {
  const getBootstrapClasses = () => {
    const classes = [];

    // Handle 'show' prop - show from this breakpoint and up
    if (show) {
      if (show === 'xs') {
        classes.push('d-block'); // Always visible
      } else {
        classes.push('d-none');
        classes.push(`d-${show}-block`);
      }
    }

    // Handle 'hide' prop - hide from this breakpoint and up
    if (hide) {
      classes.push('d-block'); // Show by default
      classes.push(`d-${hide}-none`); // Hide from specified breakpoint
    }

    // Handle 'showOnly' prop - show only on specific breakpoint
    if (showOnly) {
      classes.push('d-none'); // Hide by default
      
      if (showOnly === 'xs') {
        // For mobile only: show on xs, hide from sm and up
        classes.push('d-block d-sm-none');
      } else if (showOnly === 'sm') {
        // For tablet only: hide on xs, show on sm, hide from md up
        classes.push('d-none d-sm-block d-md-none');
      } else {
        classes.push(`d-${showOnly}-block`);
        const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const showOnlyIndex = breakpoints.indexOf(showOnly);
        const nextBreakpoint = breakpoints[showOnlyIndex + 1];
        if (nextBreakpoint) {
          classes.push(`d-${nextBreakpoint}-none`);
        }
      }
    }

    // Handle 'hideOnly' prop - hide only on specific breakpoint
    if (hideOnly) {
      classes.push('d-block'); // Show by default
      classes.push(`d-${hideOnly}-none`); // Hide on specific breakpoint
      
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      const hideOnlyIndex = breakpoints.indexOf(hideOnly);
      const nextBreakpoint = breakpoints[hideOnlyIndex + 1];
      
      if (nextBreakpoint) {
        classes.push(`d-${nextBreakpoint}-block`); // Show again after the hidden breakpoint
      }
    }

    return classes.join(' ');
  };

  const finalClasses = `${getBootstrapClasses()} ${customClass}`.trim();

  return <div className={finalClasses}>{children}</div>;
};

// Export individual components for common use cases
export const MobileOnly = ({ children, customClass = '' }) => (
  <div className={`d-block d-sm-none ${customClass}`.trim()}>
    {children}
  </div>
);

export const TabletOnly = ({ children, customClass = '' }) => (
  <div className={`d-none d-sm-block d-md-none ${customClass}`.trim()}>
    {children}
  </div>
);

export const DesktopOnly = ({ children, customClass = '' }) => (
  <div className={`d-none d-md-block ${customClass}`.trim()}>
    {children}
  </div>
);

export const MobileAndTablet = ({ children, customClass = '' }) => (
  <div className={`d-block d-md-none ${customClass}`.trim()}>
    {children}
  </div>
);

export const TabletAndDesktop = ({ children, customClass = '' }) => (
  <div className={`d-none d-sm-block ${customClass}`.trim()}>
    {children}
  </div>
);

// Advanced responsive component with multiple breakpoint support
export const AdvancedResponsive = ({ 
  children, 
  xs = 'block', 
  sm, 
  md, 
  lg, 
  xl, 
  xxl,
  customClass = ''
}) => {
  const classes = ['d-' + xs];
  
  if (sm) classes.push(`d-sm-${sm}`);
  if (md) classes.push(`d-md-${md}`);
  if (lg) classes.push(`d-lg-${lg}`);
  if (xl) classes.push(`d-xl-${xl}`);
  if (xxl) classes.push(`d-xxl-${xxl}`);
  
  return (
    <div className={`${classes.join(' ')} ${customClass}`.trim()}>
      {children}
    </div>
  );
};

export default ResponsiveRenderer;