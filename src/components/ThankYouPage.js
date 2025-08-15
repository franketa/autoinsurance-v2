import React, { useEffect } from 'react';
import './ThankYouPage.css';

const ThankYouPage = ({ location = 'Vista, California', userName = '' }) => {
  // Trigger tracking pixels and postbacks when page loads
  useEffect(() => {
    // Fire conversion pixels and tracking here
    console.log('Thank you page loaded - triggering conversion tracking');
    
    // Fire any additional tracking pixels if needed
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'conversion_id',
        'value': 1.0,
        'currency': 'USD'
      });
    }
  }, []);

  const offers = [
    {
      id: 'carshield',
      recommended: true,
      logo: '/images/logos/carshield-logo.png',
      headline: 'Avoid Costly Repairs – Protect Your Car Today',
      copy: "Don't let unexpected breakdowns drain your wallet. With a reliable protection plan, you can save big on repairs and enjoy total peace of mind every time you hit the road. Get your free quote in minutes.",
      link: 'https://www.iqno4trk.com/JBL8QPS/5HCCZ8/',
      cta: 'Get Protected Now'
    },
    {
      id: 'ace-auto-loans',
      logo: '/images/logos/ace-logo.svg',
      headline: 'Get Approved for Your Next Car – All Credit Welcome',
      copy: 'Whether your credit is perfect or needs rebuilding, you could get approved for a new or used car loan in just minutes. Fast, easy, and no obligation—drive away sooner than you think.',
      link: 'https://www.greentrackr.com/6HZm0NuwRYhIcyXj3B3esG2MgN7WNhtA6fHUujYr4vwy90mDUZoOKGHTSzYvMQCyZceQuJj95dZBR4gtVebwnw~~/',
      cta: 'Start My Loan Request'
    },
    {
      id: 'ace-auto-refi',
      logo: '/images/logos/ace-logo.svg',
      headline: 'Lower Your Monthly Car Payment – Fast & Easy',
      copy: 'Refinancing your auto loan could put more money back in your pocket each month. Pre-qualify in minutes and see how much you could save without affecting your credit score.',
      link: 'https://www.greentrackr.com/6HZm0NuwRYhIcyXj3B3esKWdNW-lOjzCpwOKRw-z-FY-PTXfCvpbPCztP_axiazB3nvuctGQXANdfTns1VZmmw~~/',
      cta: 'Refinance My Car Loan'
    },
    {
      id: 'vehicle-protection-usa',
      logo: '/images/logos/vehicle-protection-usa-logo.png',
      headline: 'Keep Your Vehicle Covered – Plans for Every Budget',
      copy: "Your car isn't getting younger, protect it from expensive repairs with flexible coverage options that fit your needs and budget. Get started now and drive with confidence.",
      link: 'https://www.greentrackr.com/6HZm0NuwRYhIcyXj3B3esBp876dhE8aqmljksaCrw9K2xdbaJOszJfBP08ucMhak4uWSjtXD_RGvjQd12parpw~~/',
      cta: 'Get My Protection Plan'
    }
  ];

  return (
    <div className="thankyou-page">
      <div className="thankyou-container">
        <div className="thankyou-header">
          <h1 className="thankyou-title">
            We found great offers for you in <span className="location-highlight">{location}</span>
          </h1>
          <p className="thankyou-subtitle">
            Click on 2 or more offers below to find the best rates and maximize your savings!
          </p>
        </div>

        <div className="offers-container">
          {offers.map((offer, index) => (
            <div key={offer.id} className={`offer-card ${offer.recommended ? 'recommended' : ''}`}>
              {offer.recommended && (
                <div className="recommended-badge">
                  <span className="badge-icon">✓</span>
                  <span className="badge-text">Recommended for you</span>
                </div>
              )}
              
              <div className="offer-content">
                <div className="offer-logo">
                  <img 
                    src={offer.logo} 
                    alt={`${offer.id} logo`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'logo-placeholder';
                      placeholder.textContent = offer.headline.split(' ')[0];
                      e.target.parentElement.appendChild(placeholder);
                    }}
                  />
                </div>

                <h2 className="offer-headline">{offer.headline}</h2>
                
                <p className="offer-copy">{offer.copy}</p>

                <a 
                  href={offer.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="offer-cta-button"
                  onClick={() => {
                    // Track click event
                    console.log(`Clicked on ${offer.id} offer`);
                    if (window.gtag) {
                      window.gtag('event', 'click', {
                        'event_category': 'offer',
                        'event_label': offer.id
                      });
                    }
                  }}
                >
                  {offer.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="thankyou-footer">
          <p className="footer-note">
            * Savings amounts are based on information provided by you and actual savings will vary based on coverage selections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
