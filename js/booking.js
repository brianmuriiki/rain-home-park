// ===== Bookings Management =====

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Set minimum date to today
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateBookingForm()) {
        return;
    }
    
    // Gather form data
    const bookingData = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        eventDate: document.getElementById('eventDate').value,
        eventType: document.getElementById('eventType').value,
        guestCount: document.getElementById('guestCount').value,
        specialRequests: document.getElementById('specialRequests').value || 'None',
        status: 'Pending',
        submittedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Simulate email notification
    simulateEmailNotification(bookingData);
    
    // Show success message
    showBookingSuccess();
    
    // Reset form
    e.target.reset();
}

function validateBookingForm() {
    let isValid = true;
    const form = document.getElementById('bookingForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    form.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
    
    inputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        
        if (!input.value.trim()) {
            showError(input, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate email format
    const emailInput = document.getElementById('email');
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate date not in past
    const dateInput = document.getElementById('eventDate');
    if (dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError(dateInput, 'Event date cannot be in the past');
            isValid = false;
        }
    }
    
    // Validate phone number
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value && !isValidPhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('error');
    
    let errorEl = formGroup.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        formGroup.appendChild(errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^[\d\s\-\(\)]+$/;
    return re.test(phone) && phone.replace(/[\s\-\(\)]/g, '').length >= 10;
}

function simulateEmailNotification(bookingData) {
    const emailContent = `
        TO: owner@rainhomepark.com, admin@rainhomepark.com
        SUBJECT: New Booking Request - ${bookingData.eventType} on ${bookingData.eventDate}
        
        Dear Rain Home Park Team,
        
        A new booking request has been submitted:
        
        Name: ${bookingData.fullName}
        Email: ${bookingData.email}
        Phone: ${bookingData.phone}
        Event Date: ${bookingData.eventDate}
        Event Type: ${bookingData.eventType}
        Guest Count: ${bookingData.guestCount}
        Special Requests: ${bookingData.specialRequests}
        
        Please review and confirm this booking.
        
        Best regards,
        Rain Home Park Booking System
    `;
    
    console.log("=== SIMULATED EMAIL NOTIFICATION ===");
    console.log(emailContent);
    console.log("=== END OF EMAIL ===");
    
    // Show alert with summary
    alert(`✅ Booking submitted successfully!\n\nSimulated email sent to:\n- owner@rainhomepark.com\n- admin@rainhomepark.com\n\nBooking details:\nEvent: ${bookingData.eventType}\nDate: ${bookingData.eventDate}\nName: ${bookingData.fullName}`);
}

function showBookingSuccess() {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'toast';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Booking request submitted successfully! We'll contact you soon.
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}