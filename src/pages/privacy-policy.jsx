// pages/privacy-policy.jsx
import React from "react";
import { generateOrganizationSchema , SEOHead } from "../utils/seo/seo";
import { withSSR, withCache } from "../utils/seo/ssr";

const PrivacyPolicyPage = () => {
    const seoTitle = "Privacy Policy | Get Your Ticket";
    const seoDescription =
        "Read the Privacy Policy of Trava Get Your Ticket Pvt. Ltd. to understand how we collect, process, and protect your personal data in accordance with Indian data protection laws.";
    const seoKeywords =
        "privacy policy, data protection, get your ticket, personal data, cookies, security, SPDI rules";

    const structuredData = {
        ...generateOrganizationSchema(),
        "@type": "WebPage",
        "name": "Privacy Policy - Get Your Ticket",
        "description": seoDescription,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/privacy-policy`,
    };

    return (
        <main className="container mx-auto px-6 py-10">
            {/* SEO Meta Tags */}
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                image="/default-og-image.jpg"
                url="/privacy-policy"
                type="article"
                structuredData={structuredData}
            />

            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <p className="mb-4">
                This Privacy Policy explains how Trava Get Your Ticket Pvt. Ltd. ("Get
                Your Ticket") or any of its affiliates or subsidiaries ("We", "Us",
                "Our") processes personal data collected from natural persons as
                specified below, as a Controller ("You").
            </p>

            <p className="mb-4">
                If you do not agree to the collection and processing of your personal
                data, you may choose not to provide the data sought by us. However, you
                may not be able to use certain parts of our Platform or Website.
            </p>

            <p className="mb-4">
                Get Your Ticket respects your privacy and recognizes the importance of
                protecting your personal information. We follow appropriate standards
                when it comes to safeguarding your privacy on our websites and
                applications.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">1. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong>Controller:</strong> Determines the purposes and means of
                    processing personal data.
                </li>
                <li>
                    <strong>Personal Data:</strong> Any information relating to an
                    identified or identifiable natural person.
                </li>
                <li>
                    <strong>Processor:</strong> Any entity processing personal data on
                    behalf of a controller.
                </li>
                <li>
                    <strong>Platform:</strong> Refers to Get Your Ticket’s website or app
                    as defined in the Terms of Use.
                </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-3">
                2. Collection of Personal Data
            </h2>
            <p className="mb-4">
                We may collect your personal data when you create an account, use our
                services, participate in contests or surveys, or contact us. This may
                include your name, contact information, device information, IP address,
                cookies, and usage data.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">
                3. Use of Personal Data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
                <li>To create and maintain your account.</li>
                <li>To verify and carry out financial transactions.</li>
                <li>To personalize and enhance your user experience.</li>
                <li>To communicate with you about your account and promotions.</li>
                <li>To comply with legal obligations and enforce our Terms of Use.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-3">4. Data Sharing</h2>
            <p className="mb-4">
                We may share your data with trusted third parties, such as payment
                processors, event organizers, analytics providers, or government
                authorities when required by law. We ensure these entities maintain
                reasonable data security standards.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">5. Security</h2>
            <p className="mb-4">
                We implement administrative, technical, and physical security measures
                to safeguard your personal data. We are PCI DSS certified to ensure
                secure processing of payment-related information.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">6. Cookies</h2>
            <p className="mb-4">
                We use cookies to improve your browsing experience and provide relevant
                services. You may control cookie settings through your browser, but some
                features may not function properly if disabled.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">7. Children’s Privacy</h2>
            <p className="mb-4">
                We do not knowingly collect personal data from children under the age of
                16 without parental consent. Parents can contact us to review or delete
                such information.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-3">8. Contact</h2>
            <p className="mb-4">
                For privacy-related questions or to report a concern, contact our
                Grievance Officer at{" "}
                <a
                    href="mailto:support@getyourticket.in"
                    className="text-blue-600 hover:underline"
                >
                    support@getyourticket.in
                </a>
                .
            </p>

            <p className="text-sm text-gray-500 mt-10">
                This Policy may be updated periodically. You will be notified only if
                there are material changes.
            </p>
        </main>
    );
};

// --- SSR with caching ---
export const getServerSideProps = withCache(
    withSSR(async (context) => {
        context.res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=7200"
        );

        return {
            props: {},
        };
    }),
    process.env.NODE_ENV === "production" ? 3600 : 0
);

export default PrivacyPolicyPage;
