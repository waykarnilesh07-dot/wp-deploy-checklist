// ============================================================
//  CHECKLIST DATA — edit items here to customise
// ============================================================

const BEFORE_DATA = [
  {
    id: 'general', label: 'General', icon: '🌐', color: '#4f7cff',
    items: [
      'Website loads without errors on staging',
      'All pages created as per sitemap',
      'No dummy content (Lorem Ipsum removed)',
      'Favicon added and visible',
      'Logo properly aligned and high quality',
      'Custom 404 page created'
    ]
  },
  {
    id: 'design', label: 'Design & UI', icon: '🎨', color: '#b467ff',
    items: [
      'Fully responsive (Mobile / Tablet / Desktop)',
      'Cross-browser compatibility tested',
      'Proper spacing, alignment, consistency',
      'Brand fonts and colors applied',
      'Animations and hover effects working'
    ]
  },
  {
    id: 'functionality', label: 'Functionality', icon: '⚙️', color: '#2ecc8a',
    items: [
      'All forms working correctly',
      'Form validation implemented',
      'Email notifications working',
      'Thank you page / success message working',
      'Search functionality working (if applicable)'
    ]
  },
  {
    id: 'ecommerce', label: 'E-Commerce (if applicable)', icon: '🛒', color: '#f5a623',
    items: [
      'Products configured correctly',
      'Pricing, SKU, stock setup',
      'Payment gateway tested (test mode)',
      'Cart and checkout flow working',
      'Coupons / discounts working'
    ]
  },
  {
    id: 'seo', label: 'SEO', icon: '🔍', color: '#4f7cff',
    items: [
      'Meta titles and descriptions added',
      'Proper heading structure (H1, H2, etc.)',
      'Image ALT tags added',
      'SEO-friendly URLs configured',
      'XML sitemap generated',
      'Robots.txt configured'
    ]
  },
  {
    id: 'performance', label: 'Performance', icon: '⚡', color: '#f5a623',
    items: [
      'Page speed optimized',
      'Images compressed (WebP preferred)',
      'Cache plugin configured',
      'Unused plugins removed'
    ]
  },
  {
    id: 'security', label: 'Security', icon: '🔒', color: '#e85454',
    items: [
      'Security plugin installed',
      'Strong passwords used',
      'Login protection enabled',
      'reCAPTCHA enabled'
    ]
  },
  {
    id: 'backup', label: 'Backup', icon: '💾', color: '#2ecc8a',
    items: [
      'Backup plugin configured',
      'Full backup taken before going live'
    ]
  },
  {
    id: 'tracking', label: 'Tracking', icon: '📊', color: '#b467ff',
    items: [
      'Google Analytics added',
      'Google Tag Manager added (if required)',
      'Facebook Pixel added (if required)'
    ]
  },
  {
    id: 'legal', label: 'Legal', icon: '📜', color: '#f5a623',
    items: [
      'Privacy Policy page added',
      'Terms & Conditions page added',
      'Cookie notice enabled'
    ]
  },
  {
    id: 'finalqa', label: 'Final QA', icon: '✅', color: '#2ecc8a',
    items: [
      'No console errors',
      'No broken links',
      'All images loading correctly',
      'Admin login working'
    ]
  }
];

const AFTER_DATA = [
  {
    id: 'domain', label: 'Domain & Hosting', icon: '🌐', color: '#4f7cff',
    items: [
      'Domain correctly pointed',
      'DNS propagation completed',
      'Website accessible globally'
    ]
  },
  {
    id: 'ssl', label: 'SSL & Security', icon: '🔒', color: '#e85454',
    items: [
      'SSL installed (HTTPS working)',
      'HTTP redirected to HTTPS',
      'No mixed content errors'
    ]
  },
  {
    id: 'livetest', label: 'Live Website Test', icon: '🖥️', color: '#2ecc8a',
    items: [
      'Homepage working',
      'All pages accessible',
      'No broken links after migration'
    ]
  },
  {
    id: 'formsemail', label: 'Forms & Email', icon: '✉️', color: '#4f7cff',
    items: [
      'Forms working on live server',
      'Emails received correctly',
      'SMTP configured'
    ]
  },
  {
    id: 'tracking2', label: 'Tracking & Analytics', icon: '📊', color: '#b467ff',
    items: [
      'Google Analytics tracking working',
      'Google Tag Manager active',
      'Google Search Console connected',
      'Sitemap submitted'
    ]
  },
  {
    id: 'seopost', label: 'SEO Post-Live', icon: '🔍', color: '#4f7cff',
    items: [
      'Website indexed (site:domain check)',
      'Robots.txt updated for live',
      'Canonical URLs correct'
    ]
  },
  {
    id: 'perf2', label: 'Performance', icon: '⚡', color: '#f5a623',
    items: [
      'Live speed tested',
      'CDN configured (if applicable)',
      'Caching working'
    ]
  },
  {
    id: 'ecom2', label: 'E-Commerce (if applicable)', icon: '🛒', color: '#f5a623',
    items: [
      'Payment gateway in LIVE mode',
      'Real transaction tested',
      'Order emails working',
      'Shipping settings verified'
    ]
  },
  {
    id: 'backsec', label: 'Backup & Security', icon: '🛡️', color: '#e85454',
    items: [
      'Backup automation enabled',
      'Firewall / security active'
    ]
  },
  {
    id: 'handover', label: 'Client Handover', icon: '🤝', color: '#2ecc8a',
    items: [
      'Credentials shared',
      'Admin walkthrough completed',
      'Documentation provided'
    ]
  },
  {
    id: 'monitoring', label: 'Monitoring', icon: '👁️', color: '#b467ff',
    items: [
      'Website monitored for 24–48 hours',
      'Error logs checked',
      'Downtime monitoring enabled'
    ]
  },
  {
    id: 'approval', label: 'Approval', icon: '🎯', color: '#2ecc8a',
    items: [
      'Final client approval received'
    ]
  }
];
