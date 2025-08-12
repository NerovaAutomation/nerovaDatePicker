(function() {
    'use strict';
    
    // Security: Prevent XSS and ensure safe DOM manipulation
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    function sanitizeAttribute(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>"'&]/g, '');
    }
    
    function validateElement(element) {
        return element && element.nodeType === Node.ELEMENT_NODE;
    }
    
    // Inject CSS styles
    const css = `
        :root {
            --calendar-bg: white;
            --calendar-border: #ddd;
            --calendar-text: #333;
            --calendar-selected: #007bff;
            --calendar-hover: #f8f9fa;
            --calendar-disabled: #e9ecef;
            --calendar-disabled-text: #6c757d;
            --calendar-today: #28a745;
            --calendar-other-month: #adb5bd;
            --calendar-shadow: rgba(0, 0, 0, 0.2);
            --calendar-header-bg: #f8f9fa;
            --calendar-header-text: #495057;
        }
        
        .calendar-popup {
            position: absolute;
            background-color: var(--calendar-bg);
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 20px var(--calendar-shadow);
            display: none;
            z-index: 10000;
            border: 1px solid var(--calendar-border);
            font-family: Arial, sans-serif;
            min-width: 280px;
            user-select: none;
        }
        
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 8px 12px;
            background-color: var(--calendar-header-bg);
            border-radius: 6px;
        }
        
        .calendar-nav-btn {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            color: var(--calendar-header-text);
            transition: background-color 0.2s ease;
        }
        
        .calendar-nav-btn:hover {
            background-color: var(--calendar-hover);
        }
        
        .calendar-nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .calendar-month-year {
            font-size: 16px;
            font-weight: bold;
            color: var(--calendar-header-text);
            margin: 0 15px;
            min-width: 140px;
            text-align: center;
        }
        
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            margin-bottom: 15px;
        }
        
        .calendar-weekday {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            padding: 8px 4px;
            color: var(--calendar-header-text);
            background-color: var(--calendar-header-bg);
            border-radius: 4px;
        }
        
        .calendar-day {
            text-align: center;
            padding: 8px 4px;
            cursor: pointer;
            font-size: 14px;
            border-radius: 4px;
            transition: all 0.2s ease;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--calendar-text);
        }
        
        .calendar-day:hover:not(.disabled):not(.other-month) {
            background-color: var(--calendar-hover);
        }
        
        .calendar-day.selected {
            background-color: var(--calendar-selected);
            color: white;
            font-weight: bold;
        }
        
        .calendar-day.today {
            border: 2px solid var(--calendar-today);
            font-weight: bold;
        }
        
        .calendar-day.other-month {
            color: var(--calendar-other-month);
            cursor: default;
        }
        
        .calendar-day.disabled {
            background-color: var(--calendar-disabled);
            color: var(--calendar-disabled-text);
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        .calendar-buttons {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        
        .calendar-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.2s ease;
        }
        
        .calendar-btn-cancel {
            background-color: #f5f5f5;
            color: #666;
        }
        
        .calendar-btn-today {
            background-color: var(--calendar-today);
            color: white;
            flex: 1;
        }
        
        .calendar-btn-ok {
            background-color: var(--calendar-selected);
            color: white;
        }
        
        .calendar-btn:hover {
            opacity: 0.8;
        }
        
    `;
    
    // Inject styles into head
    if (!document.getElementById('calendar-styles')) {
        const style = document.createElement('style');
        style.id = 'calendar-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    class Calendar {
        constructor(inputElement) {
            // Security: Validate input element
            if (!validateElement(inputElement) || inputElement.tagName !== 'INPUT') {
                throw new Error('Calendar requires a valid input element');
            }
            
            this.input = inputElement;
            this.selectedDate = null;
            this.viewDate = new Date();
            this.today = new Date();
            
            // Get configuration from data attributes with sanitization
            this.autoDefault = this.input.dataset.autoDefault === 'true';
            this.defaultDate = sanitizeAttribute(this.input.dataset.defaultDate || '');
            this.minDate = sanitizeAttribute(this.input.dataset.minDate || '');
            this.maxDate = sanitizeAttribute(this.input.dataset.maxDate || '');
            this.disabledDates = this.input.dataset.disabledDates ? 
                this.input.dataset.disabledDates.split(',').map(d => sanitizeAttribute(d.trim())).filter(d => d) : [];
            this.disabledDays = this.input.dataset.disabledDays ?
                this.input.dataset.disabledDays.split(',').map(d => parseInt(sanitizeAttribute(d.trim()))).filter(d => !isNaN(d)) : [];
            this.minOffset = sanitizeAttribute(this.input.dataset.minOffset || '');
            this.maxOffset = sanitizeAttribute(this.input.dataset.maxOffset || '');
            this.businessDaysOnly = this.input.dataset.businessDaysOnly === 'true';
            
            this.picker = null;
            this.monthYearElement = null;
            this.prevBtn = null;
            this.nextBtn = null;
            this.gridElement = null;
            this.cancelBtn = null;
            this.todayBtn = null;
            this.okBtn = null;
            
            this.monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            this.init();
        }
        
        init() {
            this.createPicker();
            this.setupEventListeners();
            this.setDefaultDate();
            this.render();
        }
        
        createPicker() {
            this.picker = document.createElement('div');
            this.picker.className = 'calendar-popup';
            
            // Find the closest parent that might have theme classes
            let themeParent = this.input.parentElement;
            while (themeParent && !this.hasThemeClass(themeParent)) {
                themeParent = themeParent.parentElement;
            }
            
            // If we found a theme parent, append to it instead of body
            const appendTarget = themeParent || document.body;
            
            this.picker.innerHTML = `
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="calendar-prev">‹</button>
                    <div class="calendar-month-year" id="calendar-month-year"></div>
                    <button class="calendar-nav-btn" id="calendar-next">›</button>
                </div>
                <div class="calendar-grid" id="calendar-grid"></div>
                <div class="calendar-buttons">
                    <button class="calendar-btn calendar-btn-cancel">Cancel</button>
                    <button class="calendar-btn calendar-btn-today">Today</button>
                    <button class="calendar-btn calendar-btn-ok">OK</button>
                </div>
            `;
            
            appendTarget.appendChild(this.picker);
            
            // Get references to elements
            this.monthYearElement = this.picker.querySelector('#calendar-month-year');
            this.prevBtn = this.picker.querySelector('#calendar-prev');
            this.nextBtn = this.picker.querySelector('#calendar-next');
            this.gridElement = this.picker.querySelector('#calendar-grid');
            this.cancelBtn = this.picker.querySelector('.calendar-btn-cancel');
            this.todayBtn = this.picker.querySelector('.calendar-btn-today');
            this.okBtn = this.picker.querySelector('.calendar-btn-ok');
        }
        
        hasThemeClass(element) {
            return element.classList && (
                element.classList.contains('dark-theme') ||
                element.classList.contains('red-theme') ||
                element.classList.contains('green-theme') ||
                element.classList.contains('blue-theme') ||
                Array.from(element.classList).some(cls => cls.includes('theme'))
            );
        }
        
        setDefaultDate() {
            if (this.autoDefault) {
                // Set to today's date
                this.selectedDate = new Date(this.today);
                this.input.value = this.formatDate(this.selectedDate);
            } else if (this.defaultDate) {
                // Parse specific default date
                const parsed = this.parseDate(this.defaultDate);
                if (parsed && !this.isDateDisabled(parsed)) {
                    this.selectedDate = parsed;
                    this.input.value = this.formatDate(this.selectedDate);
                }
            } else if (this.input.value) {
                // Parse existing input value
                const parsed = this.parseDate(this.input.value);
                if (parsed) {
                    this.selectedDate = parsed;
                    this.viewDate = new Date(parsed);
                }
            }
            
            // Set view date to selected date or today
            if (this.selectedDate) {
                this.viewDate = new Date(this.selectedDate);
            }
        }
        
        parseDate(dateStr) {
            // Security: Validate input
            if (typeof dateStr !== 'string' || dateStr.length > 15) return null;
            
            try {
                // Try parsing as YYYY-MM-DD (ISO format)
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    const date = new Date(dateStr + 'T00:00:00');
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
                
                // Try parsing as MM/DD/YYYY
                const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (match) {
                    const month = parseInt(match[1]) - 1; // Month is 0-indexed
                    const day = parseInt(match[2]);
                    const year = parseInt(match[3]);
                    
                    if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                        const date = new Date(year, month, day);
                        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                            return date;
                        }
                    }
                }
                
                return null;
            } catch (e) {
                return null;
            }
        }
        
        formatDate(date) {
            if (!date || isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            return `${month}/${day}/${year}`;
        }
        
        isDateDisabled(date) {
            if (!date || isNaN(date.getTime())) return true;
            
            const dateStr = this.formatDate(date);
            const isoStr = this.formatDateISO(date);
            
            // Check if date is in disabled list
            if (this.disabledDates.includes(dateStr) || this.disabledDates.includes(isoStr)) {
                return true;
            }
            
            // Check if day of week is disabled (0=Sunday, 6=Saturday)
            if (this.disabledDays.includes(date.getDay())) {
                return true;
            }
            
            // Business days only (Monday-Friday)
            if (this.businessDaysOnly) {
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                    return true;
                }
            }
            
            // Check min/max date constraints
            if (this.minDate) {
                const minDate = this.parseDate(this.minDate);
                if (minDate && date < minDate) {
                    return true;
                }
            }
            
            if (this.maxDate) {
                const maxDate = this.parseDate(this.maxDate);
                if (maxDate && date > maxDate) {
                    return true;
                }
            }
            
            // Check min/max offset constraints
            if (this.minOffset || this.maxOffset) {
                if (!this.validateDateOffset(date)) {
                    return true;
                }
            }
            
            return false;
        }
        
        validateDateOffset(date) {
            // Check min offset constraint
            if (this.minOffset) {
                const [refInputId, minDays] = this.minOffset.split(':');
                const refInput = document.getElementById(sanitizeAttribute(refInputId));
                if (validateElement(refInput) && refInput.value) {
                    const refDate = this.parseDate(refInput.value);
                    if (refDate) {
                        const daysDiff = Math.floor((date - refDate) / (1000 * 60 * 60 * 24));
                        if (daysDiff < parseInt(minDays)) {
                            return false;
                        }
                    }
                }
            }
            
            // Check max offset constraint
            if (this.maxOffset) {
                const [refInputId, maxDays] = this.maxOffset.split(':');
                const refInput = document.getElementById(sanitizeAttribute(refInputId));
                if (validateElement(refInput) && refInput.value) {
                    const refDate = this.parseDate(refInput.value);
                    if (refDate) {
                        const daysDiff = Math.floor((date - refDate) / (1000 * 60 * 60 * 24));
                        if (daysDiff > parseInt(maxDays)) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
        }
        
        formatDateISO(date) {
            if (!date || isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        }
        
        setupEventListeners() {
            this.input.addEventListener('click', (e) => {
                e.stopPropagation();
                this.show();
            });
            
            this.cancelBtn.addEventListener('click', () => this.hide());
            this.todayBtn.addEventListener('click', () => this.selectToday());
            this.okBtn.addEventListener('click', () => this.selectDate());
            
            // Close picker when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.picker.contains(e.target) && e.target !== this.input) {
                    this.hide();
                }
            });
            
            // Close this picker when other calendars are opened
            document.addEventListener('calendar-opening', (e) => {
                if (e.detail.picker !== this.picker) {
                    this.hide();
                }
            });
            
            // Navigation buttons
            this.prevBtn.addEventListener('click', () => this.previousMonth());
            this.nextBtn.addEventListener('click', () => this.nextMonth());
            
            // Grid clicks (day selection)
            this.gridElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('calendar-day') && 
                    !e.target.classList.contains('disabled') &&
                    !e.target.classList.contains('other-month')) {
                    
                    const day = parseInt(e.target.textContent);
                    const newDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
                    
                    if (!this.isDateDisabled(newDate)) {
                        this.selectedDate = newDate;
                        this.render();
                    }
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.picker.style.display === 'block') {
                    this.positionPicker();
                }
            });
            
            // Listen for changes in referenced inputs (for offset constraints)
            if (this.minOffset) {
                const [refInputId] = this.minOffset.split(':');
                const refInput = document.getElementById(sanitizeAttribute(refInputId));
                if (validateElement(refInput)) {
                    refInput.addEventListener('change', () => {
                        this.render();
                    });
                }
            }
            
            if (this.maxOffset) {
                const [refInputId] = this.maxOffset.split(':');
                const refInput = document.getElementById(sanitizeAttribute(refInputId));
                if (validateElement(refInput)) {
                    refInput.addEventListener('change', () => {
                        this.render();
                    });
                }
            }
        }
        
        previousMonth() {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
            this.render();
        }
        
        nextMonth() {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
            this.render();
        }
        
        selectToday() {
            if (!this.isDateDisabled(this.today)) {
                this.selectedDate = new Date(this.today);
                this.viewDate = new Date(this.today);
                this.render();
            }
        }
        
        render() {
            // Update month/year display
            this.monthYearElement.textContent = `${this.monthNames[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
            
            // Clear grid
            this.gridElement.innerHTML = '';
            
            // Add weekday headers
            this.weekdays.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-weekday';
                dayElement.textContent = day;
                this.gridElement.appendChild(dayElement);
            });
            
            // Get first day of month and number of days
            const firstDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
            const lastDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDay = firstDay.getDay(); // 0 = Sunday
            
            // Add previous month's trailing days
            const prevMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 0);
            for (let i = startDay - 1; i >= 0; i--) {
                const day = prevMonth.getDate() - i;
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.textContent = day;
                this.gridElement.appendChild(dayElement);
            }
            
            // Add current month's days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                
                // Check if this is today
                if (this.isSameDay(date, this.today)) {
                    dayElement.classList.add('today');
                }
                
                // Check if this is selected
                if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
                    dayElement.classList.add('selected');
                }
                
                // Check if disabled
                if (this.isDateDisabled(date)) {
                    dayElement.classList.add('disabled');
                }
                
                this.gridElement.appendChild(dayElement);
            }
            
            // Add next month's leading days to fill the grid
            const totalCells = this.gridElement.children.length;
            const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42
            
            for (let day = 1; day <= remainingCells && day <= 14; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.textContent = day;
                this.gridElement.appendChild(dayElement);
            }
        }
        
        isSameDay(date1, date2) {
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        }
        
        positionPicker() {
            const inputRect = this.input.getBoundingClientRect();
            const pickerRect = this.picker.getBoundingClientRect();
            
            let top = inputRect.bottom + window.scrollY + 5;
            let left = inputRect.left + window.scrollX;
            
            // Adjust if picker would go off screen
            if (left + pickerRect.width > window.innerWidth) {
                left = window.innerWidth - pickerRect.width - 10;
            }
            
            if (left < 10) {
                left = 10;
            }
            
            // Check if picker would go below viewport
            if (top + pickerRect.height > window.innerHeight + window.scrollY) {
                // Show above input instead
                top = inputRect.top + window.scrollY - pickerRect.height - 5;
            }
            
            this.picker.style.top = top + 'px';
            this.picker.style.left = left + 'px';
        }
        
        show() {
            // Broadcast that this picker is opening (to close others)
            document.dispatchEvent(new CustomEvent('calendar-opening', {
                detail: { picker: this.picker }
            }));
            
            this.picker.style.display = 'block';
            this.positionPicker();
            this.render();
        }
        
        hide() {
            this.picker.style.display = 'none';
        }
        
        selectDate() {
            if (this.selectedDate) {
                this.input.value = this.formatDate(this.selectedDate);
                
                // Trigger change event
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
                this.input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            this.hide();
        }
        
        destroy() {
            if (this.picker && this.picker.parentNode) {
                this.picker.parentNode.removeChild(this.picker);
            }
        }
    }
    
    // Auto-initialize all inputs with data-calendar attribute
    function initializeCalendars() {
        const inputs = document.querySelectorAll('input[data-calendar]');
        inputs.forEach(input => {
            // Skip if already initialized
            if (input.calendar) return;
            
            // Make input readonly to prevent typing
            input.readOnly = true;
            input.style.cursor = 'pointer';
            
            // Initialize calendar
            input.calendar = new Calendar(input);
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCalendars);
    } else {
        initializeCalendars();
    }
    
    // Also watch for dynamically added inputs
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches && node.matches('input[data-calendar]')) {
                            if (!node.calendar) {
                                node.readOnly = true;
                                node.style.cursor = 'pointer';
                                node.calendar = new Calendar(node);
                            }
                        }
                        // Check children too
                        const childInputs = node.querySelectorAll && node.querySelectorAll('input[data-calendar]');
                        if (childInputs) {
                            childInputs.forEach(input => {
                                if (!input.calendar) {
                                    input.readOnly = true;
                                    input.style.cursor = 'pointer';
                                    input.calendar = new Calendar(input);
                                }
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Expose Calendar class globally for manual initialization if needed
    window.Calendar = Calendar;
    
})();