// Todo : src/scripts/gallery.ts
// Gallery functionality
class GalleryManager {
    private albums: NodeListOf<Element>;
    private albumSections: NodeListOf<Element>;
    private backButtons: NodeListOf<Element>;
    private albumsSection: HTMLElement | null;

    constructor() {
        this.albums = document.querySelectorAll('.album-card');
        this.albumSections = document.querySelectorAll('.album-photos');
        this.backButtons = document.querySelectorAll('.back-to-albums');
        this.albumsSection = document.querySelector('.albums-section');

        this.init();
    }

    private init(): void {
        // Add click events to album cards
        this.albums.forEach(album => {
            album.addEventListener('click', (e) => {
                e.preventDefault();
                const albumName = album.getAttribute('data-album');
                this.showAlbum(albumName);
            });
        });

        // Add click events to back buttons
        this.backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAlbumsList();
            });
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.showAlbumsList();
            }
        });

        console.log('✅ GalleryManager initialized');
    }

    private showAlbum(albumName: string | null): void {
        if (!albumName) return;

        // Hide all album sections
        this.albumSections.forEach(section => {
            section.classList.remove('active');
        });

        // Show selected album
        const targetAlbum = document.getElementById(`${albumName}-album`);
        if (targetAlbum) {
            targetAlbum.classList.add('active');

            // Scroll to album
            targetAlbum.scrollIntoView({ behavior: 'smooth' });

            // Hide albums grid
            if (this.albumsSection) {
                this.albumsSection.style.display = 'none';
            }
        }

        // Animate album entrance
        gsap.fromTo('.album-photos.active',
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
    }

    private showAlbumsList(): void {
        // Hide all album sections
        this.albumSections.forEach(section => {
            section.classList.remove('active');
        });

        // Show albums grid
        if (this.albumsSection) {
            this.albumsSection.style.display = 'block';

            // Animate albums grid entrance
            gsap.fromTo('.albums-grid',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            );
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GalleryManager();

    // Add GSAP animations for album cards
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