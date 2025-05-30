document.addEventListener('DOMContentLoaded', () => {
    const backgroundContainer = document.getElementById('background-container');
    const backgroundVideo = document.getElementById('background-video');
    const backgroundMusic = document.getElementById('background-music');
    const toggleMusicBtn = document.getElementById('toggle-music-btn');

    let isMusicPlaying = false;

    if (backgroundVideo) {
        backgroundVideo.play().catch(error => {
            console.log("Video autoplay prevented:", error);

        });
    } else {
        function getRandomColor() {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgb(${r}, ${g}, ${b})`;
        }

        function animateBackgroundColor() {
            const color1 = getRandomColor();
            const color2 = getRandomColor();
            backgroundContainer.style.backgroundImage = `linear-gradient(45deg, ${color1}, ${color2})`;
        }

        setInterval(animateBackgroundColor, 5000); 

        animateBackgroundColor(); 
    }
    toggleMusicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            toggleMusicBtn.textContent = '🔇 Stop';
        } else {
            alert("Monody - The Fat Rat");
            backgroundMusic.play().then(() => {
                toggleMusicBtn.textContent = '🎶 Play';
            }).catch(error => {
                console.log("Music autoplay prevented:", error);
            });
        }
        isMusicPlaying = !isMusicPlaying;
    });
});
