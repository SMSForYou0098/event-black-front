import React from 'react'
import { useMyContext } from "@/Context/MyContextProvider";
export const useIsMobile = () => {
    const { isMobile } = useMyContext();
    return isMobile;
};

// Example: export other constants
// export const SOME_CONST = "someValue";
// export const ANOTHER_CONST = 42;
