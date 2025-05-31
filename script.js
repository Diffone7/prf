document.addEventListener('DOMContentLoaded', () => {
    const backgroundContainer = document.getElementById('background-container');
    const backgroundVideo = document.getElementById('background-video');
    const backgroundMusic = document.getElementById('background-music');
    const toggleMusicBtn = document.getElementById('toggle-music-btn');

    let isMusicPlaying = false;
    startColorAnimation();
function startColorAnimation() {
    const backgroundContainer = document.body; 
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);

    let rSpeed = (Math.random() - 0.5) * 2;
    let gSpeed = (Math.random() - 0.5) * 2;
    let bSpeed = (Math.random() - 0.5) * 2; 

    function updateColor() {
        r += rSpeed;
        g += gSpeed;
        b += bSpeed;

        if (r > 255 || r < 0) {
            rSpeed *= -1;
            r = Math.max(0, Math.min(255, r));
        }
        if (g > 255 || g < 0) {
            gSpeed *= -1;
            g = Math.max(0, Math.min(255, g));
        }
        if (b > 255 || b < 0) {
            bSpeed *= -1;
            b = Math.max(0, Math.min(255, b));
        }

        const finalR = Math.round(r);
        const finalG = Math.round(g);
        const finalB = Math.round(b);

        backgroundContainer.style.backgroundColor = `rgb(${finalR}, ${finalG}, ${finalB})`;

        requestAnimationFrame(updateColor);
    }

    requestAnimationFrame(updateColor);
}
    toggleMusicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            toggleMusicBtn.textContent = '🎶 Play';
        } else {
            alert("Monody - The Fat Rat");
            backgroundMusic.play().then(() => {
                toggleMusicBtn.textContent = '🔇 Stop';
            }).catch(error => {
                console.log("Music autoplay prevented:", error);
            });
        }
        isMusicPlaying = !isMusicPlaying;
    });
});
