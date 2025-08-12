# NerovaDatePicker - Simple Date Picker Component

A lightweight, customizable calendar picker that works with any project using a single script tag.

## Features

- 🚀 **Single script import** - Just one line to get started
- 🎨 **Fully customizable** - Colors and themes via CSS variables
- ⚙️ **Configurable constraints** - Date ranges, disabled dates, business days only
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🔧 **Auto-initialization** - Works with dynamically added inputs
- 💾 **No dependencies** - Pure vanilla JavaScript
- 🛡️ **Security optimized** - XSS protection and input validation

## Quick Start

### 1. Add the Script

```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaDatePicker@main/calendar.js"></script>
```

### 2. Use on Any Input

```html
<input data-calendar placeholder="Select date">
<input data-calendar data-auto-default="true" placeholder="Auto-set to today">
<input data-calendar data-business-days-only="true" placeholder="Weekdays only">
```

That's it! The calendar will automatically initialize on all inputs with the `data-calendar` attribute.

## Examples

### Basic Usage
```html
<input data-calendar data-auto-default="true">
```

### Business Days Only
```html
<input data-calendar data-business-days-only="true">
```

### Date Range Booking
```html
<input data-calendar id="start-date">
<input data-calendar data-min-offset="start-date:1" data-max-offset="start-date:14" id="end-date">
```

### Custom Styling
```css
:root {
    --calendar-selected: #e74c3c;
    --calendar-bg: #2d3748;
    --calendar-text: #e2e8f0;
}
```

## Full Documentation

See [USAGE-GUIDE.md](USAGE-GUIDE.md) for complete documentation with all features, examples, and customization options.

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Mobile browsers

## License

MIT License - free for any use.