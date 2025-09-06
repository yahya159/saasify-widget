# Embedding the Pricing Widget

This guide explains how to generate, export, and embed pricing widgets created with the Pricing Widget Builder into your website or application.

## Quick Start

1. **Build your widget** using the Pricing Widget Builder
2. **Export the HTML** using the export modal
3. **Copy and paste** the generated HTML into your website
4. **Optionally add CSS** for enhanced styling

## Generating & Copying HTML/JSON

### From the Builder Interface

1. **Create or select a widget** in the Pricing Widget Builder
2. **Click the "Export" button** in the top-right corner
3. **Choose your export format**:
   - **HTML**: Ready-to-use semantic HTML
   - **JSON**: Complete widget configuration for re-importing

### HTML Export Features

The exported HTML is:
- ✅ **Framework-agnostic** - No Angular, React, or Vue dependencies
- ✅ **Semantic** - Uses proper HTML5 elements (`<section>`, `<article>`, `<header>`, `<footer>`)
- ✅ **Accessible** - Includes ARIA labels and roles for screen readers
- ✅ **Responsive** - Uses CSS Grid for mobile-friendly layouts
- ✅ **Self-contained** - Minimal inline styles, no external dependencies

### JSON Export Features

The JSON export includes:
- Complete widget configuration
- All blocks and their properties
- Column layouts and styling
- Attached plan data
- Can be re-imported into the builder

## Optional Minimal CSS

The exported HTML works without any additional CSS, but you can enhance it with custom styling:

### Basic Enhancement CSS

```css
/* Optional: Enhanced styling for better visual appeal */
.pricing-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

.pricing-card {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 24px;
    background: #fff;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pricing-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.pricing-card--highlighted {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    transform: scale(1.05);
}

.pricing-button {
    width: 100%;
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.pricing-button:hover {
    background: #0056b3;
}
```

### Dark Mode Support

```css
/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .pricing-widget {
        color: #e0e0e0;
    }
    
    .pricing-card {
        background: #2d2d2d;
        border-color: #404040;
        color: #e0e0e0;
    }
    
    .pricing-card__title {
        color: #ffffff;
    }
    
    .pricing-button {
        background: #4a9eff;
    }
    
    .pricing-button:hover {
        background: #3a8ce6;
    }
}
```

### Custom Brand Colors

```css
/* Customize colors to match your brand */
:root {
    --primary-color: #your-brand-color;
    --primary-hover: #your-brand-hover;
    --text-color: #your-text-color;
    --border-color: #your-border-color;
}

.pricing-card--highlighted {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1);
}

.pricing-button {
    background: var(--primary-color);
}

.pricing-button:hover {
    background: var(--primary-hover);
}
```

## Accessibility Notes

The exported widgets are built with accessibility in mind:

### Screen Reader Support
- **Semantic HTML**: Uses proper heading hierarchy (`<h2>`, `<h3>`, `<h4>`)
- **ARIA labels**: All interactive elements have descriptive labels
- **Role attributes**: Proper roles for regions, lists, and list items
- **Live regions**: Announcements for dynamic content changes

### Keyboard Navigation
- **Focus management**: All interactive elements are keyboard accessible
- **Tab order**: Logical tab sequence through the widget
- **Focus indicators**: Clear visual focus states

### Color Contrast
- **WCAG AA compliant**: All text meets 4.5:1 contrast ratio minimum
- **High contrast mode**: Respects system high contrast preferences
- **Color independence**: Information is not conveyed by color alone

### Testing Accessibility

1. **Screen reader testing**: Use NVDA, JAWS, or VoiceOver
2. **Keyboard-only navigation**: Tab through all interactive elements
3. **Color contrast tools**: Use WebAIM's contrast checker
4. **Automated testing**: Run axe-core or similar tools

## Currency Switching Note

### Current Implementation
- Widgets export with the currency set during creation
- Currency is embedded in the HTML (e.g., `$99/month` or `MAD 99/month`)
- No dynamic currency switching in exported HTML

### For Dynamic Currency Support

If you need dynamic currency switching in your embedded widget:

1. **Use the JSON export** instead of HTML
2. **Implement currency conversion** in your application
3. **Update price display** using JavaScript

Example JavaScript implementation:

```javascript
// Currency conversion rates (update as needed)
const exchangeRates = {
    'USD': 1,
    'EUR': 0.85,
    'MAD': 10
};

function updateCurrency(selectedCurrency) {
    const priceElements = document.querySelectorAll('.pricing-card__amount');
    const periodElements = document.querySelectorAll('.pricing-card__period');
    
    priceElements.forEach((element, index) => {
        const originalPrice = parseFloat(element.dataset.originalPrice);
        const originalCurrency = element.dataset.originalCurrency;
        
        const convertedPrice = convertCurrency(originalPrice, originalCurrency, selectedCurrency);
        const symbol = getCurrencySymbol(selectedCurrency);
        
        element.textContent = `${symbol}${convertedPrice}`;
    });
}

function convertCurrency(amount, from, to) {
    const usdAmount = amount / exchangeRates[from];
    return Math.round(usdAmount * exchangeRates[to]);
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'MAD': 'MAD '
    };
    return symbols[currency] || currency;
}
```

## Integration Examples

### React Component

```jsx
import React, { useEffect, useRef } from 'react';

const PricingWidget = ({ htmlContent }) => {
    const widgetRef = useRef(null);
    
    useEffect(() => {
        if (widgetRef.current) {
            widgetRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent]);
    
    return (
        <div 
            ref={widgetRef}
            className="pricing-widget-container"
        />
    );
};
```

### Vue Component

```vue
<template>
    <div 
        ref="widgetContainer"
        class="pricing-widget-container"
        v-html="htmlContent"
    />
</template>

<script>
export default {
    props: {
        htmlContent: String
    },
    mounted() {
        // Add any custom event listeners here
        this.$refs.widgetContainer.addEventListener('click', this.handleClick);
    },
    methods: {
        handleClick(event) {
            if (event.target.classList.contains('pricing-button')) {
                // Handle button clicks
                console.log('Pricing button clicked');
            }
        }
    }
};
</script>
```

### WordPress Shortcode

```php
function pricing_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'widget_id' => '',
        'html_content' => ''
    ), $atts);
    
    if (empty($atts['html_content'])) {
        return '<p>No widget content provided.</p>';
    }
    
    return '<div class="pricing-widget-wrapper">' . $atts['html_content'] . '</div>';
}
add_shortcode('pricing_widget', 'pricing_widget_shortcode');
```

## Troubleshooting

### Common Issues

1. **Styling conflicts**: Use CSS specificity or `!important` to override conflicting styles
2. **JavaScript errors**: Ensure no conflicting event handlers
3. **Mobile responsiveness**: Test on various screen sizes
4. **Print styles**: Add `@media print` rules if needed

### Browser Support

- ✅ **Modern browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- ✅ **Mobile browsers**: iOS Safari, Chrome Mobile
- ⚠️ **IE11**: Limited support (use polyfills for CSS Grid)

### Performance Considerations

- **Minimal CSS**: Only include necessary styles
- **Optimize images**: Compress any background images
- **Lazy loading**: Consider lazy loading for below-the-fold widgets
- **CDN**: Serve static assets from a CDN for better performance

## Support

For questions or issues with embedding pricing widgets:

1. **Check the examples** in `docs/exports/` directory
2. **Review the accessibility guide** above
3. **Test in multiple browsers** and devices
4. **Validate HTML** using W3C validator

## Examples

Ready-to-use examples are available in the `docs/exports/` directory:

- `three-col-classic.html` - Three-column pricing layout
- `two-col-spotlight.html` - Two-column layout with highlighted plan

These examples can be used as starting points for your own implementations.
