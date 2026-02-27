import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import loader from "../assets/event/stock/loader111.gif";
import currencyData from "../JSON/currency.json";
import { api as commonapi } from "../lib//axiosInterceptor";
import { useMediaQuery } from "react-responsive";
// TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const queryClient = useQueryClient(); // used by GetSystemSetting
  const api = process.env.NEXT_PUBLIC_API_PATH;

  const UserData = useSelector((auth) => auth?.auth?.user);
  const UserPermissions = useSelector((auth) => auth?.auth?.user?.permissions);
  const authToken = useSelector((auth) => auth?.auth?.token);
  const isLoggedIn = UserData && Object.keys(UserData)?.length > 0;
  const userRole = UserData?.role;

  const [showHeaderBookBtn, setShowHeaderBookBtn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize currency master ONCE from local JSON (assumed to be a map like { "INR": { symbol: "₹" }, ... })
  // If your JSON is an array, convert it to a map in a useEffect below.
  const [currencyMaster, setCurrencyMaster] = useState(currencyData ?? {});
  const [systemSetting, setSystemSetting] = useState();
  const [hideMobileMenu, setHideMobileMenu] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 575 });

  // If your currency.json is an ARRAY, normalize it to a map once here.
  // (If it's already a map, this effect will be a no-op.)
  useEffect(() => {
    if (Array.isArray(currencyData)) {
      // Adjust key names to match your JSON shape
      const map = Object.fromEntries(
        currencyData.map((c) => [c.code, c]) // expects { code: "INR", symbol: "₹", ... }
      );
      setCurrencyMaster(map);
    }
  }, []);

  // --- Fetcher for system settings
  const fetchSystemSettings = async () => {
    const res = await commonapi.get(`/settings`);
    if (res?.data?.status) {
      return res.data.data;
    }
    throw new Error(res?.data?.message || "Failed to fetch settings");
  };

  // Use react-query to fetch & cache system settings
  const {
    data: systemSettingsQueryData,
    isLoading: systemSettingsLoading,
    isError: systemSettingsError,
    error: systemSettingsErrorObj,
    refetch: refetchSystemSettings,
  } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: fetchSystemSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30,
    onSuccess: (data) => {
      if (data) {
        setSystemSetting(data);
      }
      // Keep local currencyMaster in sync with local JSON by default
      setCurrencyMaster((prev) => prev || currencyData || {});
    },
    // retry: 1,
  });

  // Keep GetSystemSetting function name (unchanged API).
  const GetSystemSetting = async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["systemSettings"],
        queryFn: fetchSystemSettings,
      });

      if (data) {
        setSystemSetting(data);
        // Also ensure currency master exists
        setCurrencyMaster((prev) => prev || currencyData || {});
        return data;
      }
      return null;
    } catch (err) {
      console.log("GetSystemSetting error:", err);
      return null;
    }
  };

  // ---------------------- Utilities ----------------------
  const DownloadExcelFile = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName);
  };

  const HandleExport = async (path, fileName, id = null) => {
    let Eid = id;
    let Epath = path;
    let EfileName = fileName;
    await commonapi
      .get(`/${Epath}/${Eid ? Eid : UserData.id}`)
      .then((response) => {
        const data = response.data?.data;
        const fName = EfileName;
        DownloadExcelFile(data, fName);
      })
      .catch(() => { });
  };

  const handleMakeReport = async (number, message_id) => {
    try {
      await commonapi.post(`/make-reports`, {
        message_id: message_id,
        waId: number,
        display_phone_number: UserData?.whatsapp_number,
      });
    } catch { }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const strTime = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
    return `${day}-${month}-${year} | ${strTime}`;
  };

  const formateTemplateTime = (dateStr, time) => {
    if (!dateStr) return "";

    const [startDate, endDate] = dateStr.split(",");
    const options = { year: "numeric", month: "long", day: "numeric" };

    const start = new Date(startDate);
    const startFormatted = start
      .toLocaleDateString("en-US", options)
      .replace(/,/g, "");

    if (endDate) {
      const end = new Date(endDate);
      const endFormatted = end.toLocaleDateString("en-US", options).replace(/,/g, "");
      const startDayMonth = startFormatted.split(" ").slice(0, 2).join(" ");
      return time
        ? `${startDayMonth} to ${endFormatted} | ${time}`
        : `${startDayMonth} to ${endFormatted}`;
    } else {
      return time ? `${startFormatted} | ${time}` : startFormatted;
    }
  };

  const successAlert = useCallback((title, subtitle) => {
    Swal.fire({
      icon: "success",
      title: title,
      text: subtitle,
    });
  }, []);

  const ErrorAlert = useCallback((error) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error,
      backdrop: `rgba(60,60,60,0.8)`,
    });
  }, []);

  const AskAlert = async (title, buttonText, SuccessMessage) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: title,
      icon: "warning",
      showCancelButton: true,
      backdrop: `rgba(60,60,60,0.8)`,
      confirmButtonText: buttonText,
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed && SuccessMessage) {
      Swal.fire("Success", SuccessMessage, "success");
      return true;
    }
    return false;
  };

  const showLoading = (processName) => {
    return Swal.fire({
      title: `${processName} in Progress`,
      html: `
            <div style="text-align: center;">
                <img src=${loader} style="width: 10rem; display: block; margin: 0 auto;"/>
                </div>
                `,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        htmlContainer: "swal2-html-container-custom",
      },
    });
  };

  const extractDetails = (data) => {
    const getNestedValue = (paths, fallback) => {
      for (const path of paths) {
        const value = path.reduce((obj, key) => (obj ? obj[key] : undefined), data);
        if (value !== undefined) return value;
      }
      return fallback;
    };

    const number = getNestedValue([["number"], ["bookings", 0, "number"]], "Unknown");
    const thumbnail = getNestedValue(
      [
        ["ticket", "event", "thumbnail"],
        ["bookings", 0, "ticket", "event", "thumbnail"],
      ],
      "https://smsforyou.biz/ticketcopy.jpg"
    );
    const name = getNestedValue(
      [
        ["user", "name"],
        ["bookings", 0, "user", "name"],
      ],
      "Guest"
    );
    const qty = getNestedValue([["bookings", "length"]], 1);
    const category = getNestedValue(
      [
        ["ticket", "name"],
        ["bookings", 0, "ticket", "name"],
      ],
      "General"
    );
    const eventName = getNestedValue(
      [
        ["ticket", "event", "name"],
        ["bookings", 0, "ticket", "event", "name"],
      ],
      "Event"
    );
    const ticketName = getNestedValue(
      [
        ["ticket", "name"],
        ["bookings", 0, "ticket", "name"],
      ],
      "N/A"
    );
    const eventDate = getNestedValue(
      [
        ["ticket", "event", "date_range"],
        ["bookings", 0, "ticket", "event", "date_range"],
      ],
      "TBD"
    );
    const eventTime = getNestedValue(
      [
        ["ticket", "event", "start_time"],
        ["bookings", 0, "ticket", "event", "start_time"],
      ],
      "TBD"
    );
    const DateTime = formateTemplateTime(eventDate, eventTime);
    const address = getNestedValue(
      [
        ["ticket", "event", "address"],
        ["bookings", 0, "ticket", "event", "address"],
      ],
      "No Address Provided"
    );
    const location = address.replace(/,/g, "|");

    const smsConfig = getNestedValue(
      [
        ["ticket", "event", "user", "sms_config", 0],
        ["bookings", 0, "ticket", "event", "user", "sms_config", 0],
      ],
      null
    );
    const config_status = smsConfig?.status ?? "0";
    const organizerApiKey = smsConfig?.status === "1" ? smsConfig.api_key : null;
    const organizerSenderId = smsConfig?.status === "1" ? smsConfig.sender_id : null;

    return {
      number,
      thumbnail,
      name,
      qty,
      category,
      eventName,
      ticketName,
      DateTime,
      address,
      location,
      config_status,
      organizerApiKey,
      organizerSenderId,
    };
  };

  const formatDateDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange) return "";

    const dates = dateRange.split(",").map((date) => date.trim());

    if (dates.length === 1) {
      return formatDateDDMMYYYY(dates[0]);
    } else if (dates.length === 2) {
      const [startDate, endDate] = dates;
      // If both dates are the same, return only one date
      if (startDate === endDate) {
        return formatDateDDMMYYYY(startDate);
      }
      return `${formatDateDDMMYYYY(startDate)} to ${formatDateDDMMYYYY(endDate)}`;
    } else {
      return dateRange;
    }
  };

  const convertTo12HourFormat = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const minutesFormatted = minutes?.toString()?.padStart(2, "0");
    return `${hours12}:${minutesFormatted} ${period}`;
  };

  function truncateString(str, num) {
    if (str?.length > num) {
      return str?.slice(0, num) + "...";
    }
    return str;
  }

  const createSlug = (title) => {
    if (title) {
      return title
        .replace(/&/g, "and")
        .replace(/[\s]+/g, "-")
        .replace(/[^\w-]+/g, "")
        .toLowerCase();
    }
    return "";
  };

  const convertSlugToTitle = (slug) => {
    if (!slug) return "";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  };

  const fetchEventCategories = async () => {
    const res = await commonapi.get("/category-title");
    const raw = res?.data?.categoryData ?? {};
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    return arr.map((item) => ({ label: item.title, value: item.id }));
  };

  const fetchCategoryData = async (category) => {
    try {
      const response = await commonapi.get(`/category-data/${category}`);
      return response.data;
    } catch (err) {
      return err.message;
    } finally {
    }
  };

  // ---------- FIX: make getCurrencySymbol PURE (no setState here) ----------
  const getCurrencySymbol = useCallback(
    (code) => {
      if (!code) return "";
      const entry = currencyMaster?.[code];
      return entry?.symbol ?? "";
    },
    [currencyMaster]
  );

  const HandleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const contextValue = useMemo(
    () => ({
      HandleBack,
      api,
      authToken,
      formatDateRange,
      UserData,
      userRole,
      UserPermissions,
      handleMakeReport,
      DownloadExcelFile,
      HandleExport,
      isMobile,
      formatDateTime,
      successAlert,
      ErrorAlert,
      AskAlert,
      formateTemplateTime,
      convertTo12HourFormat,
      truncateString,
      createSlug,
      convertSlugToTitle,
      toTitleCase,
      fetchEventCategories,
      extractDetails,
      systemSetting,
      GetSystemSetting, // kept same name and behavior for external callers
      showLoading,
      getCurrencySymbol,
      fetchCategoryData,
      isScrolled,
      loader,
      isLoggedIn,
      hideMobileMenu,
      setHideMobileMenu,
      showHeaderBookBtn,
      setShowHeaderBookBtn,
      formatDateDDMMYYYY,
      // react-query flags:
      systemSettingsLoading,
      systemSettingsError,
      systemSettingsErrorObj,
      refetchSystemSettings,
    }),
    [
      HandleBack,
      api,
      authToken,
      formatDateRange,
      UserData,
      userRole,
      UserPermissions,
      handleMakeReport,
      DownloadExcelFile,
      HandleExport,
      isMobile,
      formatDateTime,
      successAlert,
      ErrorAlert,
      AskAlert,
      formateTemplateTime,
      convertTo12HourFormat,
      truncateString,
      createSlug,
      convertSlugToTitle,
      toTitleCase,
      fetchEventCategories,
      extractDetails,
      systemSetting,
      GetSystemSetting,
      showLoading,
      getCurrencySymbol,
      fetchCategoryData,
      isScrolled,
      loader,
      isLoggedIn,
      hideMobileMenu,
      showHeaderBookBtn,
      systemSettingsLoading,
      systemSettingsError,
      systemSettingsErrorObj,
      refetchSystemSettings,
    ]
  );

  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
