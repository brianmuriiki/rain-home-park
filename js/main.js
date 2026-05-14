// ===== Main JavaScript - Public Website Only =====

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeHeroSlider();
    initializeGallery();
    initializeTestimonials();
    loadGalleryFromStorage();
    loadServicesFromStorage();
    loadTestimonialsFromStorage();
    loadContactInfo();
    loadSocialLinks();
});

// Navigation
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.getElementById('navbar');
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Hero Slider
let currentSlideIndex = 0;
let slideInterval;

function initializeHeroSlider() {
    startSlideShow();
}

function startSlideShow() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function currentSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex = index;
    
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
    
    clearInterval(slideInterval);
    startSlideShow();
}

// Gallery
function initializeGallery() {
    const defaultImages = [
        { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600', caption: 'Elegant Wedding Setup' },
        { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600', caption: 'Garden Reception' },
        { url: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600', caption: 'Outdoor Ceremony' },
        { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', caption: 'Beautiful Landscapes' },
        { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600', caption: 'Corporate Event Space' },
        { url: 'https://images.unsplash.com/photo-1478146059778-ace6e540e0bf?w=600', caption: 'Birthday Celebration' }
    ];
    
    const savedImages = JSON.parse(localStorage.getItem('galleryImages') || 'null');
    const images = savedImages || defaultImages;
    
    if (!savedImages) {
        localStorage.setItem('galleryImages', JSON.stringify(defaultImages));
    }
    
    displayGallery(images);
}

function displayGallery(images) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item fade-in-up';
        item.style.animationDelay = `${index * 0.1}s`;
        item.innerHTML = `
            <img src="${image.url}" alt="${image.caption}" loading="lazy">
            <div class="overlay">
                <h4>${image.caption}</h4>
            </div>
        `;
        item.addEventListener('click', () => openLightbox(index, images));
        galleryGrid.appendChild(item);
    });
}

// Lightbox
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(index, images) {
    lightboxImages = images;
    lightboxIndex = index;
    
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    updateLightboxImage();
    
    document.querySelector('.close-lightbox').onclick = closeLightbox;
    window.onclick = function(event) {
        if (event.target === lightbox) closeLightbox();
    };
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

// Testimonials
let testimonialIndex = 0;

function initializeTestimonials() {
    const defaultTestimonials = [
        { text: "Rain Home Park made our wedding absolutely magical! The gardens were stunning, and the staff went above and beyond.", author: "Sarah & Michael Thompson" },
        { text: "We hosted our annual corporate gala here, and it was flawless. The venue is breathtaking and the coordination was perfect.", author: "Jennifer Chen, CEO TechCorp" },
        { text: "My daughter's sweet sixteen was a dream come true. The team handled everything beautifully. Highly recommended!", author: "Maria Rodriguez" }
    ];
    
    const savedTestimonials = JSON.parse(localStorage.getItem('testimonials') || 'null');
    const testimonials = savedTestimonials || defaultTestimonials;
    
    if (!savedTestimonials) {
        localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials));
    }
    
    displayTestimonials(testimonials);
}

function displayTestimonials(testimonials) {
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track) return;
    
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    testimonials.forEach((testimonial, index) => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
            <p class="testimonial-text">${testimonial.text}</p>
            <p class="testimonial-author">- ${testimonial.author}</p>
        `;
        track.appendChild(card);
        
        const dot = document.createElement('span');
        dot.className = 'carousel-dot';
        dot.onclick = () => moveTestimonialTo(index);
        dotsContainer.appendChild(dot);
    });
    
    updateTestimonialPosition();
}

function moveTestimonial(direction) {
    const testimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
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
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === testimonialIndex);
    });
}

// Services
function loadServicesFromStorage() {
    const defaultPackages = [
        { title: "Weddings", description: "Your dream wedding in our enchanting gardens", price: "From $5,000", icon: "fa-heart", features: ["Garden ceremony", "Reception hall", "Bridal suite"] },
        { title: "Corporate Events", description: "Professional settings for business excellence", price: "From $2,500", icon: "fa-briefcase", features: ["AV equipment", "Conference rooms", "Catering"] },
        { title: "Birthday Parties", description: "Joyful celebrations for all ages", price: "From $1,500", icon: "fa-cake-candles", features: ["Party decorations", "Entertainment", "Kids area"] },
        { title: "Concerts & Shows", description: "Outdoor performances under the stars", price: "From $3,000", icon: "fa-music", features: ["Stage setup", "Sound system", "Lighting"] }
    ];
    
    const savedPackages = JSON.parse(localStorage.getItem('eventPackages') || 'null');
    const packages = savedPackages || defaultPackages;
    
    if (!savedPackages) {
        localStorage.setItem('eventPackages', JSON.stringify(defaultPackages));
    }
    
    displayServices(packages);
}

function displayServices(packages) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    packages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'service-card fade-in-up';
        card.innerHTML = `
            <div class="service-icon">
                <i class="fas ${pkg.icon}"></i>
            </div>
            <h3>${pkg.title}</h3>
            <p>${pkg.description}</p>
            <p class="service-price">${pkg.price}</p>
            ${pkg.features ? `<ul class="package-features">
                ${pkg.features.map(f => `<li>${f}</li>`).join('')}
            </ul>` : ''}
        `;
        grid.appendChild(card);
    });
}

// Contact Info
function loadContactInfo() {
    const savedInfo = JSON.parse(localStorage.getItem('contactInfo') || 'null');
    const info = savedInfo || {
        phone: "(555) 123-4567",
        email: "info@rainhomepark.com",
        address: "123 Garden Way, Nature City, NC 12345"
    };
    
    document.getElementById('footerPhone').textContent = info.phone;
    document.getElementById('footerEmail').textContent = info.email;
    document.getElementById('footerAddress').textContent = info.address;
    
    const contactCard = document.getElementById('contactInfo');
    if (contactCard) {
        contactCard.innerHTML = `
            <h4>Contact Information</h4>
            <p><i class="fas fa-phone"></i> ${info.phone}</p>
            <p><i class="fas fa-envelope"></i> ${info.email}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${info.address}</p>
        `;
    }
}

function loadSocialLinks() {
    const savedSocial = JSON.parse(localStorage.getItem('socialLinks') || 'null');
    const social = savedSocial || { facebook: "#", instagram: "#", twitter: "#" };
    
    document.getElementById('socialFb').href = social.facebook;
    document.getElementById('socialIg').href = social.instagram;
    document.getElementById('socialTw').href = social.twitter;
}

function loadGalleryFromStorage() {
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    if (images.length > 0) displayGallery(images);
}

function loadTestimonialsFromStorage() {
    const testimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
    if (testimonials.length > 0) displayTestimonials(testimonials);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}