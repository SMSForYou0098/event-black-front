import { Headphones, Phone, Megaphone, Users } from "lucide-react";

// contact info
export const CONTACT_INFO = {
    supportEmail: "support@getyourticket.in",
    adsEmail: "adds@getyourticket.in",
    inquiriesEmail: "contact@getyourticket.in",
    phone1: process.env.NEXT_PUBLIC_SUPPORT_CALL_PHONE1 || "8000308888",
    phone2: process.env.NEXT_PUBLIC_SUPPORT_CALL_PHONE2 || "8000306666",
    workingHours: "11:00 AM - 6:00 PM",

    address: {
        title: "401-402, Blue Cystals",
        line1: " VV Nagar",
        line2: "Anand, Gujarat 388120"
    },
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.886884154925!2d72.92939439999999!3d22.545909700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4d1c5d587853%3A0x743303d6fea6e85f!2sGetyourticket.in!5e0!3m2!1sen!2sin!4v1773140637244!5m2!1sen!2sin"
};

// contact card info
export const CONTACT_CARD_INFO = [
    {
        icon: Headphones,
        title: "Help & support",
        discription: "Need quick, reliable support? Our team is always ready to help you.",
        CONTACT_INFO: CONTACT_INFO,
        email: CONTACT_INFO.supportEmail,
    },
    {
        icon: Phone,
        title: "Call Us",
        discription: "Speak directly to one of our team members for assistance.",
        CONTACT_INFO: CONTACT_INFO,

    },
    {
        icon: Megaphone,
        title: "Advertising",
        discription: "Looking to advertise with us? contact our advertising team",
        CONTACT_INFO: CONTACT_INFO,
        email: CONTACT_INFO.adsEmail,
    },
    {
        icon: Users,
        title: "Press Inquiries",
        discription: "For media inquiries or products our press team is here to help.",
        CONTACT_INFO: CONTACT_INFO,
        email: CONTACT_INFO.inquiriesEmail,
    }

]
