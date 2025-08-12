# Calendar Complete Usage Guide

A comprehensive, security-optimized calendar picker component that works anywhere with a single script tag.

## 🚀 Quick Start

**1. Add the Script:**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaCalendar@main/calendar.js"></script>
```

**2. Add to Input Fields:**
```html
<input data-calendar placeholder="Select date">
```

That's it! The calendar picker automatically initializes on all inputs with the `data-calendar` attribute.

---

## 📋 All Features & Attributes

### Basic Configuration

| Attribute | Purpose | Example | Default |
|-----------|---------|---------|---------|
| `data-calendar` | **Required** - Enables calendar picker | `data-calendar` | - |

```html
<!-- Basic example -->
<input data-calendar placeholder="Select date">
```

### Auto-Default Date

| Attribute | Purpose | Example | Behavior |
|-----------|---------|---------|----------|
| `data-auto-default` | Auto-set to today's date | `data-auto-default="true"` | Sets to current date when page loads |
| `data-default-date` | Set specific default date | `data-default-date="12/25/2024"` | Shows this date when page loads |

```html
<!-- Auto-default examples -->
<input data-calendar data-auto-default="true">
<input data-calendar data-default-date="01/15/2024">
```

### Date Range Constraints

| Attribute | Purpose | Example | Behavior |
|-----------|---------|---------|----------|
| `data-min-date` | Earliest allowed date | `data-min-date="01/01/2024"` | Blocks dates before Jan 1, 2024 |
| `data-max-date` | Latest allowed date | `data-max-date="12/31/2024"` | Blocks dates after Dec 31, 2024 |
| `data-min-offset` | Minimum days from another date | `data-min-offset="start-date:7"` | Must be 7+ days after start date |
| `data-max-offset` | Maximum days from another date | `data-max-offset="start-date:30"` | Must be within 30 days of start date |

```html
<!-- Range constraint examples -->
<input data-calendar data-min-date="01/01/2024" data-max-date="12/31/2024">

<!-- Booking period example -->
<input data-calendar id="start-date">
<input data-calendar data-min-offset="start-date:1" data-max-offset="start-date:14" id="end-date">
```

### Disabled Dates & Days

| Attribute | Purpose | Example | Behavior |
|-----------|---------|---------|----------|
| `data-disabled-dates` | Block specific dates | `data-disabled-dates="12/25/2024,01/01/2025"` | Grays out Christmas & New Year |
| `data-disabled-days` | Block days of week | `data-disabled-days="0,6"` | Blocks Sundays (0) & Saturdays (6) |
| `data-business-days-only` | Only weekdays | `data-business-days-only="true"` | Blocks weekends automatically |

```html
<!-- Disabled examples -->
<input data-calendar data-disabled-dates="12/25/2024,12/26/2024">
<input data-calendar data-disabled-days="0,6">
<input data-calendar data-business-days-only="true">
```

**Day Numbers:** Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6

---

## 🎨 Styling & Themes

### Basic Color Customization

Override colors using CSS custom properties:

```css
:root {
    --calendar-selected: #e74c3c;         /* Selected date */
    --calendar-bg: white;                 /* Popup background */
    --calendar-text: #333;                /* Normal text */
    --calendar-today: #28a745;            /* Today's border */
    --calendar-hover: #f8f9fa;            /* Hover background */
    --calendar-disabled: #e9ecef;         /* Disabled background */
}
```

### Pre-Made Themes

**Dark Theme:**
```css
.dark-theme {
    --calendar-bg: #2d3748;
    --calendar-border: #4a5568;
    --calendar-text: #e2e8f0;
    --calendar-selected: #4299e1;
    --calendar-hover: #4a5568;
    --calendar-disabled: #718096;
    --calendar-disabled-text: #a0aec0;
    --calendar-today: #48bb78;
    --calendar-other-month: #718096;
    --calendar-shadow: rgba(0, 0, 0, 0.8);
    --calendar-header-bg: #4a5568;
    --calendar-header-text: #e2e8f0;
}
```

**Red Theme:**
```css
.red-theme {
    --calendar-selected: #e53e3e;
    --calendar-today: #c53030;
}
```

**Green Theme:**
```css
.green-theme {
    --calendar-selected: #38a169;
    --calendar-today: #2f855a;
}
```

### All Available CSS Variables

```css
:root {
    --calendar-bg: white;                 /* Popup background */
    --calendar-border: #ddd;              /* Border color */
    --calendar-text: #333;                /* Normal text color */
    --calendar-selected: #007bff;         /* Selected date color */
    --calendar-hover: #f8f9fa;            /* Hover background */
    --calendar-disabled: #e9ecef;         /* Disabled background */
    --calendar-disabled-text: #6c757d;    /* Disabled text */
    --calendar-today: #28a745;            /* Today's border */
    --calendar-other-month: #adb5bd;      /* Other month dates */
    --calendar-shadow: rgba(0,0,0,0.2);   /* Popup shadow */
    --calendar-header-bg: #f8f9fa;        /* Header background */
    --calendar-header-text: #495057;      /* Header text */
}
```

---

## 📱 Common Use Cases

### 1. Simple Date Selection
```html
<input data-calendar placeholder="Select date">
```

### 2. Business Days Only
```html
<input data-calendar data-business-days-only="true">
```

### 3. Auto-Default to Today
```html
<input data-calendar data-auto-default="true">
```

### 4. Date Range (This Year Only)
```html
<input data-calendar 
       data-min-date="01/01/2024" 
       data-max-date="12/31/2024">
```

### 5. Vacation Booking (7-30 day trips)
```html
<label>Start Date:</label>
<input data-calendar 
       data-auto-default="true"
       data-business-days-only="true"
       id="vacation-start">

<label>End Date:</label>
<input data-calendar 
       data-min-offset="vacation-start:7"
       data-max-offset="vacation-start:30"
       data-business-days-only="true"
       id="vacation-end">
```

### 6. Event Planning (Block Holidays)
```html
<input data-calendar 
       data-disabled-dates="12/25/2024,12/26/2024,01/01/2025"
       data-disabled-days="0"
       data-min-date="01/01/2024"
       data-max-date="12/31/2024">
```

### 7. Medical Appointments (Weekdays, Future Only)
```html
<input data-calendar 
       data-business-days-only="true"
       data-min-date="<!-- Today's date dynamically set -->">
```

### 8. Rental Period (Min 1 day, Max 2 weeks)
```html
<label>Pickup Date:</label>
<input data-calendar 
       data-auto-default="true"
       id="rental-start">

<label>Return Date:</label>
<input data-calendar 
       data-min-offset="rental-start:1"
       data-max-offset="rental-start:14"
       id="rental-end">
```

---

## 🗓️ Calendar Features

### Quick Month Selection
- **Click the month/year header** to open month picker
- **Select any month** from the grid view
- **Navigate years** with ‹ › buttons in month picker
- **No Today button** - streamlined interface

### Mobile Optimized
- **Touch-friendly** - 44px+ touch targets
- **Responsive design** - adapts to screen size
- **Visual feedback** - opacity changes on touch
- **Smart positioning** - stays within viewport

## 🔧 JavaScript Events & Methods

### Events
```javascript
// Listen for date selection
document.querySelector('[data-calendar]').addEventListener('change', function(e) {
    console.log('Selected date:', e.target.value); // "12/25/2024"
});

// Listen for input events (real-time)
document.querySelector('[data-calendar]').addEventListener('input', function(e) {
    console.log('Date changing:', e.target.value);
});
```

### Integration Examples
```javascript
// Google Calendar API Integration
const date = document.getElementById('event-date').value; // "12/25/2024"
const time = document.getElementById('event-time').value; // "2:30 PM"
const googleDateTime = new Date(date + ' ' + time).toISOString();

// Database Storage
const mysqlDateTime = date + ' ' + time; // "12/25/2024 2:30 PM"

// Custom API
fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
        date: date,
        time: time
    })
});
```

### Manual Initialization
```javascript
// Manual initialization (if needed)
const input = document.querySelector('#my-input');
const calendar = new Calendar(input);

// Destroy when needed
calendar.destroy();
```

### Date Validation Helper
```javascript
// Check if date range is valid
function validateDateRange() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
        alert('End date must be after start date');
        return false;
    }
    
    return true;
}

document.getElementById('submit-btn').addEventListener('click', validateDateRange);
```

### Dynamic Date Constraints
```javascript
// Set minimum date to today dynamically
function setMinDateToToday() {
    const today = new Date();
    const todayStr = (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
                     today.getDate().toString().padStart(2, '0') + '/' +
                     today.getFullYear();
    
    document.querySelector('[data-calendar]').dataset.minDate = todayStr;
}

setMinDateToToday();
```

---

## 📅 Date Formats

### Input Formats (Parsed)
- **MM/DD/YYYY**: `12/25/2024` (Recommended)
- **YYYY-MM-DD**: `2024-12-25` (ISO format)

### Output Format
- **MM/DD/YYYY**: `12/25/2024` (Always outputs this format)

### Data Attribute Formats
Use **MM/DD/YYYY** format in all data attributes:
```html
<input data-calendar 
       data-min-date="01/01/2024"
       data-max-date="12/31/2024"
       data-default-date="06/15/2024"
       data-disabled-dates="07/04/2024,12/25/2024">
```

---

## 🛡️ Security Features

- **XSS Protection**: All inputs sanitized and validated
- **DOM Validation**: Ensures safe element manipulation  
- **Date Validation**: Formats strictly validated
- **Range Validation**: Years (1900-2100), months/days validated
- **Attribute Sanitization**: All data attributes cleaned

---

## ⚡ Performance & Compatibility

- **File Size**: ~18KB minified
- **Dependencies**: None (vanilla JavaScript)
- **Browser Support**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: Fully responsive and touch-optimized with 44px+ touch targets
- **Framework Agnostic**: Works with React, Vue, Angular, vanilla HTML
- **API Compatible**: Works with Google Calendar, booking systems, databases

---

## 🚨 Important Notes

1. **IDs Must Be Unique**: When using offset constraints, ensure referenced input IDs are unique
2. **Date Format**: Component outputs MM/DD/YYYY format
3. **Offset Constraints**: Use `data-min-offset` and `data-max-offset` for date relationships
4. **Auto-Initialization**: Component automatically finds and initializes all `[data-calendar]` inputs
5. **Read-Only**: Input fields become read-only to prevent manual typing errors

---

## 🔄 Updates & Versioning

**Latest Version:**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaCalendar@main/calendar.js"></script>
```

**Specific Version (Recommended for Production):**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaCalendar@v1.0.0/calendar.js"></script>
```

**Cache Busting:**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaCalendar@main/calendar.js?v=1"></script>
```

---

## 📞 Support

- **GitHub**: [NerovaAutomation/nerovaCalendar](https://github.com/NerovaAutomation/nerovaCalendar)
- **Issues**: Report bugs or request features via GitHub Issues
- **License**: MIT License - free for any use

---

*This component is production-ready and battle-tested. Drop it into any project with zero configuration required.*