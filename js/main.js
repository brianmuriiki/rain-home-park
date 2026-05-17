// ===== Main JavaScript - Firebase Powered =====

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Rain Home Park initializing...");
    
    initializeNavigation();
    initializeHeroSlider();
    initializeSmoothScroll();
    
    // Load data from Firebase
    loadGalleryFromFirebase();
    loadServicesFromFirebase();
    loadTestimonialsFromFirebase();
    loadContactInfoFromFirebase();
    loadSocialLinksFromFirebase();
});

// ===== Navigation =====
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.getElementById('navbar');
    
    hamburger?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 100);
    });
}

// ===== Hero Slider =====
let currentSlideIndex = 0;
let slideInterval;

function initializeHeroSlider() {
    startSlideShow();
}

function startSlideShow() {
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return;
    
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex]?.classList.remove('active');
    
    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex]?.classList.add('active');
}

function currentSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex]?.classList.remove('active');
    
    currentSlideIndex = index;
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex]?.classList.add('active');
    
    clearInterval(slideInterval);
    startSlideShow();
}

// ===== Smooth Scroll =====
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== Gallery with Firebase =====
async function loadGalleryFromFirebase() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading gallery...</div>';
    
    try {
        const snapshot = await db.collection('gallery')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            // Initialize with default images
            await initializeDefaultGallery();
            return;
        }
        
        const images = [];
        snapshot.forEach(doc => {
            images.push({ id: doc.id, ...doc.data() });
        });
        
        displayGallery(images);
        
        // Real-time listener
        db.collection('gallery')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const updatedImages = [];
                snapshot.forEach(doc => {
                    updatedImages.push({ id: doc.id, ...doc.data() });
                });
                displayGallery(updatedImages);
            });
        
    } catch (error) {
        console.error("Error loading gallery:", error);
        galleryGrid.innerHTML = '<p class="error-message">Failed to load gallery. Please try again later.</p>';
    }
}

async function initializeDefaultGallery() {
    const defaultImages = [
        { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600', caption: 'Elegant Wedding Setup', createdAt: firebase.firestore.FieldValue.serverTimestamp() },
        { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600', caption: 'Garden Reception', createdAt: firebase.firestore.FieldValue.serverTimestamp() },
        { url: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600', caption: 'Outdoor Ceremony', createdAt: firebase.firestore.FieldValue.serverTimestamp() },
        { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', caption: 'Beautiful Landscapes', createdAt: firebase.firestore.FieldValue.serverTimestamp() },
        { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600', caption: 'Corporate Event Space', createdAt: firebase.firestore.FieldValue.serverTimestamp() },
        { url: 'https://images.unsplash.com/photo-1478146059778-ace6e540e0bf?w=600', caption: 'Birthday Celebration', createdAt: firebase.firestore.FieldValue.serverTimestamp() }
    ];
    
    const batch = db.batch();
    defaultImages.forEach(image => {
        const docRef = db.collection('gallery').doc();
        batch.set(docRef, image);
    });
    
    await batch.commit();
    console.log("✅ Default gallery initialized");
}

function displayGallery(images) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    if (images.length === 0) {
        galleryGrid.innerHTML = '<p class="no-data">No images in gallery yet.</p>';
        return;
    }
    
    galleryGrid.innerHTML = images.map((image, index) => `
        <div class="gallery-item fade-in-up" style="animation-delay: ${index * 0.1}s">
            <img src="${image.url}" alt="${image.caption}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/600x400?text=Image+Not+Found'">
            <div class="overlay">
                <h4>${image.caption}</h4>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for lightbox
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index, images));
    });
}

// ===== Lightbox =====
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(index, images) {
    lightboxImages = images;
    lightboxIndex = index;
    
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    updateLightboxImage();
    
    document.querySelector('.close-lightbox').onclick = closeLightbox;
}

function updateLightboxImage() {
    document.getElementById('lightboxImg').src = lightboxImages[lightboxIndex].url;
    document.getElementById('lightboxCaption').textContent = lightboxImages[lightboxIndex].caption;
}

function changeLightboxImage(direction) {
    lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    updateLightboxImage();
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

// Close lightbox on background click
document.addEventListener('click', function(e) {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// ===== Services with Firebase =====
async function loadServicesFromFirebase() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading services...</div>';
    
    try {
        const snapshot = await db.collection('packages').get();
        
        if (snapshot.empty) {
            await initializeDefaultPackages();
            return;
        }
        
        const packages = [];
        snapshot.forEach(doc => {
            packages.push({ id: doc.id, ...doc.data() });
        });
        
        displayServices(packages);
        
    } catch (error) {
        console.error("Error loading packages:", error);
        grid.innerHTML = '<p class="error-message">Failed to load services.</p>';
    }
}

async function initializeDefaultPackages() {
    const defaultPackages = [
        { title: "Weddings", description: "Your dream wedding in our enchanting gardens", price: "From $5,000", icon: "fa-heart", features: ["Garden ceremony", "Reception hall", "Bridal suite"] },
        { title: "Corporate Events", description: "Professional settings for business excellence", price: "From $2,500", icon: "fa-briefcase", features: ["AV equipment", "Conference rooms", "Catering"] },
        { title: "Birthday Parties", description: "Joyful celebrations for all ages", price: "From $1,500", icon: "fa-cake-candles", features: ["Party decorations", "Entertainment", "Kids area"] },
        { title: "Concerts & Shows", description: "Outdoor performances under the stars", price: "From $3,000", icon: "fa-music", features: ["Stage setup", "Sound system", "Lighting"] }
    ];
    
    const batch = db.batch();
    defaultPackages.forEach(pkg => {
        const docRef = db.collection('packages').doc();
        batch.set(docRef, pkg);
    });
    
    await batch.commit();
    console.log("✅ Default packages initialized");
}

function displayServices(packages) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    grid.innerHTML = packages.map(pkg => `
        <div class="service-card fade-in-up">
            <div class="service-icon">
                <i class="fas ${pkg.icon || 'fa-star'}"></i>
            </div>
            <h3>${pkg.title}</h3>
            <p>${pkg.description}</p>
            <p class="service-price">${pkg.price}</p>
            ${pkg.features ? `
                <ul class="package-features">
                    ${(Array.isArray(pkg.features) ? pkg.features : [pkg.features]).map(f => `<li>${f}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');
}

// ===== Testimonials with Firebase =====
let testimonialIndex = 0;

async function loadTestimonialsFromFirebase() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;
    
    track.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading testimonials...</div>';
    
    try {
        const snapshot = await db.collection('testimonials').get();
        
        if (snapshot.empty) {
            await initializeDefaultTestimonials();
            return;
        }
        
        const testimonials = [];
        snapshot.forEach(doc => {
            testimonials.push({ id: doc.id, ...doc.data() });
        });
        
        displayTestimonials(testimonials);
        
    } catch (error) {
        console.error("Error loading testimonials:", error);
        track.innerHTML = '<p class="error-message">Failed to load testimonials.</p>';
    }
}

async function initializeDefaultTestimonials() {
    const defaultTestimonials = [
        { text: "Rain Home Park made our wedding absolutely magical! The gardens were stunning, and the staff went above and beyond.", author: "Sarah & Michael Thompson" },
        { text: "We hosted our annual corporate gala here, and it was flawless. The venue is breathtaking and the coordination was perfect.", author: "Jennifer Chen, CEO TechCorp" },
        { text: "My daughter's sweet sixteen was a dream come true. The team handled everything beautifully. Highly recommended!", author: "Maria Rodriguez" }
    ];
    
    const batch = db.batch();
    defaultTestimonials.forEach(testimonial => {
        const docRef = db.collection('testimonials').doc();
        batch.set(docRef, testimonial);
    });
    
    await batch.commit();
    console.log("✅ Default testimonials initialized");
}

function displayTestimonials(testimonials) {
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track) return;
    
    track.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <p class="testimonial-text">${t.text}</p>
            <p class="testimonial-author">- ${t.author}</p>
        </div>
    `).join('');
    
    if (dotsContainer) {
        dotsContainer.innerHTML = testimonials.map((_, i) => `
            <span class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="moveTestimonialTo(${i})"></span>
        `).join('');
    }
    
    updateTestimonialPosition();
}

function moveTestimonial(direction) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (!testimonials.length) return;
    
    testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length;
    updateTestimonialPosition();
}

function moveTestimonialTo(index) {
    testimonialIndex = index;
    updateTestimonialPosition();
}

function updateTestimonialPosition() {
    const track = document.getElementById('testimonialTrack');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (track) {
        track.style.transform = `translateX(-${testimonialIndex * 100}%)`;
    }
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === testimonialIndex);
    });
}

// ===== Contact Info with Firebase =====
async function loadContactInfoFromFirebase() {
    try {
        const doc = await db.collection('settings').doc('contact').get();
        
        if (doc.exists) {
            updateContactDisplay(doc.data());
        } else {
            const defaultInfo = {
                phone: "(555) 123-4567",
                email: "info@rainhomepark.com",
                address: "123 Garden Way, Nature City, NC 12345"
            };
            await db.collection('settings').doc('contact').set(defaultInfo);
            updateContactDisplay(defaultInfo);
        }
    } catch (error) {
        console.error("Error loading contact info:", error);
    }
}

function updateContactDisplay(info) {
    const footerPhone = document.getElementById('footerPhone');
    const footerEmail = document.getElementById('footerEmail');
    const footerAddress = document.getElementById('footerAddress');
    const contactCard = document.getElementById('contactInfo');
    
    if (footerPhone) footerPhone.textContent = info.phone;
    if (footerEmail) footerEmail.textContent = info.email;
    if (footerAddress) footerAddress.textContent = info.address;
    
    if (contactCard) {
        contactCard.innerHTML = `
            <h4>Contact Information</h4>
            <p><i class="fas fa-phone"></i> ${info.phone}</p>
            <p><i class="fas fa-envelope"></i> ${info.email}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${info.address}</p>
        `;
    }
}

// ===== Social Links with Firebase =====
async function loadSocialLinksFromFirebase() {
    try {
        const doc = await db.collection('settings').doc('social').get();
        
        if (doc.exists) {
            updateSocialDisplay(doc.data());
        } else {
            const defaultSocial = {
                facebook: "#",
                instagram: "#",
                twitter: "#"
            };
            await db.collection('settings').doc('social').set(defaultSocial);
            updateSocialDisplay(defaultSocial);
        }
    } catch (error) {
        console.error("Error loading social links:", error);
    }
}

function updateSocialDisplay(social) {
    const fb = document.getElementById('socialFb');
    const ig = document.getElementById('socialIg');
    const tw = document.getElementById('socialTw');
    
    if (fb) fb.href = social.facebook;
    if (ig) ig.href = social.instagram;
    if (tw) tw.href = social.twitter;
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}