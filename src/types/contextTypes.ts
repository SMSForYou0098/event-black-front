import { StaticImageData } from "next/image";

// Define interfaces
export interface User {
  id?: number;
  role?: string;
  role_name?: string;
  name?: string;
  whatsapp_number?: string;
  permissions?: string[];
  [key: string]: any;
}

export interface SmsConfig {
  status?: string;
  api_key?: string;
  sender_id?: string;
  [key: string]: any;
}

export interface SystemSetting {
  [key: string]: any;
}

export interface SystemVar {
  [key: string]: any;
}

export interface EventData {
  ticket?: {
    event?: {
      thumbnail?: string;
      name?: string;
      date_range?: string;
      start_time?: string;
      end_time?: string;
      address?: string;
      whts_note?: string;
      insta_whts_url?: string;
      user?: User;
      event_type?: string;
    };
    name?: string;
  };
  user?: User;
  number?: string;
  token?: string;
  booking_date?: string;
  created_at?: string;
  bookings?: Array<{
    ticket?: {
      event?: {
        thumbnail?: string;
        name?: string;
        date_range?: string;
        start_time?: string;
        end_time?: string;
        address?: string;
        whts_note?: string;
        insta_whts_url?: string;
        user?: User;
      };
      name?: string;
    };
    user?: User;
    number?: string;
    token?: string;
    booking_date?: string;
    created_at?: string;
  }>;
  [key: string]: any;
}

export interface WhatsappApi {
  template_name?: string;
  variables?: string[];
  [key: string]: any;
}

export interface ContextValue {
  HandleBack: () => void;
  api: string | undefined;
  authToken: string | null;
  formatDateRange: (dateRange: string) => string;
  UserData: User | null;
  userRole: string | undefined;
  UserList: any[];
  OrganizerList: any[];
  GetUsersList: () => Promise<void>;
  UserPermissions: string[] | undefined;
  handleMakeReport: (number: string, message_id: string) => Promise<void>;
  DownloadExcelFile: (data: any[], fileName: string) => void;
  HandleExport: (path: string, fileName: string, id?: number | null) => Promise<void>;
  HandleSendSMS: (
    number: string,
    token: string,
    message: string,
    api_key: string,
    sender_id: string,
    config_status: string,
    name: string,
    qty: number,
    ticketName: string,
    eventName: string,
    whts_note: string,
    insta_whts_url: string,
    template: string
  ) => Promise<void>;
  isMobile: boolean;
  isTablet: boolean;
  formatDateTime: (dateTime: string) => string;
  successAlert: (title: string, subtitle: string) => void;
  ErrorAlert: (error: string) => void;
  WarningAlert: (warning: string) => void;
  AskAlert: (title: string, buttonText: string, SuccessMessage?: string) => void;
  handleWhatsappAlert: (
    number: string,
    values: any,
    templateName: string,
    mediaurl: string,
    Organizer: User
  ) => Promise<any>;
  sendTickets: (data: EventData, type: string, showLoader?: boolean, template?: string) => void;
  GetEventSmsConfig: (id: number) => Promise<void>;
  formateTemplateTime: (dateStr: string, time?: string) => string;
  convertTo12HourFormat: (time24: string) => string;
  truncateString: (str: string, num: number) => string;
  createSlug: (title: string) => string;
  convertSlugToTitle: (slug: string) => string;
  EventCategory: (
  setState: React.Dispatch<React.SetStateAction<any[]>>
) => Promise<{ label: string; value: string }[] | undefined>;

  extractDetails: (data: EventData) => any;
  sendMail: (data: any) => Promise<void>;
  systemSetting: SystemSetting | undefined;
  GetSystemSetting: () => Promise<void>;
  showLoading: (processName: string) => any;
  SystemVars: SystemVar[];
  getCurrencySymbol: (currency: string) => string | undefined;
  fetchCategoryData: (category: string) => Promise<any>;
  isScrolled: boolean;
  GetSystemVars: () => Promise<void>;
  loader: string | StaticImageData;
  UserCredits: (id: number) => Promise<number>;
  amount: number;
  isLoggedIn: boolean;
  hideMobileMenu: boolean;
  setHideMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  auth_session: string | null;
  session_id: string | null;
}