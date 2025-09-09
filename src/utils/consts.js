import React from 'react'
import { useMyContext } from "@/Context/MyContextProvider";
export const useIsMobile = () => {
    const { isMobile } = useMyContext();
    return isMobile;
};

export const ANIMATION_TIMINGS = {
  fast: 0.2,
  normal: 0.5,
  slow: 0.8,
  stagger: 0.1
};


export const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 }
  },
  expand: {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  },
  chevron: {
    collapsed: { rotate: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    expanded: { rotate: 180, transition: { duration: 0.3, ease: "easeInOut" } }
  },
  tableRow: {
    hidden: { opacity: 0, x: -10, transition: { duration: 0.2 } },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
    })
  }
};
// Example: export other constants
// export const SOME_CONST = "someValue";
// export const ANOTHER_CONST = 42;
