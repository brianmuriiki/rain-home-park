// ===== Admin Dashboard JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    // Load bookings by default
    loadBookings();
});

// Tab Switching
function switchTab(tabName) {
    // Update navigation buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.admin-nav-btn').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabMap = {
        'bookings': 'bookingsTab',
        'gallery': 'galleryTab',
        'packages': 'packagesTab',
        'settings': 'settingsTab'
    };
    
    document.getElementById(tabMap[tabName]).classList.add('active');
    
    // Load content
    if (tabName === 'bookings') loadBookings();
    if (tabName === 'gallery') loadGallery();
    if (tabName === 'packages') loadPackages();
    if (tabName === 'settings') loadSettings();
}

// ===== Bookings Management =====
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const container = document.getElementById('bookingsList');
    const countSpan = document.getElementById('bookingCount');
    
    if (countSpan) {
        countSpan.textContent = `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`;
    }
    
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-data">No bookings yet.</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>${booking.fullName}</h3>
                <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <div class="booking-detail">
                    <i class="fas fa-calendar"></i>
                    <span>${booking.eventDate}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-tag"></i>
                    <span>${booking.eventType}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-users"></i>
                    <span>${booking.guestCount} guests</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${booking.email}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-phone"></i>
                    <span>${booking.phone}</span>
                </div>
            </div>
            ${booking.specialRequests && booking.specialRequests !== 'None' ? 
                `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            <div class="booking-actions">
                ${booking.status === 'Pending' ? 
                    `<button class="btn-confirm" onclick="updateBookingStatus(${booking.id}, 'Confirmed')">
                        <i class="fas fa-check"></i> Confirm
                    </button>` : 
                    `<button class="btn-pending" onclick="updateBookingStatus(${booking.id}, 'Pending')">
                        <i class="fas fa-clock"></i> Mark Pending
                    </button>`
                }
                <button class="btn-delete" onclick="deleteBooking(${booking.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateBookingStatus(id, status) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const index = bookings.findIndex(b => b.id === id);
    
    if (index !== -1) {
        bookings[index].status = status;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        loadBookings();
        showToast(`Booking ${status.toLowerCase()} successfully!`);
    }
}

function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const filtered = bookings.filter(b => b.id !== id);
        localStorage.setItem('bookings', JSON.stringify(filtered));
        loadBookings();
        showToast('Booking deleted!');
    }
}

// ===== Gallery Management =====
function loadGallery() {
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    const container = document.getElementById('adminGalleryList');
    
    if (!container) return;
    
    if (images.length === 0) {
        container.innerHTML = '<p class="no-data">No images in gallery.</p>';
        return;
    }
    
    container.innerHTML = images.map((image, index) => `
        <div class="gallery-item-admin">
            <img src="${image.url}" alt="${image.caption}">
            <div class="gallery-item-info">
                <p><strong>${image.caption}</strong></p>
                <button class="btn-delete-img" onclick="deleteGalleryImage(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addGalleryImage() {
    const urlInput = document.getElementById('imageUrl');
    const captionInput = document.getElementById('imageCaption');
    const fileInput = document.getElementById('imageUpload');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveGalleryImage(e.target.result, captionInput.value || 'Gallery Image');
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else if (urlInput.value) {
        saveGalleryImage(urlInput.value, captionInput.value || 'Gallery Image');
    } else {
        alert('Please provide an image URL or select a file.');
        return;
    }
    
    urlInput.value = '';
    captionInput.value = '';
    fileInput.value = '';
}

function saveGalleryImage(url, caption) {
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    images.push({ url, caption });
    localStorage.setItem('galleryImages', JSON.stringify(images));
    loadGallery();
    showToast('Image added!');
}

function deleteGalleryImage(index) {
    if (confirm('Delete this image?')) {
        const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        images.splice(index, 1);
        localStorage.setItem('galleryImages', JSON.stringify(images));
        loadGallery();
        showToast('Image deleted!');
    }
}

// ===== Packages Management =====
function loadPackages() {
    const packages = JSON.parse(localStorage.getItem('eventPackages') || '[]');
    const container = document.getElementById('adminPackagesList');
    
    if (!container) return;
    
    if (packages.length === 0) {
        container.innerHTML = '<p class="no-data">No packages created.</p>';
        return;
    }
    
    container.innerHTML = packages.map((pkg, index) => `
        <div class="package-card-admin">
            <h3>${pkg.title}</h3>
            <p class="price">${pkg.price}</p>
            <p>${pkg.description}</p>
            ${pkg.features ? `<p class="features"><strong>Features:</strong> ${pkg.features.join(', ')}</p>` : ''}
            <div class="package-actions">
                <button class="btn-edit" onclick="editPackage(${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deletePackage(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addOrUpdatePackage() {
    const title = document.getElementById('packageTitle').value;
    const price = document.getElementById('packagePrice').value;
    const description = document.getElementById('packageDescription').value;
    const featuresStr = document.getElementById('packageFeatures').value;
    
    if (!title || !price || !description) {
        alert('Please fill all required fields.');
        return;
    }
    
    const features = featuresStr ? featuresStr.split(',').map(f => f.trim()) : [];
    const packages = JSON.parse(localStorage.getItem('eventPackages') || '[]');
    
    packages.push({ 
        title, 
        price, 
        description, 
        features, 
        icon: determineIcon(title) 
    });
    
    localStorage.setItem('eventPackages', JSON.stringify(packages));
    loadPackages();
    
    document.getElementById('packageTitle').value = '';
    document.getElementById('packagePrice').value = '';
    document.getElementById('packageDescription').value = '';
    document.getElementById('packageFeatures').value = '';
    
    showToast('Package saved!');
}

function determineIcon(title) {
    const iconMap = {
        'wedding': 'fa-heart',
        'corporate': 'fa-briefcase',
        'birthday': 'fa-cake-candles',
        'concert': 'fa-music'
    };
    return iconMap[title.toLowerCase()] || 'fa-star';
}

function editPackage(index) {
    const packages = JSON.parse(localStorage.getItem('eventPackages') || '[]');
    const pkg = packages[index];
    
    document.getElementById('packageTitle').value = pkg.title;
    document.getElementById('packagePrice').value = pkg.price;
    document.getElementById('packageDescription').value = pkg.description;
    document.getElementById('packageFeatures').value = pkg.features ? pkg.features.join(', ') : '';
    
    packages.splice(index, 1);
    localStorage.setItem('eventPackages', JSON.stringify(packages));
    loadPackages();
}

function deletePackage(index) {
    if (confirm('Delete this package?')) {
        const packages = JSON.parse(localStorage.getItem('eventPackages') || '[]');
        packages.splice(index, 1);
        localStorage.setItem('eventPackages', JSON.stringify(packages));
        loadPackages();
        showToast('Package deleted!');
    }
}

// ===== Settings Management =====
function loadSettings() {
    const info = JSON.parse(localStorage.getItem('contactInfo') || '{}');
    const social = JSON.parse(localStorage.getItem('socialLinks') || '{}');
    
    document.getElementById('parkPhone').value = info.phone || '';
    document.getElementById('parkEmail').value = info.email || '';
    document.getElementById('parkAddress').value = info.address || '';
    document.getElementById('socialFacebook').value = social.facebook || '';
    document.getElementById('socialInstagram').value = social.instagram || '';
    document.getElementById('socialTwitter').value = social.twitter || '';
}

function saveSettings(e) {
    e.preventDefault();
    
    const contactInfo = {
        phone: document.getElementById('parkPhone').value,
        email: document.getElementById('parkEmail').value,
        address: document.getElementById('parkAddress').value
    };
    
    const socialLinks = {
        facebook: document.getElementById('socialFacebook').value,
        instagram: document.getElementById('socialInstagram').value,
        twitter: document.getElementById('socialTwitter').value
    };
    
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
    localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
    
    showToast('Settings saved!');
}

// Utility
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #2d5a27;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}