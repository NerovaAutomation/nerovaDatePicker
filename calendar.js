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
            width: 220px;
            user-select: none;
        }
        
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 6px 8px;
            background-color: var(--calendar-header-bg);
            border-radius: 4px;
        }
        
        .calendar-nav-btn {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 3px;
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
            font-size: 14px;
            font-weight: bold;
            color: var(--calendar-header-text);
            margin: 0 8px;
            min-width: 100px;
            text-align: center;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 3px;
            transition: background-color 0.2s ease;
        }
        
        .calendar-month-year:hover {
            background-color: var(--calendar-hover);
        }
        
        .calendar-month-picker {
            position: absolute;
            background-color: var(--calendar-bg);
            border: 1px solid var(--calendar-border);
            border-radius: 4px;
            padding: 8px;
            box-shadow: 0 2px 10px var(--calendar-shadow);
            z-index: 10001;
            display: none;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
            width: 180px;
        }
        
        .calendar-month-option {
            padding: 6px 8px;
            cursor: pointer;
            font-size: 11px;
            text-align: center;
            border-radius: 3px;
            transition: background-color 0.2s ease;
            color: var(--calendar-text);
        }
        
        .calendar-month-option:hover {
            background-color: var(--calendar-hover);
        }
        
        .calendar-month-option.selected {
            background-color: var(--calendar-selected);
            color: white;
        }
        
        .calendar-year-controls {
            grid-column: 1 / -1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px;
        }
        
        .calendar-year-btn {
            background: none;
            border: none;
            font-size: 14px;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 3px;
            color: var(--calendar-header-text);
            transition: background-color 0.2s ease;
        }
        
        .calendar-year-btn:hover {
            background-color: var(--calendar-hover);
        }
        
        .calendar-year-display {
            font-weight: bold;
            color: var(--calendar-header-text);
        }
        
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            margin-bottom: 8px;
        }
        
        .calendar-weekday {
            text-align: center;
            font-size: 10px;
            font-weight: bold;
            padding: 4px 2px;
            color: var(--calendar-header-text);
            background-color: var(--calendar-header-bg);
            border-radius: 2px;
        }
        
        .calendar-day {
            text-align: center;
            padding: 4px 2px;
            cursor: pointer;
            font-size: 12px;
            border-radius: 2px;
            transition: all 0.2s ease;
            min-height: 20px;
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
            border: 1px solid var(--calendar-today);
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
            gap: 4px;
            margin-top: 8px;
        }
        
        .calendar-btn {
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            transition: opacity 0.2s ease;
            flex: 1;
        }
        
        .calendar-btn-cancel {
            background-color: #f5f5f5;
            color: #666;
        }
        
        
        .calendar-btn-ok {
            background-color: var(--calendar-selected);
            color: white;
        }
        
        .calendar-btn:hover {
            opacity: 0.8;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .calendar-popup {
                width: 260px;
                padding: 18px;
            }
            
            .calendar-header {
                margin-bottom: 12px;
                padding: 8px 10px;
            }
            
            .calendar-nav-btn {
                font-size: 18px;
                padding: 4px 8px;
                min-height: 32px;
                min-width: 32px;
            }
            
            .calendar-month-year {
                font-size: 15px;
                padding: 4px 8px;
                min-height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .calendar-weekday {
                font-size: 11px;
                padding: 6px 3px;
            }
            
            .calendar-day {
                padding: 8px 4px;
                font-size: 14px;
                min-height: 32px;
                border-radius: 4px;
            }
            
            .calendar-day.today {
                border: 2px solid var(--calendar-today);
            }
            
            .calendar-buttons {
                gap: 8px;
                margin-top: 12px;
            }
            
            .calendar-btn {
                padding: 10px 12px;
                font-size: 14px;
                min-height: 40px;
                border-radius: 6px;
            }
            
            .calendar-month-picker {
                width: 200px;
                padding: 12px;
                gap: 6px;
            }
            
            .calendar-month-option {
                padding: 10px 8px;
                font-size: 13px;
                min-height: 36px;
                border-radius: 4px;
            }
            
            .calendar-year-btn {
                font-size: 16px;
                padding: 4px 8px;
                min-height: 32px;
                min-width: 32px;
            }
            
            .calendar-year-display {
                font-size: 15px;
            }
        }
        
        /* Touch-specific optimizations */
        @media (hover: none) and (pointer: coarse) {
            .calendar-day {
                min-height: 36px;
                padding: 10px 4px;
            }
            
            .calendar-btn {
                min-height: 44px;
                padding: 12px 16px;
            }
            
            .calendar-nav-btn, .calendar-year-btn {
                min-height: 36px;
                min-width: 36px;
            }
            
            .calendar-month-option {
                min-height: 40px;
                padding: 12px 8px;
            }
            
            .calendar-month-year {
                min-height: 36px;
                padding: 6px 10px;
            }
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
            this.noPastDates = this.input.dataset.noPastDates === 'true';
            this.autoClear = this.input.dataset.autoClear === 'true';
            this.autoMirror = this.input.dataset.autoMirror === 'true';
            
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
            this.createMonthPicker();
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
                <div class="calendar-month-picker" id="calendar-month-picker">
                    <div class="calendar-year-controls">
                        <button class="calendar-year-btn" id="calendar-year-prev">‹</button>
                        <div class="calendar-year-display" id="calendar-year-display"></div>
                        <button class="calendar-year-btn" id="calendar-year-next">›</button>
                    </div>
                </div>
                <div class="calendar-grid" id="calendar-grid"></div>
                <div class="calendar-buttons">
                    <button class="calendar-btn calendar-btn-cancel">Cancel</button>
                    <button class="calendar-btn calendar-btn-ok">OK</button>
                </div>
            `;
            
            appendTarget.appendChild(this.picker);
            
            // Get references to elements
            this.monthYearElement = this.picker.querySelector('#calendar-month-year');
            this.prevBtn = this.picker.querySelector('#calendar-prev');
            this.nextBtn = this.picker.querySelector('#calendar-next');
            this.monthPicker = this.picker.querySelector('#calendar-month-picker');
            this.yearDisplay = this.picker.querySelector('#calendar-year-display');
            this.yearPrevBtn = this.picker.querySelector('#calendar-year-prev');
            this.yearNextBtn = this.picker.querySelector('#calendar-year-next');
            this.gridElement = this.picker.querySelector('#calendar-grid');
            this.cancelBtn = this.picker.querySelector('.calendar-btn-cancel');
            this.okBtn = this.picker.querySelector('.calendar-btn-ok');
        }
        
        createMonthPicker() {
            // Populate month picker with month options
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            monthNames.forEach((month, index) => {
                const monthOption = document.createElement('div');
                monthOption.className = 'calendar-month-option';
                monthOption.textContent = month;
                monthOption.dataset.month = index;
                this.monthPicker.appendChild(monthOption);
            });
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
            if (typeof dateStr !== 'string' || dateStr.length > 20) return null;
            
            try {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                // Try parsing as YYYY-MM-DD (ISO format)
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    const date = new Date(dateStr + 'T00:00:00');
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
                
                // Try parsing as MM/DD/YYYY
                const mmddyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (mmddyyyyMatch) {
                    const month = parseInt(mmddyyyyMatch[1]) - 1; // Month is 0-indexed
                    const day = parseInt(mmddyyyyMatch[2]);
                    const year = parseInt(mmddyyyyMatch[3]);
                    
                    if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                        const date = new Date(year, month, day);
                        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                            return date;
                        }
                    }
                }
                
                // Try parsing as "Aug 12, 2025" format
                const monthDayYearMatch = dateStr.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
                if (monthDayYearMatch) {
                    const monthName = monthDayYearMatch[1];
                    const day = parseInt(monthDayYearMatch[2]);
                    const year = parseInt(monthDayYearMatch[3]);
                    
                    const monthIndex = monthNames.indexOf(monthName);
                    if (monthIndex !== -1 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
                        const date = new Date(year, monthIndex, day);
                        if (date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day) {
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
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const year = date.getFullYear();
            const month = monthNames[date.getMonth()];
            const day = date.getDate();
            
            return `${month} ${day}, ${year}`;
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
            
            // No past dates check
            if (this.noPastDates) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0); // Reset time to start of day
                
                if (checkDate < today) {
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
            this.okBtn.addEventListener('click', () => this.selectDate());
            
            // Close picker when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.picker.contains(e.target) && e.target !== this.input) {
                    this.hide();
                } else if (!this.monthPicker.contains(e.target) && e.target !== this.monthYearElement) {
                    this.hideMonthPicker();
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
            
            // Month/Year picker
            this.monthYearElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMonthPicker();
            });
            
            this.yearPrevBtn.addEventListener('click', () => this.previousYear());
            this.yearNextBtn.addEventListener('click', () => this.nextYear());
            
            // Month selection
            this.monthPicker.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.classList.contains('calendar-month-option')) {
                    const month = parseInt(e.target.dataset.month);
                    this.viewDate.setMonth(month);
                    this.hideMonthPicker();
                    this.render();
                }
            });
            
            // Grid clicks (day selection)
            this.gridElement.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling that causes auto-close
                
                if (e.target.classList.contains('calendar-day') && 
                    !e.target.classList.contains('disabled') &&
                    !e.target.classList.contains('other-month')) {
                    
                    const day = parseInt(e.target.textContent);
                    const newDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
                    
                    if (!this.isDateDisabled(newDate)) {
                        this.selectedDate = newDate;
                        this.render();
                        // Calendar stays open for user to click OK
                    }
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.picker.style.display === 'block') {
                    this.positionPicker();
                }
            });
            
            // Add touch event handling for mobile
            this.setupTouchEvents();
            
            // Listen for changes in referenced inputs (for offset constraints)
            if (this.minOffset) {
                const [refInputId] = this.minOffset.split(':');
                const refInput = document.getElementById(sanitizeAttribute(refInputId));
                if (validateElement(refInput)) {
                    refInput.addEventListener('change', () => {
                        // Handle auto-mirror: only mirror if current date becomes invalid
                        if (this.autoMirror && this.selectedDate && this.isDateDisabled(this.selectedDate) && refInput.value) {
                            const refDate = this.parseDate(refInput.value);
                            if (refDate && !this.isDateDisabled(refDate)) {
                                this.selectedDate = new Date(refDate);
                                this.input.value = this.formatDate(this.selectedDate);
                                this.input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                        // Handle auto-clear: clear invalid dates if enabled
                        else if (this.autoClear && this.selectedDate && this.isDateDisabled(this.selectedDate)) {
                            this.selectedDate = null;
                            this.input.value = '';
                            this.input.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        this.render();
                    });
                }
            }
            
            if (this.maxOffset) {
                const [refInputId] = this.maxOffset.split(':');
                const refInput = document.getElementById(sanitizeAttribute(refInputId));
                if (validateElement(refInput)) {
                    refInput.addEventListener('change', () => {
                        // Handle auto-mirror: only mirror if current date becomes invalid
                        if (this.autoMirror && this.selectedDate && this.isDateDisabled(this.selectedDate) && refInput.value) {
                            const refDate = this.parseDate(refInput.value);
                            if (refDate && !this.isDateDisabled(refDate)) {
                                this.selectedDate = new Date(refDate);
                                this.input.value = this.formatDate(this.selectedDate);
                                this.input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                        // Handle auto-clear: clear invalid dates if enabled
                        else if (this.autoClear && this.selectedDate && this.isDateDisabled(this.selectedDate)) {
                            this.selectedDate = null;
                            this.input.value = '';
                            this.input.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        this.render();
                    });
                }
            }
        }
        
        setupTouchEvents() {
            // Improve touch feedback for all clickable elements
            const touchElements = [
                ...this.picker.querySelectorAll('.calendar-nav-btn'),
                ...this.picker.querySelectorAll('.calendar-year-btn'),
                this.monthYearElement,
                this.cancelBtn,
                this.okBtn
            ];
            
            touchElements.forEach(element => {
                element.addEventListener('touchstart', (e) => {
                    element.style.opacity = '0.7';
                }, { passive: true });
                
                element.addEventListener('touchend', (e) => {
                    element.style.opacity = '';
                }, { passive: true });
                
                element.addEventListener('touchcancel', (e) => {
                    element.style.opacity = '';
                }, { passive: true });
            });
            
            // Prevent context menu on long press for calendar days
            this.gridElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            // Prevent context menu on month options
            this.monthPicker.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        
        previousMonth() {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
            this.render();
        }
        
        nextMonth() {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
            this.render();
        }
        
        previousYear() {
            this.viewDate.setFullYear(this.viewDate.getFullYear() - 1);
            this.updateMonthPicker();
        }
        
        nextYear() {
            this.viewDate.setFullYear(this.viewDate.getFullYear() + 1);
            this.updateMonthPicker();
        }
        
        toggleMonthPicker() {
            if (this.monthPicker.style.display === 'grid') {
                this.hideMonthPicker();
            } else {
                this.showMonthPicker();
            }
        }
        
        showMonthPicker() {
            this.monthPicker.style.display = 'grid';
            this.updateMonthPicker();
            
            // Position the month picker
            const headerRect = this.monthYearElement.getBoundingClientRect();
            const pickerRect = this.picker.getBoundingClientRect();
            
            this.monthPicker.style.top = '40px'; // Below the header
            this.monthPicker.style.left = '50%';
            this.monthPicker.style.transform = 'translateX(-50%)';
        }
        
        hideMonthPicker() {
            this.monthPicker.style.display = 'none';
        }
        
        updateMonthPicker() {
            this.yearDisplay.textContent = this.viewDate.getFullYear();
            
            // Update selected month
            this.monthPicker.querySelectorAll('.calendar-month-option').forEach((option, index) => {
                option.classList.toggle('selected', index === this.viewDate.getMonth());
            });
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
            const isMobile = window.innerWidth <= 768;
            const pickerWidth = isMobile ? 260 : 220;
            
            // Always position below input
            let top = inputRect.bottom + window.scrollY + 5;
            let left = inputRect.left + window.scrollX;
            
            if (isMobile) {
                // Center horizontally on mobile if screen is small
                const availableWidth = window.innerWidth - 20; // 10px margin on each side
                if (pickerWidth > availableWidth) {
                    left = 10;
                    this.picker.style.width = (availableWidth) + 'px';
                } else {
                    left = Math.max(10, Math.min(
                        window.innerWidth - pickerWidth - 10,
                        inputRect.left + window.scrollX
                    ));
                }
            } else {
                // Desktop positioning
                if (left + pickerWidth > window.innerWidth) {
                    left = window.innerWidth - pickerWidth - 10;
                }
                
                if (left < 10) {
                    left = 10;
                }
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