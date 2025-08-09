import React from 'react';
import './LegalPage.css';

const TermsOfUsePage = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <button className="back-button" onClick={onBack}>← Back to Form</button>

        <div className="legal-header">
          <h1 className="legal-title">Terms Of Use</h1>
          <p className="legal-subtitle">Last Updated and effective: August 4th, 2025</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <p>
              Please review the following Terms of Use (the “Terms”), which govern your use of smartautoinsider.com (the “Site”). Vision Media Group, its parent,
              subsidiary, and affiliated companies, and each of their respective officers, directors, members, owners, employees, agents, and representatives are
              expressly included in any reference to the “Site”, “Us”, “Our”, and/or “We” herein. By using the Site, you agree to follow and be bound by these Terms
              of Use. We reserve the right to update or modify these Terms at any time without prior notice. For this reason, we encourage you to review these Terms
              each time you use the Site. If you do not agree to these Terms, please do not use the Site. If you continue to use the Site or our Service after we make
              changes, you accept the updated Terms. Check the “Last Updated” date at the top of this page to see when the Terms were last changed. These Terms are a
              binding agreement between you and us.
            </p>
          </section>

          <section className="legal-section">
            <h2>Privacy Policy</h2>
            <p>
              We explain the personal information we collect, how we use it, and your rights in our Privacy Policy. By using the Site, you confirm you have read,
              understand and agree to our Privacy Policy (link to Privacy Policy).
            </p>
          </section>

          <section className="legal-section">
            <h2>Site Modification Or Suspension</h2>
            <p>
              We reserve the right, at any time in our sole discretion, to modify, suspend or discontinue the Site or any service, content, feature or product
              offered through the Site, with or without notice. You agree that we shall not be liable to any third party for any modification, suspension or
              discontinuance of the Site, or any service, content, feature or product offered through the Site.
            </p>
          </section>

          <section className="legal-section">
            <h2>License And Access</h2>
            <p>
              Subject to your compliance with these Terms of Use, Vision Media Group grants you a limited, non-exclusive, non-transferable, non-sublicensable license
              to access and make personal and non-commercial use of the Site and any services provided thereon. This license does not include any resale or commercial
              use of any Site content; any downloading or copying of registration information for the benefit of another merchant; any derivative use of this Site or
              its content; or any use of robots, data mining, or similar data gathering and extraction tools. The Site or any portion of it may not be reproduced,
              duplicated, copied, sold, resold, visited, or otherwise exploited for any commercial purpose without express written consent of Vision Media Group. You
              may not frame or utilize framing techniques to enclose any trademark, logo, or other proprietary information (including text, images, page layout, or
              form) of Vision Media Group and our affiliates without express written consent. You may not use any meta tags or any other “hidden text” utilizing the
              Vision Media Group name or trademarks without the express written consent of Vision Media Group. All rights not expressly granted to you in these Terms
              of Use are reserved and retained by Vision Media Group, its affiliates, licensors, publishers, rights holders or other content providers. Any
              unauthorized use of the Site or services provided terminates the permission or license to access and use the Site.
            </p>
          </section>

          <section className="legal-section">
            <h2>Our Service Description</h2>
            <p>
              Our platform facilitates connections between users seeking auto insurance coverage (“Users”) and potential insurers, insurance networks (“Insurance
              Partners”), or third-party insurance service providers (“Service Providers”). Our platform offers an online application process where Users can submit
              their personal and vehicle information to be considered for insurance quotes (“Service”).
            </p>
          </section>

          <section className="legal-section">
            <h2>Compensation and Transparency</h2>
            <p>
              Our Service is free of charge to you. However, we receive financial compensation from Insurance Partners, Service Providers, and other marketers in
              exchange for connecting you with them, sharing your information with them, and/or marketing their products and services to you. This compensation allows
              us to offer our Services at no cost to you and supports our business operations. The compensation we receive may influence which insurers or services you
              are connected with, and the visibility of ads. You are more likely to be connected with the highest bidder(s) or see ads for those who offer the highest
              compensation.
            </p>
          </section>

          <section className="legal-section">
            <h2>How Service Works</h2>
            <p>
              To use our Service, you must complete a questionnaire about certain personal and vehicle details on our Site (“Request Form”). You agree to provide only
              true, accurate, and complete information and that you will not misrepresent your identity, impersonate any third party, or enter information on behalf
              of any third party. We are not responsible for verifying the accuracy of the information you provide.
            </p>
            <p>
              Once you submit your Request Form, we will share your information with one or more Insurance Partners, Service Providers, and other marketers. Insurance
              Partners may review your information to assess whether to respond to your insurance inquiry by providing a quote, or to help find an insurer willing to
              offer you coverage. This may include verifying your information and potentially reviewing your driving history, claim history, or other relevant data. By
              submitting a Request Form, you authorize Insurance Partners to obtain, review, and verify your information to determine whether to respond to your
              insurance inquiry.
            </p>
            <p>
              If an insurer expresses interest in your request, we will connect you with such an insurer by either providing them your contact information you
              provided via the form, opening a new web page, or redirecting you to the insurer’s site. At this point, our involvement in the insurance inquiry ends,
              and your interactions with the insurer are governed solely by the agreements, terms, and policies of that insurer. It is your responsibility to review
              them before entering into any agreement for coverage.
            </p>
            <p>
              If no insurers are found for your request, we may present you with marketing for other products and services offered by third-party Service Providers.
              You are under no obligation to accept or respond to any offers or services solicitations.
            </p>
          </section>

          <section className="legal-section">
            <h2>Service Disclaimer</h2>
            <h3>Not an Insurer</h3>
            <p>
              We are not an insurance company, broker, agent, or representative of any such entity. We do not underwrite policies, make coverage determinations, or
              issue insurance. We neither offer nor solicit to sell insurance directly. Our Site operates as an independent platform, with the primary purpose of
              connecting you to insurers who may offer coverage.
            </p>
            <h3>Important Note</h3>
            <p>
              Insurers participating in our program offer various types of auto insurance coverage, but not all insurers offer every type of policy or the most
              comprehensive coverage. We cannot guarantee that any insurer will offer you coverage or approve your request. Coverage approval depends on the insurer’s
              criteria, including your driving history, location, and other relevant factors. We do not make any representations or guarantees about the terms, rates,
              or conditions of insurance policies offered by insurers you may connect with through our Site. Rates and terms vary by insurer and are outside of our
              control. We do not validate or investigate the licensing, certification, or other requirements of any insurers. You acknowledge that it is your
              responsibility to investigate any insurer or insurance provider before engaging with them.
            </p>
            <h3>Service Availability</h3>
            <p>
              Our Service is not available in all states. Not all insurers within our network operate in all U.S. states. Residents of some states may not be eligible
              for certain insurance products due to state-specific regulations. You are responsible for your decisions. While we offer a platform to help you find
              insurance options, we don’t take responsibility for the choices or actions you make based on the information we provide.
            </p>
            <h3>Key Points To Consider</h3>
            <p>
              Carefully examine all terms and conditions of any insurance offer. Compare multiple options before making a decision. Consult licensed insurance agents
              or professionals for personalized advice tailored to your situation. The information we provide is intended for general knowledge and isn’t a
              replacement for professional insurance advice. We don’t take responsibility for any losses, costs, damages, or claims that may result from your use of
              any insurer’s or service provider’s services, including any fees they charge. You agree that you’re relying on your own judgment and any advice you
              receive when choosing insurance products or services.
            </p>
          </section>

          <section className="legal-section">
            <h2>Electronic Consent (“E-Consent”)</h2>
            <p>
              We and our Insurance Partners require your consent to conduct transactions electronically, including using electronic signatures and receiving
              electronic communications, to facilitate your online insurance request and enable the provision of insurance quotes and policies. By providing your
              information and submitting a request to be connected with insurers via our Service, you consent to conduct transactions and sign electronic documents,
              including this Agreement, using electronic signatures, as well as receive disclosures, records, and other communications electronically in accordance
              with our E-Consent Terms and Conditions. You agree that all agreements, notices, disclosures, and other communications that we or insurers provide to
              you electronically satisfy any legal requirement that such communications be in writing.
            </p>
          </section>

          <section className="legal-section">
            <h2>Consent for Communications</h2>
            <p>
              By providing your information and requesting our services, you establish a business relationship with us. This allows us to contact you about our
              Service. We may also ask for your consent to receive marketing communications via email, text messages, and phone calls from us, our Insurance Partners,
              and other Service Providers. You have the right to withdraw your consent to receive marketing communications at any time, without impacting your ability
              to connect with an insurer or obtain coverage or other advertised services. To stop receiving marketing communications, click the unsubscribe link or
              follow the instructions provided in the marketing communications.
            </p>
          </section>

          <section className="legal-section">
            <h2>Intellectual Property</h2>
            <p>
              This Site and the Content available on the Site are our property or the property of our affiliates and licensors, and are protected by copyright,
              trademark and other intellectual property rights. Subject to the Terms, you are granted a non-exclusive non-transferable license to use the Site solely
              for your personal, non-commercial use. You may not use the Site or the content available on the Site in a manner that infringes on our rights or that
              has not been authorized by us. Unless explicitly authorized in these Terms or by the owner of the content, you may not modify, copy, reproduce,
              republish, upload, post, transmit, translate, sell, create derivative works, exploit, perform, display or distribute in any manner or medium (including
              by e-mail or other electronic means) any material from the Site. You may, however, download or print one copy of individual pages of the Site for your
              personal, non-commercial use, provided that you keep intact all copyright and other proprietary notices.
            </p>
          </section>

          <section className="legal-section">
            <h2>Copyright Complaints</h2>
            <p>If you believe your work has been copied in a way that constitutes copyright infringement, please provide our copyright agent the written information below:</p>
            <ul>
              <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest;</li>
              <li>A description where the material that you claim is infringing is located on the Site;</li>
              <li>A description of the copyrighted work that you claim has been infringed upon;</li>
              <li>Your address, telephone number, and email address;</li>
              <li>
                A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or
                authorized to act on the copyright owner’s behalf;
              </li>
              <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
            </ul>
            <p>
              Vision Media Group’s Copyright Agent for notice of claims of copyright infringement can be reached at:{' '}
              <a href="mailto:privacy@smartautoinsider.com">privacy@smartautoinsider.com</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>Your Comments, Reviews, and Other Content Posted</h2>
            <p>
              You may have the opportunity to post comments, write reviews, or provide other content on this Site (“Posted Content”). If you choose to provide Posted
              Content on the Site, you represent that you are the owner of the content, or that you have the express authorization of the owner to post or submit
              that content. When you submit or post any content, you grant us and anyone we authorize, a royalty-free, non-exclusive, fully sub-licensable,
              perpetual, irrevocable, unrestricted, worldwide license to use, display, copy, modify, transmit, cache, store, archive, index, categorize, comment on,
              tag, sell, exploit, create derivative works from, incorporate into other works, distribute, and/or digitally perform or publicly perform or display such
              Posted Content, in whole or in part, in any manner or medium, now known or hereafter developed, for any purpose. We and our partners may retain any
              revenue generated from advertising, promotional campaigns, content syndication and distribution arrangements that include or feature any of the Posted
              Content you submit.
            </p>
            <p>
              We expressly prohibit the posting of any comments, reviews or other content that is illegal, threatening, defamatory, obscene, invasive of privacy,
              infringing of intellectual property rights, or otherwise injurious to third parties or objectionable; or that contains software viruses, commercial
              solicitation, political campaigning, mass mailings, chain letters, or any form of “spam.” You may not use a false e-mail address, impersonate any person
              or entity, or otherwise mislead as to the origin of a comment or other content. We reserve the right (but not the obligation) to remove or edit such
              content, but do not regularly review posted content. We claim no responsibility and assume no liability for any Posted Content uploaded by you or any
              third party to the Site.
            </p>
          </section>

          <section className="legal-section">
            <h2>Use Restrictions And Registration</h2>
            <p>
              You may not use or register with the Site if you are under eighteen (18) years of age. Certain services offered on or through the Site may require you
              to be eighteen (18) years old. You agree that the information that you provide to us upon registration, and at all other times, will be true, accurate,
              current and complete. Registration is limited to one account per user; you are solely responsible for keeping your password secure and for any
              activities or actions taken under your password. Notify Vision Media Group immediately of any unauthorized use of your password. This Site is
              administered in the United States and intended for U.S. users; any use outside of the U.S. is at your own risk and you are responsible for compliance
              with any local laws applicable to your use of the Site or access to the Services.
            </p>
            <ul>
              <li>Providing false or misleading information, including impersonating another individual or falsely claiming employment with an organization.</li>
              <li>Submitting applications on behalf of another individual.</li>
              <li>
                Attempting to circumvent security measures, including unauthorized access to accounts, testing system vulnerabilities, or breaching security protocols
                to access restricted information.
              </li>
              <li>
                Copying or stealing proprietary materials (designs, media, graphics, code, and products), except permitted documents such as this Agreement, Privacy
                Policy, or related documentation.
              </li>
              <li>
                Utilizing computer programs to collect information from our site, including email addresses or phone numbers for use on our site or other platforms.
              </li>
              <li>
                Interfering with site functionality or disrupting other users, including transmitting viruses, overloading the system, sending spam, or other
                disruptive behaviors.
              </li>
              <li>Utilizing our Site or Services for unsolicited email communications, including promotional emails or advertisements.</li>
              <li>Tampering with email headers or other transmitted information via our Site or Services.</li>
              <li>Attempting to modify, reverse-engineer, decompile, disassemble, or decipher any source code used in the Site or Services.</li>
            </ul>
            <p>Engaging in any of these activities may result in suspension of Site and Service access, account termination, and potential legal action.</p>
          </section>

          <section className="legal-section">
            <h2>Third-Party Content and Websites</h2>
            <p>
              Our platform may contain links to external websites, including those of Partners and Service Providers. Your use of any external websites linked from
              our platform is entirely at your own risk. We do not endorse, control, monitor, or assume any responsibility for the content, practices, or services
              offered by these third-party websites. Review their terms and privacy policies before using their services.
            </p>
          </section>

          <section className="legal-section">
            <h2>Errors and Delays</h2>
            <p>
              You agree that Vision Media Group is not responsible for any errors or delays in responding to a request or referral form caused by, including but not
              limited to, an incorrect email address or other information provided by you or other technical problems beyond our reasonable control.
            </p>
          </section>

          <section className="legal-section">
            <h2>Disclaimer Of Warranties And Limitation Of Liability</h2>
            <p>
              THIS SITE IS PROVIDED BY US ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTY OF ANY KIND. WE MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED, AS TO THE OPERATION OF THIS SITE OR THE INFORMATION, CONTENT, MATERIALS, OR PRODUCTS INCLUDED ON THIS SITE. WE DO NOT WARRANT THAT
              THE WEBSITE, CONTENT OR SERVICES WILL PROVIDE SPECIFIC RESULTS. YOU EXPRESSLY AGREE THAT YOUR USE OF THIS SITE IS AT YOUR SOLE RISK. TO THE FULL EXTENT
              PERMISSIBLE BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, WHETHER STATUTORY, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THIS SITE, ITS SERVERS, OR E-MAIL SENT FROM US ARE
              TIMELY, SECURE, ERROR-FREE, FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, UNINTERRUPTED OR THAT THEY WILL MEET YOUR REQUIREMENTS. WE WILL NOT BE LIABLE
              FOR ANY DAMAGES OF ANY KIND ARISING FROM THE USE OF THIS SITE, INCLUDING, BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, AND CONSEQUENTIAL
              DAMAGES. OUR MAXIMUM LIABILITY TO YOU UNDER ALL CIRCUMSTANCES SHALL NOT EXCEED $100.00. CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED
              WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS, EXCLUSIONS, OR
              LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MIGHT HAVE ADDITIONAL RIGHTS.
            </p>
            <p>
              THE INCLUSION OR OFFERING OF ANY PRODUCTS OR SERVICES ON THE SITE DOES NOT CONSTITUTE ANY ENDORSEMENT OR RECOMMENDATION OF SUCH PRODUCTS OR SERVICES BY
              US. ALL SUCH INFORMATION, PRODUCTS AND SERVICES ARE PROVIDED “AS IS” WITHOUT WARRANTY OF ANY KIND.
            </p>
          </section>

          <section className="legal-section">
            <h2>Miscellaneous Terms</h2>
            <p>
              This Agreement (including all referenced or incorporated policies, agreements and other provisions) constitutes the entire agreement between you and
              Vision Media Group and supersedes all prior or contemporaneous oral or written agreements or other communications between the parties with respect to
              the subject matter hereof. If a conflict between the language of this Terms of Use Agreement and the language of any terms incorporated by reference,
              the latter incorporated terms shall control.
            </p>
            <p>
              You acknowledge and agree that, in entering into this Agreement, you are not relying on any representation, warranty, statement or promise, express or
              implied, not explicitly set forth in this Agreement, and you hereby waive any claimed reliance on same. If any provision of this Agreement shall be
              found to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary to render it enforceable and to reflect the
              intent of the parties; the remainder of the Agreement shall remain in full force and effect.
            </p>
          </section>

          <section className="legal-section">
            <h2>Terms Applicable to Insurance Request Services</h2>
            <p>
              Vision Media Group is not a licensed insurance agency or broker and does not provide insurance quotes in accordance with RCW 48.17 or similar state
              statutes. The information Vision Media Group provides is not intended to take the place of professional advice from a licensed insurance agent, nor
              does it evaluate insurance providers or their policies. Vision Media Group recommends that all consumers consult with a licensed insurance agent before
              purchasing any insurance policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>Indemnity</h2>
            <p>
              You agree to indemnify and hold us, our parents, subsidiaries, affiliates, officers, directors, sub-licensees, employees, successors and assigns
              harmless, from and against any claims, liabilities, costs and expenses, including costs and attorneys’ fees, arising out of or related to (i) your
              access to the Site, (ii) your use of the services, (iii) your violation of these Terms or any applicable laws, rules or regulations, (iv) your
              infringement (or anyone using your account’s infringement) of any intellectual property or other right of any person or entity, (v) any content you
              post on this Site, and (vi) any products or services purchased by you in connection with this Site and/or the websites of our third-party partners,
              vendors and/or service providers. We reserve the right to participate in any defense you provide, at our own expense, but are not obligated to do so.
              You may not settle any claim without our prior written consent.
            </p>
          </section>

          <section className="legal-section">
            <h2>Termination</h2>
            <p>
              While you use the Site, you avail yourself to the services provided by us and these Terms will remain in full force and effect. We may cancel or
              terminate your right to use the Site, or any part of the Site, at any time without notice. Upon such cancellation or termination, you will no longer be
              authorized to access the affected portion(s) of the Site. The restrictions on use of materials, and the disclaimers and limitations of liability set
              forth in these Terms, shall survive any termination.
            </p>
          </section>

          <section className="legal-section">
            <h2>Choice Of Law, Disputes, And Jurisdiction</h2>
            <p>
              This Agreement will be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of
              conflicts of laws. Any matter and/or dispute relating in any way to your visit to or interaction with the Site, including compliance with these Terms,
              shall be submitted to binding confidential arbitration in California, California as provided in the Section titled “Arbitration” below. Notwithstanding
              the foregoing, to the extent you have in any manner violated or threatened to violate our intellectual property rights, we may seek injunctive or other
              appropriate relief in the state courts of the State of California or the United States District Court for the Southern District of California, and you
              consent to exclusive personal jurisdiction and venue in such courts.
            </p>
            <p>ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER IT ACCRUES, OR IT IS PERMANENTLY BARRED.</p>
            <p>
              Any dispute resolution proceedings relating to these Terms or the Site will be conducted only on an individual basis and not as a class, consolidated,
              joined or representative action. You agree that Vision Media Group’s agreement to arbitrate claims constitutes consideration for such waiver.
            </p>
            <p>
              Notwithstanding Vision Media Group’s right to modify these Terms, any modification to the dispute and/or arbitration requirements shall not apply to
              claims arising prior to the date of such modification.
            </p>
          </section>

          <section className="legal-section">
            <h2>Arbitration</h2>
            <h3>Mandatory Agreement to Arbitrate on an Individual Basis</h3>
            <p>
              PLEASE READ THIS SECTION CAREFULLY – THIS ARBITRATION AGREEMENT MAY AFFECT YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT AND TO
              HAVE A JURY HEAR YOUR CLAIMS. IT CONTAINS A WAIVER OF ANY RIGHT TO PROCEED IN A CLASS, COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE ACTION.
            </p>
            <p>
              You and we agree to resolve any and all disputes or claims between you and us (including affiliates, officers, directors, employees, and agents),
              relating in any way to any aspect of our relationship or your use of or access to our Site or services (“Dispute”), first through good-faith
              negotiations. If we don’t resolve the Dispute within 60 days, it shall be resolved exclusively through final and binding arbitration.
            </p>
            <ul>
              <li>
                <strong>Rules & Forum:</strong> A single arbitrator under the then-current Commercial Arbitration Rules of the American Arbitration Association
                (AAA) (including the Consumer Arbitration Rules, as applicable). See <a href="https://www.adr.org/">www.adr.org</a>.
              </li>
              <li><strong>Governing Law:</strong> The Federal Arbitration Act governs interpretation and enforcement; the arbitrator decides arbitrability.</li>
              <li>
                <strong>Class Waiver:</strong> Disputes may be brought only on an individual basis. No class actions, consolidated claims, private attorney general,
                or representative proceedings.
              </li>
              <li><strong>Severability:</strong> If the class waiver is unenforceable, it is null and void solely as to that Dispute.</li>
              <li><strong>Survival:</strong> This Arbitration Agreement survives termination of your relationship with us.</li>
            </ul>
            <p>
              To the extent permitted under applicable law, all aspects of the arbitration, and any ruling or award, will be strictly confidential. Unless otherwise
              agreed, if arbitration is unavailable or unenforceable, you agree any Dispute shall be resolved exclusively by a state or federal court located in CA.
            </p>
          </section>

          <section className="legal-section">
            <h2>Miscellaneous</h2>
            <p>
              This Agreement together with all Disclosures, E-Consent and any consent/authorization given on our Site constitutes the entire agreement between you and
              us concerning your use of the Site and Services. If any part of this Agreement is held invalid or unenforceable, that part will be construed to reflect
              the parties’ original intent, and the remaining portions will remain in full force and effect. You may not assign this Agreement without our prior
              written consent. The headings are for convenience only and do not affect interpretation.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact Information</h2>
            <p>
              Please send us an email at <a href="mailto:privacy@smartautoinsider.com">privacy@smartautoinsider.com</a> or write to: Vision Media Group, 1041 N Dupont Hwy #1575, Dover, DE 19901 if you
              have any questions, comments, or concerns relating to the Site, these Terms, or our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage; 