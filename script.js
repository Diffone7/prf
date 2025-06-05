document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.body;

    startColorAnimation();

    function startColorAnimation() {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        // Tăng hệ số ở đây để màu thay đổi nhanh hơn
        let rSpeed = (Math.random() - 0.5) * 2.0; // Tăng từ 0.8 lên 2.0
        let gSpeed = (Math.random() - 0.5) * 2.0; // Tăng từ 0.8 lên 2.0
        let bSpeed = (Math.random() - 0.5) * 2.0; // Tăng từ 0.8 lên 2.0

        function updateColor() {
            r += rSpeed; g += gSpeed; b += bSpeed;
            if (r > 255 || r < 0) { rSpeed *= -1; r = Math.max(0, Math.min(255, r)); }
            if (g > 255 || g < 0) { gSpeed *= -1; g = Math.max(0, Math.min(255, g)); }
            if (b > 255 || b < 0) { bSpeed *= -1; b = Math.max(0, Math.min(255, b)); }

            bodyElement.style.backgroundColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
            requestAnimationFrame(updateColor);
        }
        requestAnimationFrame(updateColor);
    }

    const tabLinks = document.querySelectorAll('.tab-link');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(targetSectionId, updateHistory = true) {
        contentSections.forEach(section => {
            section.classList.remove('active-content');
        });
        tabLinks.forEach(link => {
            link.classList.remove('active-tab');
        });

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

    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionIdToShow = link.getAttribute('data-section');
            showSection(sectionIdToShow, true);
        });
    });

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
});
