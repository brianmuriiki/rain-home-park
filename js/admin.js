// ===== Admin Dashboard with Firebase =====

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'admin.html';
        } else {
            console.log("✅ Admin authenticated:", user.email);
            initializeAdmin();
        }
    });
});

function initializeAdmin() {
    loadBookings();
    setupRealtimeListeners();
}

// Real-time updates
function setupRealtimeListeners() {
    // Listen for booking changes
    db.collection('bookings')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const bookings = [];
            snapshot.forEach(doc => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            displayBookings(bookings);
        });
}

// ===== Tab Navigation =====
function switchTab(tabName) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.admin-nav-btn').classList.add('active');
    
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
async function loadBookings() {
    try {
        const snapshot = await db.collection('bookings')
            .orderBy('createdAt', 'desc')
            .get();
        
        const bookings = [];
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        
        displayBookings(bookings);
        updateBookingStats(bookings);
        
    } catch (error) {
        console.error("Error loading bookings:", error);
        showToast('Error loading bookings', 'error');
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsList');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-calendar-check"></i>
                <p>No bookings yet</p>
                <small>New bookings will appear here automatically</small>
            </div>`;
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div>
                    <h3>${booking.fullName}</h3>
                    <small>${new Date(booking.createdAt?.toDate()).toLocaleDateString()}</small>
                </div>
                <span class="booking-status status-${(booking.status || 'pending').toLowerCase()}">
                    ${booking.status || 'Pending'}
                </span>
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
                `<div class="booking-requests">
                    <strong>Special Requests:</strong> ${booking.specialRequests}
                </div>` : ''}
            <div class="booking-actions">
                ${booking.status === 'Pending' ? 
                    `<button class="btn-confirm" onclick="updateBookingStatus('${booking.id}', 'Confirmed')">
                        <i class="fas fa-check"></i> Confirm
                    </button>` : 
                    `<button class="btn-pending" onclick="updateBookingStatus('${booking.id}', 'Pending')">
                        <i class="fas fa-clock"></i> Mark Pending
                    </button>`
                }
                <button class="btn-delete" onclick="deleteBooking('${booking.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateBookingStats(bookings) {
    const totalEl = document.getElementById('totalBookings');
    const pendingEl = document.getElementById('pendingBookings');
    const confirmedEl = document.getElementById('confirmedBookings');
    const pendingBadge = document.getElementById('pendingCount');
    
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    
    if (totalEl) totalEl.textContent = bookings.length;
    if (pendingEl) pendingEl.textContent = pending;
    if (confirmedEl) confirmedEl.textContent = confirmed;
    if (pendingBadge) {
        pendingBadge.textContent = pending;
        pendingBadge.style.display = pending > 0 ? 'inline' : 'none';
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        await db.collection('bookings').doc(bookingId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast(`Booking ${status.toLowerCase()} successfully!`);
    } catch (error) {
        console.error("Error updating booking:", error);
        showToast('Error updating booking', 'error');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This cannot be undone.')) return;
    
    try {
        await db.collection('bookings').doc(bookingId).delete();
        showToast('Booking deleted!');
    } catch (error) {
        console.error("Error deleting booking:", error);
        showToast('Error deleting booking', 'error');
    }
}

// ===== Gallery Management =====
async function loadGallery() {
    try {
        const snapshot = await db.collection('gallery')
            .orderBy('createdAt', 'desc')
            .get();
        
        const images = [];
        snapshot.forEach(doc => {
            images.push({ id: doc.id, ...doc.data() });
        });
        
        displayAdminGallery(images);
    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}

function displayAdminGallery(images) {
    const container = document.getElementById('adminGalleryList');
    if (!container) return;
    
    if (images.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-images"></i>
                <p>No images in gallery</p>
                <small>Add images using the form above</small>
            </div>`;
        return;
    }
    
    container.innerHTML = images.map(image => `
        <div class="gallery-item-admin">
            <img src="${image.url}" alt="${image.caption}" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
            <div class="gallery-item-info">
                <p><strong>${image.caption || 'No caption'}</strong></p>
                <p class="image-url">${image.url.substring(0, 40)}...</p>
                <button class="btn-delete-img" onclick="deleteGalleryImage('${image.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function addGalleryImage() {
    const urlInput = document.getElementById('imageUrl');
    const captionInput = document.getElementById('imageCaption');
    const fileInput = document.getElementById('imageUpload');
    
    const caption = captionInput.value || 'Gallery Image';
    
    try {
        if (fileInput.files && fileInput.files[0]) {
            // Upload to Firebase Storage
            const file = fileInput.files[0];
            const storageRef = storage.ref('gallery/' + Date.now() + '_' + file.name);
            
            showToast('Uploading image...');
            
            const uploadTask = await storageRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            
            // Save metadata to Firestore
            await db.collection('gallery').add({
                url: downloadURL,
                caption: caption,
                fileName: file.name,
                size: file.size,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
        } else if (urlInput.value) {
            // Save URL directly
            if (!isValidUrl(urlInput.value)) {
                showToast('Please enter a valid URL', 'error');
                return;
            }
            
            await db.collection('gallery').add({
                url: urlInput.value,
                caption: caption,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            showToast('Please provide an image URL or select a file', 'error');
            return;
        }
        
        showToast('Image added successfully!');
        urlInput.value = '';
        captionInput.value = '';
        fileInput.value = '';
        loadGallery();
        
    } catch (error) {
        console.error("Error adding image:", error);
        showToast('Error adding image: ' + error.message, 'error');
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function deleteGalleryImage(imageId) {
    if (!confirm('Delete this image?')) return;
    
    try {
        await db.collection('gallery').doc(imageId).delete();
        showToast('Image deleted!');
        loadGallery();
    } catch (error) {
        console.error("Error deleting image:", error);
        showToast('Error deleting image', 'error');
    }
}

// ===== Packages Management =====
async function loadPackages() {
    try {
        const snapshot = await db.collection('packages').get();
        
        const packages = [];
        snapshot.forEach(doc => {
            packages.push({ id: doc.id, ...doc.data() });
        });
        
        displayAdminPackages(packages);
    } catch (error) {
        console.error("Error loading packages:", error);
    }
}

function displayAdminPackages(packages) {
    const container = document.getElementById('adminPackagesList');
    if (!container) return;
    
    if (packages.length === 0) {
        container.innerHTML = '<p class="no-data">No packages created yet.</p>';
        return;
    }
    
    container.innerHTML = packages.map(pkg => `
        <div class="package-card-admin">
            <div class="package-card-header">
                <h3>${pkg.title}</h3>
                <span class="price">${pkg.price}</span>
            </div>
            <p>${pkg.description}</p>
            ${pkg.features ? `
                <div class="features">
                    <strong>Features:</strong>
                    <ul>
                        ${(Array.isArray(pkg.features) ? pkg.features : [pkg.features]).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div class="package-actions">
                <button class="btn-edit" onclick="editPackage('${pkg.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deletePackage('${pkg.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function addOrUpdatePackage() {
    const title = document.getElementById('packageTitle').value.trim();
    const price = document.getElementById('packagePrice').value.trim();
    const description = document.getElementById('packageDescription').value.trim();
    const featuresStr = document.getElementById('packageFeatures').value.trim();
    
    if (!title || !price || !description) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const features = featuresStr ? featuresStr.split(',').map(f => f.trim()).filter(f => f) : [];
    
    try {
        await db.collection('packages').add({
            title,
            price,
            description,
            features,
            icon: determineIcon(title),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Package saved successfully!');
        
        // Clear form
        document.getElementById('packageTitle').value = '';
        document.getElementById('packagePrice').value = '';
        document.getElementById('packageDescription').value = '';
        document.getElementById('packageFeatures').value = '';
        
        loadPackages();
    } catch (error) {
        console.error("Error saving package:", error);
        showToast('Error saving package', 'error');
    }
}

function determineIcon(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('wedding')) return 'fa-heart';
    if (titleLower.includes('corporate')) return 'fa-briefcase';
    if (titleLower.includes('birthday')) return 'fa-cake-candles';
    if (titleLower.includes('concert') || titleLower.includes('show')) return 'fa-music';
    return 'fa-star';
}

async function editPackage(packageId) {
    try {
        const doc = await db.collection('packages').doc(packageId).get();
        if (doc.exists) {
            const pkg = doc.data();
            document.getElementById('packageTitle').value = pkg.title;
            document.getElementById('packagePrice').value = pkg.price;
            document.getElementById('packageDescription').value = pkg.description;
            document.getElementById('packageFeatures').value = Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features || '';
            
            // Delete old version
            await db.collection('packages').doc(packageId).delete();
            loadPackages();
        }
    } catch (error) {
        console.error("Error editing package:", error);
        showToast('Error loading package for edit', 'error');
    }
}

async function deletePackage(packageId) {
    if (!confirm('Delete this package?')) return;
    
    try {
        await db.collection('packages').doc(packageId).delete();
        showToast('Package deleted!');
        loadPackages();
    } catch (error) {
        console.error("Error deleting package:", error);
        showToast('Error deleting package', 'error');
    }
}

// ===== Settings Management =====
async function loadSettings() {
    try {
        const contactDoc = await db.collection('settings').doc('contact').get();
        if (contactDoc.exists) {
            const contact = contactDoc.data();
            document.getElementById('parkPhone').value = contact.phone || '';
            document.getElementById('parkEmail').value = contact.email || '';
            document.getElementById('parkAddress').value = contact.address || '';
        }
        
        const socialDoc = await db.collection('settings').doc('social').get();
        if (socialDoc.exists) {
            const social = socialDoc.data();
            document.getElementById('socialFacebook').value = social.facebook || '';
            document.getElementById('socialInstagram').value = social.instagram || '';
            document.getElementById('socialTwitter').value = social.twitter || '';
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

async function saveSettings(e) {
    e.preventDefault();
    
    const contactInfo = {
        phone: document.getElementById('parkPhone').value.trim(),
        email: document.getElementById('parkEmail').value.trim(),
        address: document.getElementById('parkAddress').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const socialLinks = {
        facebook: document.getElementById('socialFacebook').value.trim(),
        instagram: document.getElementById('socialInstagram').value.trim(),
        twitter: document.getElementById('socialTwitter').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('settings').doc('contact').set(contactInfo);
        await db.collection('settings').doc('social').set(socialLinks);
        
        showToast('Settings saved successfully!');
    } catch (error) {
        console.error("Error saving settings:", error);
        showToast('Error saving settings', 'error');
    }
}

// ===== Utility Functions =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}