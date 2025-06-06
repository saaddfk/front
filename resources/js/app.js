        // Mark first visible images as LCP candidates
        const firstImages = document.querySelectorAll('.grid img:first-child, .hero img');
        firstImages.forEach((img, index) => {
            if (index === 0) {
                img.loading = 'eager';
                img.fetchPriority = 'high';
            }
        });
    }

    handleImageErrors() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    handleImageError(img) {
        // Fallback for failed images
        img.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500';
        fallback.style.height = '200px';
        fallback.innerHTML = `
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
            </svg>
        `;
        img.parentNode.insertBefore(fallback, img);
    }

    initProgressiveImageLoading() {
        // Progressive image enhancement
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.style.filter = 'blur(5px)';
            img.addEventListener('load', () => {
                img.style.filter = 'none';
                img.style.transition = 'filter 0.3s ease';
            });
        });
    }

    /**
     * Product Gallery Functionality
     */
    initProductGallery() {
        this.initImageGallery();
        this.initZoomFunctionality();
        this.initThumbnailNavigation();
    }

    initImageGallery() {
        const galleryContainer = document.querySelector('.product-gallery');
        if (!galleryContainer) return;

        const mainImage = galleryContainer.querySelector('.main-image img');
        const thumbnails = galleryContainer.querySelectorAll('.thumbnail');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMainImage(mainImage, thumb);
            });

            // Keyboard navigation
            thumb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchMainImage(mainImage, thumb);
                }
            });
        });
    }

    switchMainImage(mainImg, thumbnail) {
        // Remove active states
        document.querySelectorAll('.thumbnail').forEach(t => 
            t.classList.remove('border-blue-500', 'ring-2', 'ring-blue-300')
        );

        // Add active state to clicked thumbnail
        thumbnail.classList.add('border-blue-500', 'ring-2', 'ring-blue-300');

        // Fade transition effect
        mainImg.style.opacity = '0.5';
        
        setTimeout(() => {
            mainImg.src = thumbnail.src.replace('width=200', 'width=800');
            mainImg.alt = thumbnail.alt;
            mainImg.style.opacity = '1';
        }, 150);
    }

    initZoomFunctionality() {
        const mainImages = document.querySelectorAll('.main-image img');
        mainImages.forEach(img => {
            img.addEventListener('click', () => this.openImageModal(img));
        });
    }

    openImageModal(img) {
        const modal = this.createImageModal(img);
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal events
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                this.closeImageModal(modal);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal(modal);
            }
        });
    }

    createImageModal(img) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full">
                <button class="close-modal absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <img src="${img.src}" alt="${img.alt}" class="max-w-full max-h-full object-contain rounded-lg shadow-xl">
            </div>
        `;
        return modal;
    }

    closeImageModal(modal) {
        modal.style.opacity = '0';
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 200);
    }

    initThumbnailNavigation() {
        const thumbnailContainers = document.querySelectorAll('.thumbnail-grid');
        thumbnailContainers.forEach(container => {
            container.addEventListener('keydown', (e) => {
                const thumbnails = Array.from(container.querySelectorAll('.thumbnail'));
                const current = thumbnails.findIndex(t => t === document.activeElement);
                
                let next = current;
                switch(e.key) {
                    case 'ArrowRight':
                        next = Math.min(current + 1, thumbnails.length - 1);
                        break;
                    case 'ArrowLeft':
                        next = Math.max(current - 1, 0);
                        break;
                    case 'Home':
                        next = 0;
                        break;
                    case 'End':
                        next = thumbnails.length - 1;
                        break;
                }
                
                if (next !== current) {
                    e.preventDefault();
                    thumbnails[next].focus();
                }
            });
        });
    }

    /**
     * Download Countdown Functionality
     */
    initDownloadCountdown() {
        const downloadButtons = document.querySelectorAll('[data-countdown]');
        downloadButtons.forEach(button => {
            const countdownTime = parseInt(button.dataset.countdown) || 5;
            this.startCountdown(button, countdownTime);
        });

        // Handle download button from template
        const downloadBtn = document.querySelector('a[href*="download"]');
        if (downloadBtn && downloadBtn.textContent.includes('(') && downloadBtn.textContent.includes('s)')) {
            const timeMatch = downloadBtn.textContent.match(/\((\d+)s\)/);
            if (timeMatch) {
                this.startCountdown(downloadBtn, parseInt(timeMatch[1]));
            }
        }
    }

    startCountdown(button, seconds) {
        const originalText = button.textContent;
        const originalHref = button.href;
        
        button.style.pointerEvents = 'none';
        button.classList.add('opacity-75');
        
        const interval = setInterval(() => {
            const timeText = button.textContent.match(/\d+/);
            if (timeText) {
                const currentTime = parseInt(timeText[0]);
                if (currentTime > 0) {
                    button.textContent = button.textContent.replace(/\d+/, currentTime - 1);
                } else {
                    this.enableDownload(button, originalText, originalHref, interval);
                }
            } else {
                button.textContent = `Download (${seconds}s)`;
                seconds--;
                if (seconds < 0) {
                    this.enableDownload(button, originalText, originalHref, interval);
                }
            }
        }, 1000);
    }

    enableDownload(button, originalText, originalHref, interval) {
        clearInterval(interval);
        button.textContent = originalText.replace(/\(\d+s\)/, '').trim() || 'Download Now';
        button.style.pointerEvents = '';
        button.classList.remove('opacity-75');
        button.classList.add('animate-pulse');
        
        // Track download event
        this.trackEvent('download', 'enabled', button.textContent);
        
        setTimeout(() => button.classList.remove('animate-pulse'), 2000);
    }

    /**
     * Advanced Lazy Loading System
     */
    initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            this.enhanceNativeLazyLoading();
        } else {
            this.fallbackLazyLoading();
        }
        
        this.initContentLazyLoading();
    }

    enhanceNativeLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        lazyImages.forEach(img => {
            img.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            
            if (img.complete) {
                img.classList.remove('opacity-0');
            } else {
                img.addEventListener('load', () => {
                    img.classList.remove('opacity-0');
                }, { once: true });
            }
        });
    }

    fallbackLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.dataset.src = img.src;
            img.src = this.generatePlaceholder(img);
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        img.src = img.dataset.src;
        img.classList.add('fade-in');
    }

    generatePlaceholder(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10;
        canvas.height = 10;
        
        const gradient = ctx.createLinearGradient(0, 0, 10, 10);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(1, '#e5e7eb');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 10, 10);
        
        return canvas.toDataURL();
    }

    initContentLazyLoading() {
        // Lazy load heavy content sections
        const contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.loadHeavyContent(element);
                    contentObserver.unobserve(element);
                }
            });
        });

        document.querySelectorAll('[data-lazy-content]').forEach(el => {
            contentObserver.observe(el);
        });
    }

    loadHeavyContent(element) {
        const contentType = element.dataset.lazyContent;
        
        switch(contentType) {
            case 'comments':
                this.loadComments(element);
                break;
            case 'related-posts':
                this.loadRelatedPosts(element);
                break;
            case 'ads':
                this.loadAds(element);
                break;
        }
    }

    /**
     * Animation System
     */
    initAnimations() {
        this.initScrollAnimations();
        this.initHoverEffects();
        this.initLoadingAnimations();
    }

    initScrollAnimations() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = parseInt(element.dataset.aosDelay) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-fade-in-up');
                    }, delay);
                    
                    animationObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.add('opacity-0', 'translate-y-4');
            animationObserver.observe(el);
        });
    }

    initHoverEffects() {
        // Enhanced card hover effects
        document.querySelectorAll('.card, .group').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.transition = 'transform 0.2s ease';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    initLoadingAnimations() {
        // Page load animation
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            
            // Stagger animation for grid items
            const gridItems = document.querySelectorAll('.grid > *');
            gridItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate-fade-in');
                }, index * 100);
            });
        });
    }

    /**
     * Performance Optimizations
     */
    initPerformanceOptimizations() {
        this.optimizeScrolling();
        this.preloadResources();
        this.optimizeFormSubmissions();
        this.cacheStrategies();
    }

    optimizeScrolling() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollPosition();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollPosition() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero sections
        const heroes = document.querySelectorAll('.parallax-bg');
        heroes.forEach(hero => {
            hero.style.transform = `translateY(${rate}px)`;
        });

        // Update scroll progress
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const progress = (scrolled / (docHeight - winHeight)) * 100;
        
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    preloadResources() {
        // Preload critical resources
        const criticalResources = [
            '/css/tailwind.css',
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lexend:wght@400;500;600;700&display=swap'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.includes('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    optimizeFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const button = form.querySelector('button[type="submit"]');
                if (button) {
                    button.disabled = true;
                    button.textContent = 'Processing...';
                    button.classList.add('opacity-75');
                }
            });
        });
    }

    cacheStrategies() {
        // Implement service worker for caching
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    /**
     * Accessibility Enhancements
     */
    initAccessibility() {
        this.enhanceKeyboardNavigation();
        this.improveScreenReaderExperience();
        this.addFocusManagement();
    }

    enhanceKeyboardNavigation() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }

        // Enhanced tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    improveScreenReaderExperience() {
        // Announce dynamic content changes
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);

        this.announcer = announcer;
    }

    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    addFocusManagement() {
        // Manage focus for modal dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal:not([hidden])');
                if (modal) {
                    this.closeModal(modal);
                }
            }
        });
    }

    /**
     * Analytics and Tracking
     */
    initAnalytics() {
        this.trackPageView();
        this.trackUserInteractions();
        this.trackPerformanceMetrics();
    }

    trackEvent(category, action, label = '', value = 0) {
        // Generic event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
        
        console.log(`Event: ${category} - ${action} - ${label} - ${value}`);
    }

    trackPageView() {
        this.trackEvent('page', 'view', window.location.pathname);
    }

    trackUserInteractions() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (target) {
                const label = target.textContent.trim() || target.getAttribute('aria-label') || target.className;
                this.trackEvent('interaction', 'click', label);
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                maxScroll = scrollPercent;
                this.trackEvent('engagement', 'scroll', `${scrollPercent}%`);
            }
        });
    }

    trackPerformanceMetrics() {
        // Track Core Web Vitals
        if ('web-vitals' in window) {
            const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;
            
            getCLS(metric => this.trackEvent('performance', 'CLS', '', metric.value));
            getFID(metric => this.trackEvent('performance', 'FID', '', metric.value));
            getFCP(metric => this.trackEvent('performance', 'FCP', '', metric.value));
            getLCP(metric => this.trackEvent('performance', 'LCP', '', metric.value));
            getTTFB(metric => this.trackEvent('performance', 'TTFB', '', metric.value));
        }
    }

    /**
     * Utility Methods
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the site manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.siteManager = new SiteManager();
    });
} else {
    window.siteManager = new SiteManager();
}
