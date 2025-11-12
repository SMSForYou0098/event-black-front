import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { generateOrganizationSchema, SEOHead } from "../utils/seo/seo";
import { withSSR, withCache } from "../utils/seo/ssr";
import Link from 'next/link';

// Reusable Section Component
const PolicySection = ({ icon, title, children }) => (
  <div className="policy-section">
    <h2 className="section-title">
      <span className="section-icon">{icon}</span>
      {title}
    </h2>
    <div className="policy-content">
      {children}
    </div>
  </div>
);

// Reusable Definition Item Component
const DefinitionItem = ({ term, description }) => (
  <div className="definition-item">
    <div className="definition-term">{term}</div>
    <p className="mb-0">{description}</p>
  </div>
);

// Reusable List Component
const BulletList = ({ items, className = "list-styled" }) => (
  <ul className={className}>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const PrivacyPolicy = () => {
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

  // Data arrays
  const definitions = [
    {
      term: '1.1 Controller',
      description: 'means the natural or legal person, public authority, agency, or other body which alone or jointly with others, determines the purposes and means of the Processing of Personal Data.'
    },
    {
      term: '1.2 Organiser',
      description: 'means any person or entity who uses the Platform to publish and promote upcoming events to the Users.'
    },
    {
      term: '1.3 Personal Data',
      description: 'means any information relating to an identified or identifiable natural person; an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person.'
    },
    {
      term: '1.4 Process or Processed or Processing',
      description: 'means any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, recording, organisation, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.'
    },
    {
      term: '1.5 Processor',
      description: 'means a natural or legal person, public authority, agency, or other body which Processes Personal Data on behalf of the Controller.'
    },
    {
      term: '1.6 Platform',
      description: 'shall have the meaning ascribed to it in the Terms of Use.'
    },
    {
      term: '1.7 Sensitive Personal Data',
      description: 'shall have the meaning ascribed to it under rule 3 of the SPDI Rules.'
    },
    {
      term: '1.8 SPDI Rules',
      description: 'means the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.'
    },
    {
      term: '1.9 \'Terms of Use\'',
      description: 'means the Terms of Use available at Terms of use.'
    },
    {
      term: '1.10 User',
      description: 'means any person or entity who uses or accesses the Platform to get information about upcoming events in the city.'
    },
    {
      term: '1.11 Website(s)',
      description: 'means the websites that We operate.'
    }
  ];

  const dataCollectionConditions = [
    'create an account with us or',
    'otherwise provide us with your personal data or',
    'use of any related services connected to Get Your Ticket or',
    'participate in contests and surveys, apply for a job, or otherwise participate in activities we promote that might require information about you; or',
    'complete contact forms or request newsletters or other information from us (e.g., email)'
  ];

  const automaticDataCollection = [
    'browser type',
    'IP address',
    'language',
    'operating system',
    'cookies and the ID and location of your device',
    'the state or country from which you accessed Get Your Ticket',
    'the pages/videos you view',
    'length of time spent on pages/videos',
    'the services you use and the manner in which you use such services (e.g., the content you access, view, click on, search for, transact etc.)',
    'the date and time of your visit',
    'metadata, log files, error logs',
    'other geographic and demographic information',
    'other hardware and software information',
    'which pop-up or push messages you might have seen and responded to'
  ];

  const dataUsagePurposes = [
    'creating or maintaining any account or profile you may have with us',
    'to track your activity on Get Your Ticket',
    'verifying and carrying out financial transactions in relation to any payments or transfers you make',
    'carrying out research and analytics on our users\' demographics and behaviour',
    'to personalise and/or tailor any communications that we may send you and provide you with products, services or information we think you may find useful or which you have requested from us or have expressed an interest in',
    'to personalise and enhance user experience',
    'determining and verifying your eligibility for certain marketing or transaction events and other features of Get Your Ticket',
    'enforcing our terms of use; and/or',
    'communicating with you in relation to your account and alerting you to the latest developments',
    'to enable us to administer any competitions or other offers/promotions which you enter into for fraud screening and prevention purposes'
  ];

  const legalDisclosureReasons = [
    '(i) comply with the law or in response to a subpoena, court order, government request, or other legal process',
    '(ii) produce relevant documents or information in connection with litigation, arbitration, mediation, adjudication, government or internal investigations, or other legal or administrative proceedings',
    '(iii) protect the interests, rights, safety, or property of Get Your Ticket or others',
    '(iv) otherwise as permitted under applicable law'
  ];

  const serviceProviderTypes = [
    '(i) Non-financial companies such as envelope stuffers, fulfilment service providers, payment processors, data processors, customer/support services, etc.',
    '(ii) Financial service providers such as companies engaged in banking/payments/facilitating financial transactions'
  ];

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image="/default-og-image.jpg"
        url="/privacy-policy"
        type="article"
        structuredData={structuredData}
      />

      <h4 className="display-3 fw-bold text-center custom-text-secondary">
        Privacy Policy
      </h4>

      <section className="py-2" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Container>
          <Row>
            <Col lg={12}>
              {/* Introduction */}
              <div className="policy-section">
                <div className="policy-content">
                  <p>
                    This privacy policy ("Privacy Policy") explains how Trava Get Your Ticket Pvt. Ltd. ("Get Your Ticket") or any of its affiliates or subsidiaries. ("We", "Us", "Our") Process Personal Data collected from natural persons as specified in clause 2 below, as a Controller ("You").
                  </p>
                  <p>
                    If You do not agree to the collection and Processing of Your Personal Data, You are free to not provide the Personal Data sought by Us for collection and Processing, in which case You may not use Our Platform or Website for which the said Personal Data was sought.
                  </p>
                  <p>
                    Get Your Ticket respects your privacy and recognizes the need to protect your personal information (any information by which you can be identified, such as name, address, financial information, and telephone number) you share with us. We would like to assure you that we follow appropriate standards when it comes to protecting your privacy on our websites and applications. In general, you can visit Get Your Ticket without telling us who you are or revealing any personal information about yourself. We track the Internet address of the domains from which people visit us and analyze this data for trends and statistics, but the individual user remains anonymous.
                  </p>
                  <p>
                    Please note that our Privacy Policy forms part of our Terms and conditions available at <Link href="https://getyourticket.in/terms-and-conditions">https://getyourticket.in/terms-and-conditions</Link> 
                  </p>
                </div>
              </div>

              {/* Definitions */}
              <PolicySection icon="📖" title="1. DEFINITIONS">
                {definitions.map((def, index) => (
                  <DefinitionItem key={index} term={def.term} description={def.description} />
                ))}
              </PolicySection>

              {/* Age Requirement */}
              <PolicySection icon="👤" title="Age Requirement">
                <p>
                  A transaction on Get Your Ticket is to be conducted by persons above the age of 18 years only. If you are under 18 years of age, you are not allowed to make a transaction in Get Your Ticket. It is the duty of the legal guardians of all persons below 18 years of age to ensure that their wards do not make a transaction without their supervision on Get Your Ticket. It shall be automatically deemed that by allowing any person below the age of 18 years to transact on Get Your Ticket, their legal guardians have expressly consented to their use and we disclaim any liability arising from your failure to do so.
                </p>
              </PolicySection>

              {/* Data Collection */}
              <PolicySection icon="📊" title="2. What Personal Data We Collect">
                <p>We may collect your personal data when you:</p>
                <BulletList items={dataCollectionConditions} />

                <p className="mt-4">When you access Get Your Ticket, we will automatically collect your computer data, which may include:</p>
                <BulletList items={automaticDataCollection} />

                <p className="mt-3">
                  This computer data is collected for analysis and evaluation in order to help us improve Get Your Ticket, the services we provide and to enhance your experience by providing you with better services and benefits that you shall be entitled to.
                </p>
                <p>
                  To the extent that such computer data is maintained in a manner that identifies your name or contact information, it will be treated as personal data; otherwise, such computer data will be treated as non-personal data.
                </p>
              </PolicySection>

              {/* How We Use Data */}
              <PolicySection icon="🎯" title="3. How We Use Your Personal Data">
                <p>
                  The personal data we collect from you will be used, or shared with third parties (including related companies and third party service providers), for some or all of the following purposes:
                </p>
                <BulletList items={dataUsagePurposes} />

                <p className="mt-3">
                  When you register an account or otherwise provide us with your personal data, we may also use the personal data to send to you marketing and/or promotional materials about us and our services from time to time. You can unsubscribe from receiving the marketing information at any time by using the unsubscribe function within the electronic marketing material.
                </p>
              </PolicySection>

              {/* Data Sharing */}
              <PolicySection icon="🔄" title="4. How We Share Your Personal Data">
                <p>
                  In order to provide our products and services to you or to otherwise fulfil contractual arrangements that we have with you, we may need to appoint other organisations to carry out some of the data processing activities on our behalf. These may include, for example, payment processing organisations, delivery organisations, fraud prevention and screening and credit risk management companies, and mailing houses.
                </p>
                <p>
                  We may share your data with advertising networks and/or social media platforms for the purposes of selecting and serving relevant adverts to you via those networks/platforms, and to search engine and analytics providers.
                </p>
                <p>
                  We as an intermediary are responsible to facilitate a transaction between you and the ultimate event organiser, cinema theatre and/or other entertainment provider so as to enable you to book a ticket for an entertainment event, movie, sport etc. For us to be able to facilitate this transaction and otherwise fulfil our contractual arrangements with these ultimate entertainment providers, we may have to share your personal data with them so that they are able to verify the accuracy of the information you have shared with us while issuing your valid entry/ticket, to provide you with services and benefits that you may be entitled to and to conduct their own analysis.
                </p>
              </PolicySection>

              {/* Third Party Links */}
              <PolicySection icon="🔗" title="5. Third-Party Websites">
                <p>
                  Get Your Ticket and its services may contain links to third-party websites, including identity verification and social networking websites. Your use of these features may result in the collection or sharing of information about you, depending on the feature. Please be aware that we are not responsible for the content or privacy practices of other websites or services to which we link. We do not endorse or make any representations about third-party websites or services. The personal data you choose to provide to or that is collected by these third parties is not covered by our Privacy Statement. We strongly encourage you to read such third parties' privacy statements.
                </p>
              </PolicySection>

              {/* Legal Disclosure */}
              <PolicySection icon="⚖️" title="6. Legal Disclosure of Personal Data">
                <p>We may share:</p>
                <p>
                  (a) your personal data with any person or entity where we believe in good faith that such disclosure is necessary to:
                </p>
                <BulletList items={legalDisclosureReasons} />

                <p className="mt-3">
                  (b) personal data about our visitors, customers, or former customers with the following types of companies that perform services on our behalf or with whom we have joint marketing agreements:
                </p>
                <BulletList items={serviceProviderTypes} />

                <p className="mt-3">
                  In sharing your personal data with such parties, we will reasonably endeavour to ensure that the third parties and our affiliates keep your personal data secure from unauthorised access, collection, use, disclosure, or similar risks and retain your personal data only for as long as they need your personal data to achieve the abovementioned purposes.
                </p>

                <p className="mt-3">
                  You acknowledge that, notwithstanding this Privacy Policy, we have at all times the right to disclose your personal data to any legal, regulatory, governmental, tax, law enforcement or other authorities pursuant to applicable law and our legal obligations. This may arise from any investigation, order, or request by such parties. To the furthest extent permissible by law, you agree not to take any action and/or waive your rights to take any action against us for the disclosure of your personal data in these circumstances.
                </p>

                <p className="mt-3">
                  If any disclosure of your personal data involves the transfer of your personal data by Get Your Ticket out of India, we will take steps to reasonably ensure that the receiving jurisdiction has in place a standard of protection accorded to personal data that is comparable to the protection under India's data protection laws.
                </p>
              </PolicySection>

              {/* Security */}
              <PolicySection icon="🛡️" title="7. Security Measures">
                <p>
                  We have implemented reasonable security arrangements including physical, administrative, technical, and electronic security measures to protect against the loss, misuse, and alteration of your personal data. We are PCI DSS certified which means that the data you submit to us is secure and protected against loss or theft in accordance with the globally accepted data security standards. Despite our best efforts, however, no security measures are perfect or impenetrable. In the event where you believe your privacy has been breached, please contact us immediately.
                </p>
              </PolicySection>

              {/* Password Security */}
              <PolicySection icon="🔑" title="8. Password Security">
                <p>
                  It is your responsibility to protect any passwords you require to access your account on Get Your Ticket. Please use unique numbers, letters and special characters, and do not share your password with anyone. If you do share your password with others, you will be responsible for all actions taken in the name of your account and the consequences. If you lose control of your password, you may lose substantial control over your personal data and other information submitted to us. You could also be subject to legally binding actions taken on your behalf. Therefore, if your password has been compromised for any reason or if you have grounds to believe that your password has been compromised, you should immediately contact us and change your password.
                </p>
                <p>
                  You undertake to treat your password and other confidential information in relation to the use of Get Your Ticket and its services confidentially, and we disclaim any liability arising from your failure to do so.
                </p>
                <p>
                  Some of our web pages use "cookies" so that we can better serve you with customized information when you return to our site. Cookies are identifiers which a website can send to your browser to keep on your computer to facilitate your next visit to our site. You can set your browser to notify you when you are sent a cookie, giving you the option to decide whether or not to accept it.
                </p>
              </PolicySection>

              {/* Cookie Policy */}
              <PolicySection icon="🍪" title="9. COOKIE POLICY">
                <p>
                  <strong>9.1</strong> Cookies are text files that are placed on Your computer to collect standard internet log information and visitor behaviour information by Us. When You visit the Website(s), We may collect Personal Data automatically from You through cookies or similar technology. We also set cookies to collect information that is used either in aggregate form to help Us understand how our Website(s) are being used or how effective Our marketing campaigns are, to help customise the Website(s) for You or to make advertising messages more relevant to You.
                </p>
                <p>
                  <strong>9.2 Essential Cookies:</strong> We set essential cookies that enable core functionality such as security, network management, and accessibility. You may not opt-out of these cookies. However, You may disable these by changing Your browser settings, but this may affect how the Website(s) functions.
                </p>
                <p>
                  <strong>9.3 Analytics, Customisation and Advertising Cookies:</strong> We set these cookies to help Us improve Our Website(s) by collecting and reporting information on how You use it. The cookies collect information in a way that does not directly identify anyone.
                </p>
                <p>
                  <strong>9.4</strong> When You visit the Website(s), a cookie banner will be displayed providing additional information about cookies and options to opt out of non-essential cookies as required by applicable laws.
                </p>
              </PolicySection>

              {/* Privacy of Children */}
              <PolicySection icon="👶" title="10. PRIVACY OF CHILDREN">
                <p>
                  <strong>10.1</strong> We recognize the importance of children's safety and privacy. We do not request, or knowingly collect, any Personal Data from children under the age of 16 without the consent given or authorized by the parent or guardian of the child. Parents or guardians can revoke the consent previously made and review, edit, or delete the Personal Data of children for whom they provided consent. If a parent or guardian becomes aware that his or her child has provided Us with Personal Data without their consent, they should write to us at the email address provided in clause.
                </p>
              </PolicySection>

              {/* Notice to User */}
              <PolicySection icon="📢" title="11. NOTICE TO USER AND OTHER EXCLUSIONS">
                <p>
                  <strong>11.1</strong> Where the Personal Data of Users are collected by the Organiser on their event page, that Organiser is the Controller of such Personal Data. For the additional information collected by Organisers on their brand page, Users' data privacy questions and requests should be submitted to the Organiser in its capacity as the Users' Controller. We are not responsible for Organisers' privacy or security practices or the data retention period which may be different from this notice. Organisers of Our Platform are solely responsible for establishing policies for and ensuring compliance with all applicable laws and regulations, as well as any and all privacy policies, agreements, or other obligations, relating to the collection of Personal Data in connection with the use of their brand page by the Users.
                </p>
                <p>
                  <strong>11.2</strong> Our Website(s) contain links to other websites. Our Policy applies only to our Website(s), so if You click on a link to another website, You should read their privacy policy. We encourage You to review the privacy statements of any such other websites to understand their Personal Data practices.
                </p>
                <p>
                  <strong>11.3</strong> This Policy does not apply to aggregated information which summarises statistical information about groups of members, and which does not include name, contact information, or any other information that would allow any particular individual to be identified.
                </p>
                <p>
                  <strong>11.4</strong> Website(s) use and transfer to any other app of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements.
                </p>
              </PolicySection>

              {/* Grievance Officer */}
              <PolicySection icon="📧" title="12. CONTACTING OUR GRIEVANCE OFFICER">
                <p>
                  This Policy does not apply to aggregated information which summarises statistical information about groups of members, and which does not include name, contact information, or any other information that would allow any particular individual to be identified.
                </p>
                <p>
                  This Policy may be amended at any time and You shall be notified only if there are material changes to this Policy.
                </p>
              </PolicySection>

              {/* Last Updated */}
              <div className="last-updated">
                <p className="mb-0">
                  By using our platform, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

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

export default PrivacyPolicy;