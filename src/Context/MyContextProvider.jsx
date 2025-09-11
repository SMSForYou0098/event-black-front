import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import loader from "../assets/event/stock/loader111.gif";
import currencyData from "../JSON/currency.json";

// Create a context
const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [showHeaderBookBtn, setShowHeaderBookBtn] = useState(false);
  const [smsConfig, setSmsConfig] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currencyMaster, setCurrencyMaster] = useState([]);
  const [UserList, setUserList] = useState([]);
  const [amount, setAmount] = useState(0);
  const [SystemVars, setSystemVars] = useState([]);
  const [systemSetting, setSystemSetting] = useState();
  const [isMobile, setIsMobile] = useState(false);
  const [hideMobileMenu, setHideMobileMenu] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_PATH;
  const UserData = useSelector((auth) => auth?.auth?.user);
  const UserPermissions = useSelector((auth) => auth?.auth?.user?.permissions);
  const authToken = useSelector((auth) => auth?.auth?.token);
  const isLoggedIn = UserData && Object.keys(UserData)?.length > 0;
  const userRole = UserData?.role;
  // template list
  const GetEventSmsConfig = async (id) => {
    try {
      const res = await axios.get(`${api}sms-api/${id}`, {
        headers: {
          Authorization: "Bearer " + authToken,
        },
      });
      if (res.data.status) {
        const configData = res.data;
        setSmsConfig(configData?.config);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const GetUsersList = async () => {
    try {
      const response = await axios.get(`${api}users/list`, {
        headers: {
          Authorization: "Bearer " + authToken,
        },
      });
      if (response.data.status) {
        let data = response.data.users;
        setUserList(data);
        return data;
      } else {
        console.log("Unexpected API status:", response.data.status);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const GetSystemSetting = async () => {
    try {
      const res = await axios.get(`${api}settings`, {
        headers: {
          Authorization: "Bearer " + authToken,
        },
      });
      if (res.data.status) {
        const settingData = res?.data?.data;
        setSystemSetting(settingData);
        return settingData;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const GetSystemVars = async () => {
    try {
      const res = await axios.get(`${api}system-variables`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setSystemVars(res.data?.systemData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (UserData && Object.keys(UserData)?.length > 0) {
        await GetUsersList();
        GetSystemVars();
      }
    };
    GetSystemSetting();
    fetchData();
    setCurrencyMaster(currencyData);
    const userAgent = navigator.userAgent;
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 425);
  }, [window.innerWidth, window.innerHeight]);

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
    await axios
      .get(`${api}${Epath}/${Eid ? Eid : UserData.id}`, {
        headers: {
          Authorization: "Bearer " + authToken,
        },
      })
      .then((response) => {
        const data = response.data?.data;
        const fName = EfileName;
        DownloadExcelFile(data, fName);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleMakeReport = async (number, message_id) => {
    try {
      await axios.post(
        `${api}make-reports`,
        {
          message_id: message_id,
          waId: number,
          display_phone_number: UserData?.whatsapp_number,
        },
        {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        }
      );
    } catch (error) { }
  };

  const formatDateTime = (dateTime) => {
    // console.log(dateTime)
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = `${String(hours).padStart(
      2,
      "0"
    )}:${minutes}:${seconds} ${ampm}`;

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
      const endFormatted = end
        .toLocaleDateString("en-US", options)
        .replace(/,/g, "");
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

  const AskAlert = (title, buttonText, SuccessMessage) => {
    Swal.fire({
      title: "Are you sure?",
      text: title,
      icon: "warning",
      showCancelButton: true,
      backdrop: `rgba(60,60,60,0.8)`,
      confirmButtonText: buttonText,
    }).then((result) => {
      if (result.isConfirmed && SuccessMessage) {
        Swal.fire(SuccessMessage);
      }
    });
  };

  const showLoading = (processName) => {
    return Swal.fire({
      title: `${processName} in Progress`,
      html: `
            <div style="text-align: center;">
                <img src=${loader} style="width: 10rem; display: block; margin: 0 auto;"/>
                </div>
                `,
      // <div class="spinner-border text-primary mt-4" role="status">
      //     <span class="visually-hidden">Loading...</span>
      // </div>
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        htmlContainer: "swal2-html-container-custom",
      },
    });
  };

  function modifyNumber(number) {
    let mob_number = String(number);
    if (mob_number.length === 10) {
      mob_number = "91" + mob_number;
      return mob_number;
    } else if (mob_number.length === 12) {
      return number;
    }
  }

  const extractDetails = (data) => {
    const getNestedValue = (paths, fallback) => {
      for (const path of paths) {
        const value = path.reduce(
          (obj, key) => (obj ? obj[key] : undefined),
          data
        );
        if (value !== undefined) return value;
      }
      return fallback;
    };

    const number = getNestedValue(
      [["number"], ["bookings", 0, "number"]],
      "Unknown"
    );
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
    const organizerApiKey =
      smsConfig?.status === "1" ? smsConfig.api_key : null;
    const organizerSenderId =
      smsConfig?.status === "1" ? smsConfig.sender_id : null;

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

  const sendTickets = (data, type, showLoader = true, template) => {
    const number =
      data?.user?.number ?? data?.bookings?.[0]?.user?.number ?? "Unknown";
    const thumbnail =
      data?.ticket?.event?.thumbnail ??
      data?.bookings?.[0]?.ticket?.event?.thumbnail ??
      "https://smsforyou.biz/ticketcopy.jpg";
    const name = data?.user?.name ?? data?.bookings?.[0]?.user?.name ?? "Guest";
    const qty = data?.bookings?.length ?? 1;
    const category =
      data?.ticket?.name ?? data?.bookings?.[0]?.ticket?.name ?? "General";
    // const seasonEvent = data?.ticket?.event?.event_type === "season"
    const eventName =
      data?.ticket?.event?.name ??
      data?.bookings?.[0]?.ticket?.event?.name ??
      "Event";
    const ticketName =
      data?.ticket?.name ?? data?.bookings?.[0]?.ticket?.name ?? "N/A";
    const eventDate =
      data?.ticket?.event?.date_range ??
      data?.bookings?.[0]?.ticket?.event?.date_range ??
      "TBD";
    let booking_date =
      data?.booking_date ?? data?.bookings?.[0]?.booking_date ?? "TBD";
    if (booking_date !== "TBD") {
      booking_date = formateTemplateTime(booking_date);
    }
    const created_at =
      data?.created_at ?? data?.bookings?.[0]?.created_at ?? "TBD";
    const eventStartTime =
      data?.ticket?.event?.start_time ??
      data?.bookings?.[0]?.ticket?.event?.start_time ??
      "TBD";
    const eventEndTime =
      data?.ticket?.event?.end_time ??
      data?.bookings?.[0]?.ticket?.event?.end_time ??
      "TBD";
    const eventTime = `${convertTo12HourFormat(
      eventStartTime
    )} - ${convertTo12HourFormat(eventEndTime)}`;
    const DateTime = formateTemplateTime(eventDate, eventTime);
    const address =
      data?.ticket?.event?.address ??
      data?.bookings?.[0]?.ticket?.event?.address ??
      "No Address Provided";
    const location = address.replace(/,/g, "|");

    const Organizer =
      data?.ticket?.event?.user ?? data?.bookings?.[0]?.ticket?.event?.user;
    const smsConfig = Organizer?.sms_config?.[0] ?? Organizer?.sms_config?.[0];
    const config_status = smsConfig?.status ? smsConfig?.status : "0";
    const organizerApiKey =
      smsConfig?.status === "1" ? smsConfig.api_key : "null";
    const organizerSenderId =
      smsConfig?.status === "1" ? smsConfig.sender_id : "null";
    //console.log(data , number)
    const encodedMessage = "";

    const sendSMSAndAlert = async () => {
      try {
        await HandleSendSMS(
          number,
          encodedMessage,
          organizerApiKey,
          organizerSenderId,
          config_status,
          name,
          qty,
          ticketName,
          eventName,
          "Booking Template"
        );

        const values = {
          name,
          number,
          booking_date: booking_date,
          payment_Date: formateTemplateTime(created_at),
          eventName: eventName,
          qty: qty,
          category: category,
          location: location,
          DateTime: DateTime,
          ticketName: ticketName,
          eventDate: formateTemplateTime(eventDate),
          eventTime: eventTime,
        };
        await handleWhatsappAlert(
          number,
          values,
          template,
          thumbnail,
          Organizer
        );
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    };
    const executeTicketSend = async () => {
      let loadingInstance;
      if (showLoader) {
        loadingInstance = showLoading("Sending Ticket");
      }
      try {
        await sendSMSAndAlert();
        if (loadingInstance) loadingInstance.close();
        if (showLoader) {
          successAlert("Success!", "The ticket has been sent successfully.");
        }
      } catch (error) {
        if (loadingInstance) loadingInstance.close();
        ErrorAlert("There was a problem sending the ticket. Please try again.");
      }
    };
    if (type === "old") {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to send the ticket again?",
        icon: "warning",
        showCancelButton: true,
        backdrop: `rgba(60,60,60,0.8)`,
        confirmButtonText: "Send Ticket",
      }).then((result) => {
        if (result.isConfirmed) {
          executeTicketSend();
        }
      });
    } else {
      executeTicketSend();
    }
  };

  const GetBookingWhatsAppApi = async (Organizer, title) => {
    try {
      const res = await axios.get(
        `${api}whatsapp-api/${Organizer?.id}/${title}`,
        {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        }
      );
      if (res.data.status) {
        const data = res?.data;
        return data;
      }
    } catch (err) {
      console.log(err);
    }
  };
  //external
  const handleWhatsappAlert = async (
    number,
    values,
    templateName,
    mediaurl,
    Organizer
  ) => {
    const configData = await GetBookingWhatsAppApi(Organizer, templateName);
    const apiData = configData?.WhatsappApi;
    const config = configData?.data;
    let apiKey = config?.api_key;
    let template = apiData?.template_name;
    let vars = apiData?.variables;
    console.log("values", values);

    const valueMap = {
      ":C_Name": values?.name,
      ":C_number": values?.number,
      ":Event_Name": values?.eventName,
      ":T_QTY": values?.qty,
      ":Ticket_Name": values?.category,
      ":Event_Location": values?.location,
      ":Event_DateTime": values?.DateTime,
      ":Event_Time": values?.eventTime,
      ":Event_Date": values?.eventDate,
      ":Booking_Date": values?.booking_date,
      ":Payment_Date": values?.payment_Date,

      ":Credits": values?.credits,
      ":CT_Credits": values?.ctCredits,
      ":Shop_Name": values?.shopName,
      ":Shop_Keeper_Name": values?.shopKeeperName,
      ":Shop_Keeper_Number": values?.shopKeeperNumber,
    };
    const finalValues = vars?.map((v) => valueMap[v] ?? null);

    let modifiedNumber = modifyNumber(number);
    if (!Array.isArray(finalValues)) {
      console.error("Values is not an array");
      return;
    }
    let value = finalValues.join(",");
    let url;

    if (mediaurl) {
      url = `https://waba.smsforyou.biz/api/send-messages?apikey=${apiKey}&to=${modifiedNumber}&type=T&tname=${template}&values=${value}&media_url=${mediaurl}`;
    } else {
      url = `https://waba.smsforyou.biz/api/send-messages?apikey=${apiKey}&to=${modifiedNumber}&type=T&tname=${template}&values=${value}`;
    }
    try {
      const response = await axios.post(url);
      return response.data;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  };

  const getCurrentHostUrl = () => {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  };

  const HandleSendSMS = async (
    number,
    message,
    api_key,
    sender_id,
    config_status,
    name,
    qty,
    ticketName,
    eventName,
    template
  ) => {
    let modifiedNumber = modifyNumber(number);
    const currentUrl = getCurrentHostUrl();
    try {
      const response = await axios.post(
        `${api}send-sms`,
        {
          number: modifiedNumber,
          message: message,
          api_key: api_key,
          sender_id: sender_id,
          ticketName,
          template,
          eventName,
          config_status: config_status,
          qty,
          name,
          url: currentUrl,
        },
        {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        }
      );
    } catch (error) {
      // console.error('Error sending SMS:', error);
    }
  };

  const formatDateDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const formatDateRange = (dateRange) => {
    if (!dateRange) return '';

    const dates = dateRange.split(',').map(date => date.trim());

    if (dates.length === 1) {
      return formatDateDDMMYYYY(dates[0]);  // Format single date too
    } else if (dates.length === 2) {
      const [startDate, endDate] = dates;
      return `${formatDateDDMMYYYY(startDate)} to ${formatDateDDMMYYYY(endDate)}`;
    } else {
      return dateRange;  // fallback
    }
  };

  const convertTo12HourFormat = (time24) => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert hour to 12-hour format, with 12 instead of 0
    const minutesFormatted = minutes?.toString()?.padStart(2, "0"); // Format minutes with leading zero

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
        .replace(/[^\w-]+/g, "");
    }
    return "";
  };

  const convertSlugToTitle = (slug) => {
    if (slug) {
      return slug.replace(/-/g, " ").replace(/\b\w/g);
    }
  };

  const EventCategory = async (setState) => {
    try {
      const res = await axios.get(`${api}category-title`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const transformedData = Object.values(res.data.categoryData).map(
        (item) => ({
          label: item.title,
          value: item.id,
        })
      );
      setState(transformedData);
      return transformedData;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategoryData = async (category) => {
    try {
      const response = await axios.get(`${api}category-data/${category}`);
      return response.data;
    } catch (err) {
      return err.message;
    } finally {
    }
  };

  const sendMail = async (data) => {
    try {
      const res = await axios.post(
        `${api}booking-mail/${UserData?.id}`,
        { data },
        {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        }
      );
      if (res.data?.status) {
        // setMailSend(true)
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getCurrencySymbol = (currency) => {
    if (currencyMaster && currency) {
      if (currencyMaster.hasOwnProperty(currency)) {
        let symbol = currencyMaster[currency]?.symbol;
        return symbol;
      }
    }
  };

  const HandleBack = () => {
    window.history.back();
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        // Change 10 to your desired scroll threshold
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const UserCredits = async (id) => {
    if (id) {
      try {
        const response = await axios.get(`${api}chek-user/${id}`, {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        });
        setAmount(response.data.balance.total_credits || 0);
        return response.data.balance.total_credits || 0;
      } catch {
        // Handle error
      }
    }
  };

  const contextValue = {
    HandleBack,
    api,
    authToken,
    formatDateRange,
    UserData,
    userRole,
    UserList,
    GetUsersList,
    UserPermissions,
    handleMakeReport,
    DownloadExcelFile,
    HandleExport,
    HandleSendSMS,
    isMobile,
    formatDateTime,
    successAlert,
    ErrorAlert,
    AskAlert,
    handleWhatsappAlert,
    sendTickets,
    GetEventSmsConfig,
    formateTemplateTime,
    convertTo12HourFormat,
    truncateString,
    createSlug,
    convertSlugToTitle,
    EventCategory,
    extractDetails,
    sendMail,
    systemSetting,
    GetSystemSetting,
    showLoading,
    SystemVars,
    getCurrencySymbol,
    fetchCategoryData,
    isScrolled,
    GetSystemVars,
    loader,
    UserCredits,
    amount,
    isLoggedIn,
    hideMobileMenu,
    setHideMobileMenu,
    showHeaderBookBtn,
    setShowHeaderBookBtn,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};
export const useMyContext = () => useContext(MyContext);
