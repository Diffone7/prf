    // Global variable to manage the current state of the cursor effects.
    let currentCursorController = null;

    // Main entry point for the script, runs after the HTML document is fully loaded.
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize all interactive components of the page.
        initializeInteractiveBackground();
        initializeTabNavigation();
        initializeInteractiveEffects();
        initializeModalFunctionality();
        initializeCursorToggle();
        initializeClickEffect();
    });

    /**
     * MODIFIED FUNCTION: Loads videos from a playlist sequentially and bypasses cache.
     * @param {string} playlistId The ID of the playlist.
     */
    async function loadMusicPlaylist(playlistId) {
        const carousel = document.querySelector('.video-carousel');
        carousel.innerHTML = '<p class="loading-message">Loading music from the playlist...</p>';

        // Add a unique timestamp to the RSS URL to bypass the proxy's cache.
        const cacheBuster = new Date().getTime();
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}&_=${cacheBuster}`;
        
        // We use a CORS proxy to fetch the RSS feed to avoid browser restrictions.
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Lỗi mạng: ${response.status}`);
            }
            const data = await response.json();
            const xmlString = data.contents;
            
            // Parse the XML string into a DOM object.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            const entries = xmlDoc.querySelectorAll('entry');
            if (entries.length === 0) {
                throw new Error('No videos were found in the playlist, or the playlist does not exist.');
            }

            carousel.innerHTML = ''; // Clear the loading message.

            // Helper function to create a delay
            const delay = ms => new Promise(res => setTimeout(res, ms));

            // Loop through each video entry and load it sequentially
            for (const entry of entries) {
                const videoId = entry.querySelector('videoId').textContent;
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.setAttribute('allow', 'fullscreen');
                carousel.appendChild(iframe);

                // Wait for a short period before loading the next video
                await delay(200); 
            }

        } catch (error) {
            console.error('Error loading music playlist:', error);
            carousel.innerHTML = `<p class="error-message">Unable to load music. Please try again later. Error: ${error.message}</p>`;
        }
    }


/**
 * Initializes functionality for the tagline notes modal.
 */
function initializeTaglineModal() {
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        tagline.addEventListener('click', openTaglineModal);
    }
}

/**
 * Opens the tagline notes modal.
 */
function openTaglineModal() {
    const modal = document.getElementById('taglineModal');
    if (modal) {
        modal.style.display = 'block';
        document.querySelector('.container').classList.add('modal-open');
    }
}

/**
 * Closes the tagline notes modal.
 */
function closeTaglineModal() {
    const modal = document.getElementById('taglineModal');
    if (modal) {
        modal.style.display = 'none';
        document.querySelector('.container').classList.remove('modal-open');
    }
}

/**
 * ADDED: Opens the visiting tagline modal.
 */
function openVisitingTaglineModal() {
    const modal = document.getElementById('visitingTaglineModal');
    if (modal) {
        modal.style.display = 'block';
        document.querySelector('.container').classList.add('modal-open');
    }
}

/**
 * ADDED: Closes the visiting tagline modal.
 */
function closeVisitingTaglineModal() {
    const modal = document.getElementById('visitingTaglineModal');
    if (modal) {
        modal.style.display = 'none';
        document.querySelector('.container').classList.remove('modal-open');
    }
}


    /**
     * Manages the animated particle background on the canvas.
     */
    function initializeInteractiveBackground() {
        const canvas = document.getElementById('interactive-canvas');
        if (!canvas) return; // Exit if canvas element is not found
        const ctx = canvas.getContext('2d');
        let particlesArray;

        // Object to store mouse coordinates.
        const mouse = { x: null, y: null, radius: 150 }; // Changed mouse.radius to 150 for interaction

        // Update mouse coordinates on move.
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });

        // Reset mouse coordinates when the cursor leaves the window.
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        /**
         * Represents a single particle in the background animation.
         */
        class Particle {
            /**
             * @param {number} x X-coordinate of the particle.
             * @param {number} y Y-coordinate of the particle.
             * @param {number} directionX Movement direction on the X-axis.
             * @param {number} directionY Movement direction on the Y-axis.
             * @param {number} size Size of the particle.
             * @param {string} color Color of the particle.
             */
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x; this.y = y;
                this.directionX = directionX; this.directionY = directionY;
                this.size = size; this.color = color;
            }

            /**
             * Draws the particle on the canvas.
             */
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            /**
             * Updates the particle's position and handles interactions.
             */
            update() {
                // Reverse direction if particle hits canvas edges.
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    // Push particle away from mouse.
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius + this.size - distance) / (mouse.radius + this.size);
                    const directionX = forceDirectionX * force * 2.5; // Adjust push strength
                    const directionY = forceDirectionY * force * 2.5; // Adjust push strength

                    this.x -= directionX;
                    this.y -= directionY;
                }

                // Move particle and redraw it.
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        /**
         * Initializes or re-initializes the particles.
         * Called on load and on window resize.
         */
        function init() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // mouse.radius is now set globally in the mouse object, no need to reset here
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 9000; // Responsive particle count.
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1.5;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                let color = `hsla(${Math.random() * 360}, 70%, 75%, 0.8)`;
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        /**
         * Draws lines between nearby particles.
         */
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    // If particles are close enough, draw a line.
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000); // Line fades with distance.
                        ctx.strokeStyle = `rgba(200, 220, 255, ${opacityValue * 0.5})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        /**
         * The main animation loop.
         */
        function animate() {
            requestAnimationFrame(animate); // Creates a smooth animation loop.
            ctx.clearRect(0, 0, innerWidth, innerHeight); // Clear canvas each frame.
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }
        
        // Re-initialize canvas on window resize.
        window.addEventListener('resize', init);
        init(); // Initial setup.
        animate(); // Start the animation.
    }

    /**
     * Controls the cursor with continuous circular movement when idle.
     */
    class CircularMovementController {
        /**
         * @param {HTMLElement} container The DOM element to contain cursor effects.
         */
        constructor(container) {
            this.container = container;
            this.cursorTrail = new CursorTrail(this.container);
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight / 2;
            this.idleTimer = null;
            this.circularMovementAnimationId = null; // For circular movement animation frame ID
            this.circleAngle = 0; // Current angle for circular movement
            this.isMovementActive = false; // Flag to indicate if circular movement is active
            // Bind 'this' to event handlers to maintain context.
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            this.handleMouseEnter = this.handleMouseEnter.bind(this);
        }

        /**
         * Activates the controller and its event listeners.
         */
        start() {
            this.cursorTrail.startAnimation();
            window.addEventListener('mousemove', this.handleMouseMove);
            document.body.addEventListener('mouseleave', this.handleMouseLeave);
            document.body.addEventListener('mouseenter', this.handleMouseEnter);
            this.resetIdleTimer();
        }

        /**
         * Deactivates the controller and cleans up.
         */
        stop() {
            this.cursorTrail.stopAnimation();
            window.removeEventListener('mousemove', this.handleMouseMove);
            document.body.removeEventListener('mouseleave', this.handleMouseLeave);
            document.body.removeEventListener('mouseenter', this.handleMouseEnter);
            this.stopIdleMovement();
            clearTimeout(this.idleTimer);
            this.container.innerHTML = ''; // Clear cursor elements.
        }

        /**
         * Handles mouse movement events.
         * @param {MouseEvent} e The mouse event object.
         */
        handleMouseMove(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.cursorTrail.updateTarget(this.mouseX, this.mouseY);
            if (this.isMovementActive) {
                this.stopIdleMovement();
            }
            this.resetIdleTimer();
        }

        /**
         * Resets the timer that triggers idle mode.
         */
        resetIdleTimer() {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => this.startCircularMovement(), 3000);
        }

        /**
         * Starts idle mode when the mouse leaves the window.
         */
        handleMouseLeave() {
            this.startCircularMovement();
        }

        /**
         * Stops idle mode when the mouse re-enters the window.
         */
        handleMouseEnter() {
            this.stopIdleMovement();
            this.resetIdleTimer();
        }

        /**
         * Starts the circular movement animation for the cursor.
         */
        startCircularMovement() {
            if (this.isMovementActive) return;
            this.isMovementActive = true;

            const circleCenterX = window.innerWidth / 2;
            const circleCenterY = window.innerHeight / 2;
            const circleRadius = Math.min(window.innerWidth, window.innerHeight) * 0.2; // 20% of the smaller dimension

            const animateCircularly = () => {
                this.circleAngle += 0.02; // Adjust speed of rotation
                const newX = circleCenterX + circleRadius * Math.cos(this.circleAngle);
                const newY = circleCenterY + circleRadius * Math.sin(this.circleAngle);
                
                this.cursorTrail.updateTarget(newX, newY);
                this.circularMovementAnimationId = requestAnimationFrame(animateCircularly);
            };
            animateCircularly();
        }

        /**
         * Stops any active idle movement (circular).
         */
        stopIdleMovement() {
            if (!this.isMovementActive) return;
            this.isMovementActive = false;
            cancelAnimationFrame(this.circularMovementAnimationId);
        }
    }

    /**
     * Represents the trail of dots that follows the cursor.
     * Used by both RandomMovementController and CircularMovementController.
     */
    class CursorTrail {
        /**
         * @param {HTMLElement} container The DOM element to contain the trail dots.
         */
        constructor(container) {
            this.container = container;
            this.dots = [];
            this.targetX = window.innerWidth / 2;
            this.targetY = window.innerHeight / 2;
            this.hue = 0;
            this.velocity = 0;
            this.mouseHistory = [];
            this.animationFrameId = null;
            this.initializeDots();
        }

        /**
         * Creates the dot elements for the trail.
         */
        initializeDots() {
            const DOT_COUNT = 25;
            const BASE_SIZE = 16;
            for (let i = 0; i < DOT_COUNT; i++) {
                const dot = document.createElement('div');
                dot.className = 'cursor-dot';
                this.container.appendChild(dot);
                this.dots.push({
                    element: dot, x: this.targetX, y: this.targetY,
                    size: Math.max(BASE_SIZE - i * 0.6, 4),
                    speed: 0.15 - i * 0.004,
                    opacity: Math.max(0.9 - i * 0.03, 0.1)
                });
            }
        }

        /**
         * Updates the target position and calculates velocity.
         * @param {number} x The new X-coordinate for the target.
         * @param {number} y The new Y-coordinate for the target.
         */
        updateTarget(x, y) {
            this.targetX = x; this.targetY = y;
            this.mouseHistory.push({ x, y, time: Date.now() });
            if (this.mouseHistory.length > 3) this.mouseHistory.shift();
            if (this.mouseHistory.length >= 2) {
                const recent = this.mouseHistory[this.mouseHistory.length - 1];
                const old = this.mouseHistory[0];
                const distance = Math.sqrt((recent.x - old.x) ** 2 + (recent.y - old.y) ** 2);
                const time = recent.time - old.time;
                this.velocity = time > 0 ? distance / time * 10 : 0;
            }
        }

        /**
         * The main animation loop for the trail.
         */
        startAnimation() {
            const animate = () => {
                this.hue = (this.hue + 1) % 360;
                const color = `hsl(${this.hue}, 85%, 65%)`;
                const velocityFactor = Math.min(this.velocity / 5, 1);
                
                // Each dot follows the one in front of it.
                this.dots.forEach((dot, index) => {
                    if (index === 0) {
                        dot.x += (this.targetX - dot.x) * dot.speed;
                        dot.y += (this.targetY - dot.y) * dot.speed;
                    } else {
                        dot.x += (this.dots[index - 1].x - dot.x) * dot.speed;
                        dot.y += (this.dots[index - 1].y - dot.y) * dot.speed;
                    }
                    const adjustedOpacity = dot.opacity * (0.3 + velocityFactor * 0.7);
                    const adjustedSize = dot.size * (0.8 + velocityFactor * 0.4);
                    dot.element.style.transform = `translate3d(${dot.x - adjustedSize/2}px, ${dot.y - adjustedSize/2}px, 0)`;
                    dot.element.style.width = `${adjustedSize}px`;
                    dot.element.style.height = `${adjustedSize}px`;
                    dot.element.style.backgroundColor = color;
                    dot.element.style.opacity = adjustedOpacity;
                    if (index === 0) { // Add a glow to the head of the trail.
                        dot.element.style.boxShadow = `0 0 ${20 + velocityFactor * 15}px ${color}`;
                    }
                });
                this.velocity *= 0.95; // Gradually decrease velocity.
                this.animationFrameId = requestAnimationFrame(animate);
            };
            animate();
        }

        /**
         * Creates a burst of particles on click.
         * @param {number} x The X-coordinate of the click.
         * @param {number} y The Y-coordinate of the click.
         */
        addClickBurst(x, y) {
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed; width: 6px; height: 6px; border-radius: 50%;
                    background: hsl(${this.hue}, 80%, 60%); pointer-events: none;
                    z-index: 9998; left: ${x}px; top: ${y}px;
                    animation: burstParticle 0.8s ease-out forwards;
                    transform-origin: center;
                `;
                const angle = (i / 8) * Math.PI * 2;
                const distance = 50 + Math.random() * 30;
                particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}px`);
                particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}px`);
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 800); // Clean up particle from DOM.
            }
        }
        
        /**
         * Stops the animation loop.
         */
        stopAnimation() {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    /**
     * Initializes the toggle switch for enabling/disabling the custom cursor.
     * When checked, the effect is OFF. When unchecked, the effect is ON.
     */
    function initializeCursorToggle() {
        const toggle = document.getElementById('cursor-toggle');
        const container = document.getElementById('cursor-container');

        // Start with the effect enabled by default, as the toggle is initially unchecked.
        currentCursorController = new CircularMovementController(container);
        currentCursorController.start();

        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Checkbox is checked: Turn OFF the custom cursor effect.
                if (currentCursorController) {
                    currentCursorController.stop();
                }
                container.style.display = 'none'; // Hide the effect container.
                document.body.classList.add('show-default-cursor'); // Show the default system cursor.
            } else {
                // Checkbox is unchecked: Turn ON the custom cursor effect.
                document.body.classList.remove('show-default-cursor'); // Hide the default cursor.
                container.style.display = 'block'; // Show the effect container.
                currentCursorController = new CircularMovementController(container); // Re-initialize the effect.
                currentCursorController.start();
            }
        });
    }

    /**
     * Initializes the tab navigation system.
     */
    function initializeTabNavigation() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const contentSections = document.querySelectorAll('.content-section');
        const playlistId = 'PLRhHN32maGg1DyfTL42cJ2aUv9T8Do_DA';
        let musicLoaded = false;

        /**
         * Displays a specific content section and updates tab state.
         * @param {string} targetSectionId The ID of the content section to show.
         * @param {boolean} updateHistory Whether to update browser history or not.
         */
        function showSection(targetSectionId, updateHistory = true) {
            contentSections.forEach(section => section.classList.remove('active-content'));
            tabLinks.forEach(link => link.classList.remove('active-tab'));

            const activeSection = document.getElementById(targetSectionId);
            const activeLink = document.querySelector(`.tab-link[data-section="${targetSectionId}"]`);

            if (activeSection) activeSection.classList.add('active-content');
            if (activeLink) {
                activeLink.classList.add('active-tab');
                if (updateHistory) history.pushState(null, '', activeLink.getAttribute('href'));
            }

            // If the Music tab is clicked and videos haven't been loaded yet.
            if (targetSectionId === 'music-content' && !musicLoaded) {
                loadMusicPlaylist(playlistId);
                musicLoaded = true; // Set flag to true to prevent reloading.
            }
        }

        tabLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                showSection(link.getAttribute('data-section'), true);
            });
        });

        /**
         * Handles page load and back/forward button clicks.
         */
        function handleHashChange() {
            const hash = window.location.hash;
            let sectionIdToShow = 'about-content'; // Default section.
            if (hash) {
                const correspondingLink = document.querySelector(`.tab-link[href="${hash}"]`);
                if (correspondingLink) {
                    sectionIdToShow = correspondingLink.getAttribute('data-section');
                }
            }
            showSection(sectionIdToShow, false);
        }

        window.addEventListener('popstate', handleHashChange);
        handleHashChange(); // Set initial tab on page load.
    }

    /**
     * Initializes other minor interactive effects.
     */
function initializeInteractiveEffects() {
    const videoCarousel = document.querySelector('.video-carousel');
    if (videoCarousel) {
        videoCarousel.addEventListener('wheel', (e) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            videoCarousel.scrollLeft += e.deltaY;
        });
    }
}


/**
 * Initializes all functionality for the modal pop-up.
 */
function initializeModalFunctionality() {
    // Avatar Modal
    const avatar = document.getElementById('avatar');
    const avatarModal = document.getElementById('avatarModal');
    const avatarModalClose = avatarModal?.querySelector('.avatar-modal-close');
    const avatarDownloadBtn = avatarModal?.querySelector('.avatar-modal-download:not([data-qr])');

    if (avatar && avatarModal) {
        avatar.style.cursor = 'pointer';
        avatar.addEventListener('click', () => {
            avatarModal.style.display = 'block';
            document.querySelector('.container').classList.add('modal-open');
        });

        const closeAvatarModal = () => {
            avatarModal.style.display = 'none';
            document.querySelector('.container').classList.remove('modal-open');
        };

        avatarModalClose?.addEventListener('click', closeAvatarModal);

        avatarModal.addEventListener('click', (e) => {
            if (e.target === avatarModal) {
                closeAvatarModal();
            }
        });

        avatarDownloadBtn?.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'avatar.jpg';
            link.download = 'avatar.jpg';
            link.click();
        });
        
    }

    // QR Modal
    const qrModal = document.getElementById('qrModal');
    const qrModalClose = qrModal?.querySelector('.avatar-modal-close');
    const qrDownloadBtn = qrModal?.querySelector('.avatar-modal-download[data-qr]');

    if (qrModal) {
        const closeQRModal = () => {
            qrModal.style.display = 'none';
            document.querySelector('.container').classList.remove('modal-open');
        };

        qrModalClose?.addEventListener('click', closeQRModal);

        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                closeQRModal();
            }
        });

        qrDownloadBtn?.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'link.jpg';
            link.download = 'qr-code.jpg';
            link.click();
        });
    }

    // Share functionality
    const shareButton = document.getElementById('shareButton');
    const shareModal = document.getElementById('shareModal');
    const shareOverlay = document.getElementById('shareOverlay');
    const copyLinkBtn = shareModal?.querySelector('.copy-link-btn');
    const shareOptions = shareModal?.querySelectorAll('.share-option');
    const qrButton = shareModal?.querySelector('.qr-button');

    if (shareButton && shareModal && shareOverlay) {
        shareButton.addEventListener('click', () => {
            shareModal.style.display = 'block';
            shareOverlay.style.display = 'block';
        });

        shareOverlay.addEventListener('click', () => {
            shareModal.style.display = 'none';
            shareOverlay.style.display = 'none';
        });

        copyLinkBtn?.addEventListener('click', () => {
            const input = document.getElementById('shareLink');
            input.select();
            document.execCommand('copy');
            copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
        });

        shareOptions?.forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.getAttribute('data-platform');
                const url = encodeURIComponent('https://Diffone7.github.io/prf/');
                const text = encodeURIComponent('Check out this profile!');
                
                let shareUrl = '';
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                        break;
                    case 'telegram':
                        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${text}%20${url}`;
                        break;
                }
                if (shareUrl) window.open(shareUrl, '_blank');
            });
        });

qrButton?.addEventListener('click', () => {
    shareModal.style.display = 'none';
    shareOverlay.style.display = 'none';
    if (qrModal) {
        // Tạo QR code bằng API
        const qrImage = document.getElementById('qrCodeImage');
        const url = encodeURIComponent('https://Diffone7.github.io/prf/');
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${url}`;
        
        qrModal.style.display = 'block';
        document.querySelector('.container').classList.add('modal-open');
    }
});
const decorationButton = document.getElementById('decorationButton');
const decorationModal = document.getElementById('decorationModal');
const decorationModalClose = decorationModal?.querySelector('.decoration-modal-close');

if (decorationButton && decorationModal) {
    const openDecorationModal = () => {
        decorationModal.style.display = 'block';
        document.querySelector('.container').classList.add('modal-open');
    };

    const closeDecorationModal = () => {
        decorationModal.style.display = 'none';
        document.querySelector('.container').classList.remove('modal-open');
    };

    decorationButton.addEventListener('click', openDecorationModal);
    decorationModalClose?.addEventListener('click', closeDecorationModal);

    decorationModal.addEventListener('click', (e) => {
        if (e.target === decorationModal) {
            closeDecorationModal();
        }
    });
}
    }

    // Existing dream modal code
    window.openDreamModal = function() {
        const modal = document.getElementById('dreamModal');
        if (modal) {
            modal.style.display = 'block';
            document.querySelector('.container').classList.add('modal-open');
        }
    };

    window.closeDreamModal = function() {
        const modal = document.getElementById('dreamModal');
        if (modal) {
            modal.style.display = 'none';
            document.querySelector('.container').classList.remove('modal-open');
        }
    };

    // Close modals on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (avatarModal && avatarModal.style.display === 'block') {
                avatarModal.style.display = 'none';
            }
            if (qrModal && qrModal.style.display === 'block') {
                qrModal.style.display = 'none';
            }
            if (shareModal && shareModal.style.display === 'block') {
                shareModal.style.display = 'none';
            }
            if (shareOverlay && shareOverlay.style.display === 'block') {
                shareOverlay.style.display = 'none';
            }
            document.querySelector('.container')?.classList.remove('modal-open');
            
            const dreamModal = document.getElementById('dreamModal');
            if (dreamModal && dreamModal.style.display === 'block') {
                window.closeDreamModal();
            }
            const taglineModal = document.getElementById('taglineModal');
            if (taglineModal && taglineModal.style.display === 'block') {
                closeTaglineModal();
            }
            const visitingTaglineModal = document.getElementById('visitingTaglineModal');
            if (visitingTaglineModal && visitingTaglineModal.style.display === 'block') {
                closeVisitingTaglineModal();
            }
        }
    });
    
}

    /**
     * Initializes the click particle burst effect.
     */
    function initializeClickEffect() {
        window.addEventListener('click', (event) => {
            // Ensure a cursor controller is active.
            if (currentCursorController && currentCursorController.cursorTrail) {
                // Prevent the effect from triggering on UI elements like the close button or slider.
                if (event.target.classList.contains('close-btn') || event.target.classList.contains('slider') || event.target.classList.contains('tagline-close-btn')) {
                    return;
                }
                // Trigger the burst effect.
                currentCursorController.cursorTrail.addClickBurst(event.clientX, event.clientY);
            }
        });
    }
