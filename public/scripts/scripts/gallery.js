"use strict";
class GalleryManager {
    constructor() {
        this.albums = document.querySelectorAll('.album-card');
        this.albumSections = document.querySelectorAll('.album-photos');
        this.backButtons = document.querySelectorAll('.back-to-albums');
        this.albumsSection = document.querySelector('.albums-section');
        this.init();
    }
    init() {
        this.albums.forEach(album => {
            album.addEventListener('click', (e) => {
                e.preventDefault();
                const albumName = album.getAttribute('data-album');
                this.showAlbum(albumName);
            });
        });
        this.backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAlbumsList();
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.showAlbumsList();
            }
        });
        console.log('✅ GalleryManager initialized');
    }
    showAlbum(albumName) {
        if (!albumName)
            return;
        this.albumSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetAlbum = document.getElementById(`${albumName}-album`);
        if (targetAlbum) {
            targetAlbum.classList.add('active');
            targetAlbum.scrollIntoView({ behavior: 'smooth' });
            if (this.albumsSection) {
                this.albumsSection.style.display = 'none';
            }
        }
        gsap.fromTo('.album-photos.active', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    }
    showAlbumsList() {
        this.albumSections.forEach(section => {
            section.classList.remove('active');
        });
        if (this.albumsSection) {
            this.albumsSection.style.display = 'block';
            gsap.fromTo('.albums-grid', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new GalleryManager();
    gsap.from('.album-card', {
        scrollTrigger: {
            trigger: '.albums-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    });
});
//# sourceMappingURL=gallery.js.map