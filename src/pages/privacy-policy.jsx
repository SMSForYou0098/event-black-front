import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { generateOrganizationSchema , SEOHead } from "../utils/seo/seo";
import { withSSR, withCache } from "../utils/seo/ssr";

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
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <SEOHead
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                image="/default-og-image.jpg"
                url="/privacy-policy"
                type="article"
                structuredData={structuredData}
            />

      {/* Hero Section */}
      <section className="hero-section text-white py-5" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Container className="position-relative" style={{ zIndex: 10 }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <div className="mb-3" style={{ fontSize: '3.5rem' }}>🔒</div>
              <h4 className="display-3 fw-bold mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                Privacy Policy
              </h4>
              <p className="lead fs-5" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Your privacy is important to us. Learn how we collect, use, and protect your personal information.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-5" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Container>
          <Row>
            <Col lg={12}>
              {/* Introduction */}
              <div className="privacy-section">
                <div className="privacy-content">
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
                    Please note that our Privacy Policy forms part of our Terms and conditions available at https://getyourticket.in/terms-and-conditions
                  </p>
                </div>
              </div>

              {/* Definitions */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">📖</span>
                  1. DEFINITIONS
                </h2>
                <div className="privacy-content">
                  <div className="definition-item">
                    <div className="definition-term">1.1 "Controller"</div>
                    <p className="mb-0">means the natural or legal person, public authority, agency, or other body which alone or jointly with others, determines the purposes and means of the Processing of Personal Data.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.2 "Organiser"</div>
                    <p className="mb-0">means any person or entity who uses the Platform to publish and promote upcoming events to the Users.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.3 "Personal Data"</div>
                    <p className="mb-0">means any information relating to an identified or identifiable natural person; an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.4 "Process or Processed or Processing"</div>
                    <p className="mb-0">means any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, recording, organisation, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.5 "Processor"</div>
                    <p className="mb-0">means a natural or legal person, public authority, agency, or other body which Processes Personal Data on behalf of the Controller.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.6 "Platform"</div>
                    <p className="mb-0">shall have the meaning ascribed to it in the Terms of Use.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.7 "Sensitive Personal Data"</div>
                    <p className="mb-0">shall have the meaning ascribed to it under rule 3 of the SPDI Rules.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.8 "SPDI Rules"</div>
                    <p className="mb-0">means the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.9 'Terms of Use'</div>
                    <p className="mb-0">means the Terms of Use available at Terms of use.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.10 "User"</div>
                    <p className="mb-0">means any person or entity who uses or accesses the Platform to get information about upcoming events in the city.</p>
                  </div>

                  <div className="definition-item">
                    <div className="definition-term">1.11 "Website"(s)</div>
                    <p className="mb-0">means the websites that We operate.</p>
                  </div>
                </div>
              </div>

              {/* Age Requirement */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">👤</span>
                  Age Requirement
                </h2>
                <div className="privacy-content">
                  <p>
                    A transaction on Get Your Ticket is to be conducted by persons above the age of 18 years only. If you are under 18 years of age, you are not allowed to make a transaction in Get Your Ticket. It is the duty of the legal guardians of all persons below 18 years of age to ensure that their wards do not make a transaction without their supervision on Get Your Ticket. It shall be automatically deemed that by allowing any person below the age of 18 years to transact on Get Your Ticket, their legal guardians have expressly consented to their use and we disclaim any liability arising from your failure to do so.
                  </p>
                </div>
              </div>

              {/* Data Collection */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">📊</span>
                  2. What Personal Data We Collect
                </h2>
                <div className="privacy-content">
                  <p>We may collect your personal data when you:</p>
                  <ul className="list-styled">
                    <li>create an account with us or</li>
                    <li>otherwise provide us with your personal data or</li>
                    <li>use of any related services connected to Get Your Ticket or</li>
                    <li>participate in contests and surveys, apply for a job, or otherwise participate in activities we promote that might require information about you; or</li>
                    <li>complete contact forms or request newsletters or other information from us (e.g., email)</li>
                  </ul>

                  <p className="mt-4">When you access Get Your Ticket, we will automatically collect your computer data, which may include:</p>
                  <ul className="list-styled">
                    <li>browser type</li>
                    <li>IP address</li>
                    <li>language</li>
                    <li>operating system</li>
                    <li>cookies and the ID and location of your device</li>
                    <li>the state or country from which you accessed Get Your Ticket</li>
                    <li>the pages/videos you view</li>
                    <li>length of time spent on pages/videos</li>
                    <li>the services you use and the manner in which you use such services (e.g., the content you access, view, click on, search for, transact etc.)</li>
                    <li>the date and time of your visit</li>
                    <li>metadata, log files, error logs</li>
                    <li>other geographic and demographic information</li>
                    <li>other hardware and software information</li>
                    <li>which pop-up or push messages you might have seen and responded to</li>
                  </ul>

                  <p className="mt-3">
                    This computer data is collected for analysis and evaluation in order to help us improve Get Your Ticket, the services we provide and to enhance your experience by providing you with better services and benefits that you shall be entitled to.
                  </p>
                  <p>
                    To the extent that such computer data is maintained in a manner that identifies your name or contact information, it will be treated as personal data; otherwise, such computer data will be treated as non-personal data.
                  </p>
                </div>
              </div>

              {/* How We Use Data */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">🎯</span>
                  3. How We Use Your Personal Data
                </h2>
                <div className="privacy-content">
                  <p>
                    The personal data we collect from you will be used, or shared with third parties (including related companies and third party service providers), for some or all of the following purposes:
                  </p>
                  <ul className="list-styled">
                    <li>creating or maintaining any account or profile you may have with us</li>
                    <li>to track your activity on Get Your Ticket</li>
                    <li>verifying and carrying out financial transactions in relation to any payments or transfers you make</li>
                    <li>carrying out research and analytics on our users' demographics and behaviour</li>
                    <li>to personalise and/or tailor any communications that we may send you and provide you with products, services or information we think you may find useful or which you have requested from us or have expressed an interest in</li>
                    <li>to personalise and enhance user experience</li>
                    <li>determining and verifying your eligibility for certain marketing or transaction events and other features of Get Your Ticket</li>
                    <li>enforcing our terms of use; and/or</li>
                    <li>communicating with you in relation to your account and alerting you to the latest developments</li>
                    <li>to enable us to administer any competitions or other offers/promotions which you enter into for fraud screening and prevention purposes</li>
                  </ul>

                  <p className="mt-3">
                    When you register an account or otherwise provide us with your personal data, we may also use the personal data to send to you marketing and/or promotional materials about us and our services from time to time. You can unsubscribe from receiving the marketing information at any time by using the unsubscribe function within the electronic marketing material.
                  </p>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">🔄</span>
                  4. How We Share Your Personal Data
                </h2>
                <div className="privacy-content">
                  <p>
                    In order to provide our products and services to you or to otherwise fulfil contractual arrangements that we have with you, we may need to appoint other organisations to carry out some of the data processing activities on our behalf. These may include, for example, payment processing organisations, delivery organisations, fraud prevention and screening and credit risk management companies, and mailing houses.
                  </p>
                  <p>
                    We may share your data with advertising networks and/or social media platforms for the purposes of selecting and serving relevant adverts to you via those networks/platforms, and to search engine and analytics providers.
                  </p>
                  <p>
                    We as an intermediary are responsible to facilitate a transaction between you and the ultimate event organiser, cinema theatre and/or other entertainment provider so as to enable you to book a ticket for an entertainment event, movie, sport etc. For us to be able to facilitate this transaction and otherwise fulfil our contractual arrangements with these ultimate entertainment providers, we may have to share your personal data with them so that they are able to verify the accuracy of the information you have shared with us while issuing your valid entry/ticket, to provide you with services and benefits that you may be entitled to and to conduct their own analysis.
                  </p>
                </div>
              </div>

              {/* Third Party Links */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">🔗</span>
                  5. Third-Party Websites
                </h2>
                <div className="privacy-content">
                  <p>
                    Get Your Ticket and its services may contain links to third-party websites, including identity verification and social networking websites. Your use of these features may result in the collection or sharing of information about you, depending on the feature. Please be aware that we are not responsible for the content or privacy practices of other websites or services to which we link. We do not endorse or make any representations about third-party websites or services. The personal data you choose to provide to or that is collected by these third parties is not covered by our Privacy Statement. We strongly encourage you to read such third parties' privacy statements.
                  </p>
                </div>
              </div>

              {/* Legal Disclosure */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">⚖️</span>
                  6. Legal Disclosure of Personal Data
                </h2>
                <div className="privacy-content">
                  <p>We may share:</p>
                  <p>
                    (a) your personal data with any person or entity where we believe in good faith that such disclosure is necessary to:
                  </p>
                  <ul className="list-styled">
                    <li>(i) comply with the law or in response to a subpoena, court order, government request, or other legal process</li>
                    <li>(ii) produce relevant documents or information in connection with litigation, arbitration, mediation, adjudication, government or internal investigations, or other legal or administrative proceedings</li>
                    <li>(iii) protect the interests, rights, safety, or property of Get Your Ticket or others</li>
                    <li>(iv) otherwise as permitted under applicable law</li>
                  </ul>

                  <p className="mt-3">
                    (b) personal data about our visitors, customers, or former customers with the following types of companies that perform services on our behalf or with whom we have joint marketing agreements:
                  </p>
                  <ul className="list-styled">
                    <li>(i) Non-financial companies such as envelope stuffers, fulfilment service providers, payment processors, data processors, customer/support services, etc.</li>
                    <li>(ii) Financial service providers such as companies engaged in banking/payments/facilitating financial transactions</li>
                  </ul>

                  <p className="mt-3">
                    In sharing your personal data with such parties, we will reasonably endeavour to ensure that the third parties and our affiliates keep your personal data secure from unauthorised access, collection, use, disclosure, or similar risks and retain your personal data only for as long as they need your personal data to achieve the abovementioned purposes.
                  </p>

                  <p className="mt-3">
                    You acknowledge that, notwithstanding this Privacy Policy, we have at all times the right to disclose your personal data to any legal, regulatory, governmental, tax, law enforcement or other authorities pursuant to applicable law and our legal obligations. This may arise from any investigation, order, or request by such parties. To the furthest extent permissible by law, you agree not to take any action and/or waive your rights to take any action against us for the disclosure of your personal data in these circumstances.
                  </p>

                  <p className="mt-3">
                    If any disclosure of your personal data involves the transfer of your personal data by Get Your Ticket out of India, we will take steps to reasonably ensure that the receiving jurisdiction has in place a standard of protection accorded to personal data that is comparable to the protection under India's data protection laws.
                  </p>
                </div>
              </div>

              {/* Security */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">🛡️</span>
                  7. Security Measures
                </h2>
                <div className="privacy-content">
                  <p>
                    We have implemented reasonable security arrangements including physical, administrative, technical, and electronic security measures to protect against the loss, misuse, and alteration of your personal data. We are PCI DSS certified which means that the data you submit to us is secure and protected against loss or theft in accordance with the globally accepted data security standards. Despite our best efforts, however, no security measures are perfect or impenetrable. In the event where you believe your privacy has been breached, please contact us immediately.
                  </p>
                </div>
              </div>

              {/* Password Security */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">🔑</span>
                  8. Password Security
                </h2>
                <div className="privacy-content">
                  <p>
                    It is your responsibility to protect any passwords you require to access your account on Get Your Ticket. Please use unique numbers, letters and special characters, and do not share your password with anyone. If you do share your password with others, you will be responsible for all actions taken in the name of your account and the consequences. If you lose control of your password, you may lose substantial control over your personal data and other information submitted to us. You could also be subject to legally binding actions taken on your behalf. Therefore, if your password has been compromised for any reason or if you have grounds to believe that your password has been compromised, you should immediately contact us and change your password.
                  </p>
                  <p>
                    You undertake to treat your password and other confidential information in relation to the use of Get Your Ticket and its services confidentially, and we disclaim any liability arising from your failure to do so.
                  </p>
                  <p>
                    Some of our web pages use "cookies" so that we can better serve you with customized information when you return to our site. Cookies are identifiers which a website can send to your browser to keep on your computer to facilitate your next visit to our site. You can set your browser to notify you when you are sent a cookie, giving you the option to decide whether or not to accept it.
                  </p>
                </div>
              </div>

              {/* Cookie Policy */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">🍪</span>
                  9. COOKIE POLICY
                </h2>
                <div className="privacy-content">
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
                </div>
              </div>

              {/* Privacy of Children */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">👶</span>
                  10. PRIVACY OF CHILDREN
                </h2>
                <div className="privacy-content">
                  <p>
                    <strong>10.1</strong> We recognize the importance of children's safety and privacy. We do not request, or knowingly collect, any Personal Data from children under the age of 16 without the consent given or authorized by the parent or guardian of the child. Parents or guardians can revoke the consent previously made and review, edit, or delete the Personal Data of children for whom they provided consent. If a parent or guardian becomes aware that his or her child has provided Us with Personal Data without their consent, they should write to us at the email address provided in clause.
                  </p>
                </div>
              </div>

              {/* Notice to User */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">📢</span>
                  11. NOTICE TO USER AND OTHER EXCLUSIONS
                </h2>
                <div className="privacy-content">
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
                </div>
              </div>

              {/* Grievance Officer */}
              <div className="privacy-section">
                <h2 className="section-title">
                  <span className="section-icon">📧</span>
                  12. CONTACTING OUR GRIEVANCE OFFICER
                </h2>
                <div className="privacy-content">
                  <p>
                    This Policy does not apply to aggregated information which summarises statistical information about groups of members, and which does not include name, contact information, or any other information that would allow any particular individual to be identified.
                  </p>
                  <p>
                    This Policy may be amended at any time and You shall be notified only if there are material changes to this Policy.
                  </p>
                </div>
              </div>

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
