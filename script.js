document.addEventListener('DOMContentLoaded', () => {
    // Create animated particles
    function createParticles() {
        const particlesContainer = document.querySelector('.particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    createParticles();

    // Tab navigation with smooth transitions
    const tabLinks = document.querySelectorAll('.tab-link');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(targetSectionId, updateHistory = true) {
        // Remove active classes
        contentSections.forEach(section => {
            section.classList.remove('active-content');
        });
        tabLinks.forEach(link => {
            link.classList.remove('active-tab');
        });

        // Add active classes
        const activeSection = document.getElementById(targetSectionId);
        const activeLink = document.querySelector(`.tab-link[data-section="${targetSectionId}"]`);

        if (activeSection) {
            activeSection.classList.add('active-content');
        }
        if (activeLink) {
            activeLink.classList.add('active-tab');
            if (updateHistory) {
                history.pushState(null, '', activeLink.getAttribute('href'));
            }
        }
    }

    // Handle tab clicks
    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionIdToShow = link.getAttribute('data-section');
            showSection(sectionIdToShow, true);
        });
    });

    // Handle hash changes and initial load
    function handleHashChange() {
        const hash = window.location.hash;
        let sectionIdToShow = 'about-content';
        let targetHash = '#about';

        if (hash) {
            const correspondingLink = document.querySelector(`.tab-link[href="${hash}"]`);
            if (correspondingLink) {
                sectionIdToShow = correspondingLink.getAttribute('data-section');
                targetHash = hash;
            } else {
                history.replaceState(null, '', targetHash);
            }
        } else {
            history.replaceState(null, '', targetHash);
        }
        showSection(sectionIdToShow, false);
    }

    window.addEventListener('popstate', handleHashChange);
    handleHashChange();

    // Enhanced hover effects
    const bioLinks = document.querySelectorAll('.bio-link');
    bioLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-2px) scale(1.02)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Smooth scrolling for video carousel
    const videoCarousel = document.querySelector('.video-carousel');
    if (videoCarousel) {
        videoCarousel.addEventListener('wheel', (e) => {
            e.preventDefault();
            videoCarousel.scrollLeft += e.deltaY;
        });
    }
});

// Dream modal functionality
function openDreamModal() {
    document.getElementById('dreamModal').style.display = 'block';
}

function closeDreamModal() {
    document.getElementById('dreamModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('dreamModal');
    if (event.target === modal) {
        closeDreamModal();
    }
}
