// app/routes/admin/photo-upload/photo-upload.tsx
import { Navbar } from "~/components/layout/navbar/navbar";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import "./photo-upload.css";

interface UploadProgress {
    filename: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    url?: string;
    uploadId?: string;
    parts?: { partNumber: number; etag: string; }[];
}

interface PhotoAlbum {
    id: string;
    name: string;
    description?: string;
    clientEmail?: string;
    shootDate?: string;
    createdAt: string;
    photoCount?: number;
}

interface Reservation {
    id: string;
    customerName: string;
    customerEmail?: string;
    serviceType?: string;
    reservationDate?: string;
    reservationTime?: string;
    createdAt: string;
    orderDetails: any;
    totalAmount: number;
    wasUsed?: boolean;
}

interface Photo {
    key: string;
    size: number;
    uploaded: string;
    url: string;
    metadata?: {
        contentType?: string;
        [key: string]: any;
    };
}

interface CreateAlbumResponse {
    success: boolean;
    data: {
        album: PhotoAlbum;
    };
    message: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Interfaces pour les réponses multipart
interface MultipartInitResponse {
    uploadId: string;
    key: string;
}

interface MultipartPartResponse {
    partNumber: number;
    etag: string;
    size: number;
}

interface MultipartCompleteResponse {
    success: boolean;
    message: string;
    key: string;
    url: string;
    etag: string;
    size: number;
}

interface ErrorResponse {
    error: string;
    details?: string;
}

// Configuration multipart OPTIMISÉE
const CHUNK_SIZE = 5 * 1024 * 1024; // Réduit à 5MB pour éviter les timeouts
const MAX_CONCURRENT_UPLOADS = 3; // Réduit le parallélisme
const UPLOAD_TIMEOUT = 30000; // 30 secondes de timeout

// Fonction pour normaliser les noms de dossiers (supprime les caractères spéciaux)
const normalizeFolderName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
        .replace(/\s+/g, '-') // Remplace les espaces par des tirets
        .replace(/-+/g, '-') // Supprime les tirets multiples
        .substring(0, 100); // Limite la longueur
};

export default function PhotoUpload() {
    const [currentAlbum, setCurrentAlbum] = useState<PhotoAlbum | null>(null);
    const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<string>('');
    const [currentAlbumPhotos, setCurrentAlbumPhotos] = useState<Photo[]>([]);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Charger les albums au montage
    useEffect(() => {
        loadAlbums();
        loadReservations();
    }, []);

    // Charger les photos quand l'album change
    useEffect(() => {
        if (currentAlbum) {
            loadAlbumPhotos(currentAlbum.id);
        } else {
            setCurrentAlbumPhotos([]);
        }
    }, [currentAlbum]);

    const loadReservations = async () => {
        try {
            const response = await fetch('/api/reservations/for-albums');
            if (response.ok) {
                const result: ApiResponse<{ reservations: Reservation[] }> = await response.json();
                if (result.success && result.data) {
                    setReservations(result.data.reservations);
                    console.log('✅ Réservations chargées:', result.data.reservations);
                }
            } else {
                console.error('❌ Erreur réponse API réservations:', response.status);
            }
        } catch (error) {
            console.error('❌ Erreur chargement réservations:', error);
        }
    };

    const loadAlbums = async () => {
        try {
            const response = await fetch('/api/albums');
            if (response.ok) {
                const result: ApiResponse<{ albums: PhotoAlbum[] }> = await response.json();
                if (result.success && result.data) {
                    setAlbums(result.data.albums);
                    console.log('✅ Albums chargés:', result.data.albums);
                }
            } else {
                console.error('❌ Erreur réponse API albums:', response.status);
            }
        } catch (error) {
            console.error('❌ Erreur chargement albums:', error);
        }
    };

    const loadAlbumPhotos = async (albumId: string) => {
        setIsLoadingPhotos(true);
        try {
            console.log('🔄 Chargement photos pour album ID:', albumId);
            const response = await fetch(`/api/albums/${albumId}/photos`);

            if (response.ok) {
                const result: ApiResponse<{ photos: Photo[] }> = await response.json();
                console.log('📸 Réponse API photos:', result);

                if (result.success && result.data) {
                    setCurrentAlbumPhotos(result.data.photos);
                    console.log('✅ Photos chargées:', result.data.photos.length);
                } else {
                    console.error('❌ Erreur dans la réponse:', result.error);
                }
            } else {
                console.error('❌ Erreur HTTP chargement photos:', response.status);
                const errorText = await response.text();
                console.error('❌ Détails erreur:', errorText);
            }
        } catch (error) {
            console.error('❌ Erreur chargement photos:', error);
        } finally {
            setIsLoadingPhotos(false);
        }
    };

    const deleteAlbum = async (album: PhotoAlbum) => {
        if (!confirm(`Êtes-vous sûr de vouloir archiver l'album "${album.name}" ?\n\nCette action supprimera toutes les photos associées dans R2 mais conservera les données de réservation pour votre comptabilité.\n\nCette action est irréversible pour les photos.`)) {
            return;
        }

        setIsDeleting(`album-${album.id}`);
        try {
            const response = await fetch(`/api/albums/${album.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Supprimer l'album de la liste
                setAlbums(prev => prev.filter(a => a.id !== album.id));

                // Si l'album courant est celui supprimé, le désélectionner
                if (currentAlbum?.id === album.id) {
                    setCurrentAlbum(null);
                    setCurrentAlbumPhotos([]);
                }

                alert('✅ Album archivé avec succès\n\nLes photos ont été supprimées de R2 et les données de réservation conservées.');
            } else {
                const errorData = await response.json() as { error?: string };
                alert(`❌ Erreur lors de l'archivage: ${errorData.error || 'Erreur inconnue'}`);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('❌ Erreur archivage album:', error.message);
                alert(`❌ Erreur: ${error.message}`);
            } else {
                console.error('❌ Erreur archivage album:', error);
                alert('❌ Erreur lors de l\'archivage de l\'album');
            }
        } finally {
            setIsDeleting(null);
        }
    };

    // Supprimer une photo
    const deletePhoto = async (photo: Photo) => {
        const filename = photo.key.split('/').pop();
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la photo "${filename}" ? Cette action est irréversible.`)) {
            return;
        }

        if (!currentAlbum) return;

        setIsDeleting(photo.key);
        try {
            const response = await fetch(`/api/albums/${currentAlbum.id}/photos/${filename}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setCurrentAlbumPhotos(prev => prev.filter(p => p.key !== photo.key));
                alert('✅ Photo supprimée avec succès');
            } else {
                const errorData = await response.json() as { error?: string };
                alert(`❌ Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('❌ Erreur suppression photo:', error.message);
                alert(`❌ Erreur: ${error.message}`);
            } else {
                console.error('❌ Erreur suppression photo:', error);
                alert('❌ Erreur lors de la suppression de la photo');
            }
        } finally {
            setIsDeleting(null);
        }
    };

    // Gestionnaire de drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (!currentAlbum) {
            alert("Veuillez d'abord sélectionner ou créer un album");
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, [currentAlbum]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentAlbum) {
            alert("Veuillez d'abord sélectionner ou créer un album");
            return;
        }

        const files = Array.from(e.target.files || []);
        handleFiles(files);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [currentAlbum]);

    const handleFiles = async (files: File[]) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/tiff',
            'image/bmp'
        ];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));

        if (validFiles.length === 0) {
            alert("Aucun fichier valide. Types acceptés: JPG, PNG, WebP, HEIC, TIFF, BMP");
            return;
        }

        const newProgress: UploadProgress[] = validFiles.map(file => ({
            filename: file.name,
            progress: 0,
            status: 'pending'
        }));

        setUploadProgress(prev => [...prev, ...newProgress]);

        if (!currentAlbum) {
            alert("Aucun album sélectionné");
            return;
        }

        console.log('📤 Début upload de', validFiles.length, 'fichiers vers album:', currentAlbum.name);

        // Upload séquentiel au lieu de parallèle pour éviter les timeouts
        for (let i = 0; i < validFiles.length; i++) {
            await uploadFileMultipart(validFiles[i], currentAlbum, uploadProgress.length + i);
        }

        // Recharger les photos après l'upload
        setTimeout(() => {
            if (currentAlbum) {
                console.log('🔄 Rechargement des photos après upload...');
                loadAlbumPhotos(currentAlbum.id);
            }
        }, 2000);
    };

    // Fonction utilitaire pour parser les réponses JSON avec typage sécurisé
    const parseJsonResponse = async <T,>(response: Response): Promise<T> => {
        const text = await response.text();
        try {
            return JSON.parse(text) as T;
        } catch {
            throw new Error(`Réponse JSON invalide: ${text.substring(0, 100)}`);
        }
    };

    // Fonction fetch avec timeout
    const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = UPLOAD_TIMEOUT): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

    const uploadFileMultipart = async (file: File, album: PhotoAlbum, index: number) => {
        setUploadProgress(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, status: 'uploading', progress: 5 } : item
            )
        );

        let uploadId: string | undefined;

        try {
            // Utiliser directement le nom d'album comme identifiant de dossier
            const albumFolderName = normalizeFolderName(album.name);

            // Étape 1: Initialiser l'upload multipart
            const initUrl = `/api/multipart/init/${albumFolderName}/${encodeURIComponent(file.name)}`;
            console.log('🚀 Initialisation multipart:', initUrl, 'Album:', album.name);

            const initResponse = await fetchWithTimeout(initUrl, {
                method: 'POST'
            });

            if (!initResponse.ok) {
                const errorText = await initResponse.text();
                console.error('❌ Erreur init response:', errorText);
                let errorData: { error?: string } = { error: errorText };
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    // Garde la valeur par défaut
                }
                throw new Error(`Erreur initialisation: ${errorData.error || initResponse.statusText}`);
            }

            const initData = await parseJsonResponse<MultipartInitResponse>(initResponse);
            uploadId = initData.uploadId;

            console.log('✅ Init réussi, uploadId:', uploadId);

            setUploadProgress(prev =>
                prev.map((item, i) =>
                    i === index ? { ...item, uploadId, progress: 10 } : item
                )
            );

            // Étape 2: Découper le fichier et uploader les parties SÉQUENTIELLEMENT
            const totalParts = Math.ceil(file.size / CHUNK_SIZE);
            const parts: { partNumber: number; etag: string; }[] = [];

            console.log(`📁 Fichier ${file.name} - Taille: ${file.size} - Parties: ${totalParts}`);

            // Upload SÉQUENTIEL des parties pour éviter les timeouts
            for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
                const start = (partNumber - 1) * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const uploadUrl = `/api/multipart/upload/${albumFolderName}/${encodeURIComponent(file.name)}?uploadId=${uploadId}&partNumber=${partNumber}`;

                console.log(`📤 Upload partie ${partNumber}/${totalParts}: ${chunk.size} bytes`);

                try {
                    const uploadResponse = await fetchWithTimeout(uploadUrl, {
                        method: 'PUT',
                        body: chunk
                    }, 45000); // 45s timeout pour l'upload

                    if (!uploadResponse.ok) {
                        const errorText = await uploadResponse.text();
                        console.error(`❌ Erreur upload partie ${partNumber}:`, errorText);
                        let errorData: { error?: string } = { error: errorText };
                        try {
                            errorData = JSON.parse(errorText);
                        } catch {
                            // Garde la valeur par défaut
                        }
                        throw new Error(`Partie ${partNumber}: ${errorData.error || uploadResponse.statusText}`);
                    }

                    const partData = await parseJsonResponse<MultipartPartResponse>(uploadResponse);
                    console.log(`✅ Partie ${partNumber} uploadée:`, partData.etag);

                    parts.push({
                        partNumber: partNumber,
                        etag: partData.etag
                    });

                    // Mise à jour de la progression après chaque partie
                    const progress = 10 + (parts.length / totalParts) * 80;
                    setUploadProgress(prev =>
                        prev.map((item, i) =>
                            i === index ? { ...item, progress, parts } : item
                        )
                    );

                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        throw new Error(`Timeout lors de l'upload de la partie ${partNumber}. Le fichier est peut-être trop volumineux.`);
                    }
                    throw error;
                }
            }

            console.log(`🎯 Toutes les parties uploadées (${parts.length}), finalisation...`);

            // Étape 3: Finaliser l'upload
            const completeUrl = `/api/multipart/complete/${albumFolderName}/${encodeURIComponent(file.name)}?uploadId=${uploadId}`;
            const completeResponse = await fetchWithTimeout(completeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ parts })
            });

            if (!completeResponse.ok) {
                const errorText = await completeResponse.text();
                console.error('❌ Erreur finalisation:', errorText);
                let errorData: { error?: string } = { error: errorText };
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    // Garde la valeur par défaut
                }
                throw new Error(`Finalisation: ${errorData.error || completeResponse.statusText}`);
            }

            const completeData = await parseJsonResponse<MultipartCompleteResponse>(completeResponse);

            console.log('✅ Upload complet réussi:', completeData.url);

            setUploadProgress(prev =>
                prev.map((item, i) =>
                    i === index ? {
                        ...item,
                        status: 'completed',
                        progress: 100,
                        url: completeData.url
                    } : item
                )
            );

        } catch (error) {
            console.error(`❌ Erreur upload multipart ${file.name}:`, error);

            // Annuler l'upload en cas d'erreur
            if (uploadId && currentAlbum) {
                try {
                    const albumFolderName = normalizeFolderName(album.name);
                    const abortUrl = `/api/multipart/abort/${albumFolderName}/${encodeURIComponent(file.name)}?uploadId=${uploadId}`;
                    console.log('🛑 Annulation upload:', abortUrl);
                    await fetchWithTimeout(abortUrl, { method: 'DELETE' });
                } catch (abortError) {
                    console.error('❌ Erreur lors de l\'annulation:', abortError);
                }
            }

            let errorMessage = getErrorMessage(error);

            // Amélioration des messages d'erreur
            if (errorMessage.includes('408') || errorMessage.includes('Timeout')) {
                errorMessage = 'Timeout lors de l\'upload. Essayez avec un fichier plus petit ou une connexion plus stable.';
            } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
                errorMessage = 'Erreur temporaire du serveur. Réessayez dans quelques instants.';
            } else if (errorMessage.includes('Partie') && errorMessage.includes('5MB')) {
                errorMessage = 'Partie trop petite. Taille minimale: 5MB.';
            } else if (errorMessage.includes('Paramètres manquants')) {
                errorMessage = 'Erreur de configuration. Vérifiez que l\'album est sélectionné et le nom de fichier valide.';
            }

            setUploadProgress(prev =>
                prev.map((item, i) =>
                    i === index ? {
                        ...item,
                        status: 'error',
                        error: errorMessage
                    } : item
                )
            );
        }
    };

    const createNewAlbum = async (reservationId: string) => {
        try {
            const response = await fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId })
            });

            if (response.ok) {
                const result: CreateAlbumResponse = await response.json();
                if (result.success && result.data) {
                    setCurrentAlbum(result.data.album);
                    setAlbums(prev => [result.data.album, ...prev]);
                    setIsCreatingAlbum(false);
                    setSelectedReservation('');

                    // Recharger les réservations (celle utilisée n'est plus disponible)
                    loadReservations();

                    return result.data.album;
                }
            } else {
                const errorData = await response.json() as { error?: string };
                throw new Error(errorData.error || 'Erreur création album');
            }
        } catch (error) {
            console.error('❌ Erreur création album:', error);
            alert('Erreur lors de la création de l\'album: ' + getErrorMessage(error));
        }
    };

    function getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Rendu JSX
    return (
        <div className="photo-upload-page">
            <Navbar />
            <div className="photo-upload-container">
                <div className="upload-layout">
                    <div className="albums-panel">
                        <div className="panel-header">
                            <h3>Albums</h3>
                            <button
                                onClick={() => setIsCreatingAlbum(true)}
                                className="btn-primary"
                            >
                                + Nouvel Album
                            </button>
                        </div>
                        <div className="albums-list">
                            {albums.map(album => (
                                <div
                                    key={album.id}
                                    className={`album-item ${currentAlbum?.id === album.id ? 'active' : ''}`}
                                    onClick={() => setCurrentAlbum(album)}
                                >
                                    <div className="album-info">
                                        <strong>{album.name}</strong>
                                        <span>{album.description}</span>
                                        <small>Dossier: {normalizeFolderName(album.name)}</small>
                                        <small>Créé le: {new Date(album.createdAt).toLocaleDateString('fr-FR')}</small>
                                        {album.photoCount !== undefined && (
                                            <small>📸 {album.photoCount} photo(s)</small>
                                        )}
                                    </div>
                                    <button
                                        className="btn-delete-album"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteAlbum(album);
                                        }}
                                        disabled={isDeleting === `album-${album.id}`}
                                        title="Supprimer l'album et toutes ses photos"
                                    >
                                        {isDeleting === `album-${album.id}` ? '🗑️...' : '🗑️'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panneau de droite: Upload et progression */}
                    <div className="upload-panel">
                        {currentAlbum ? (
                            <>
                                <div className="current-album">
                                    <div className="album-header">
                                        <div>
                                            <h3>Album: {currentAlbum.name}</h3>
                                            <p>{currentAlbum.description}</p>
                                            <div className="folder-info">
                                                <small>📁 Dossier R2: albums/{normalizeFolderName(currentAlbum.name)}/</small>
                                                <small>📊 {currentAlbumPhotos.length} photo(s)</small>
                                                <small>🆔 ID: {currentAlbum.id}</small>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-delete-album"
                                            onClick={() => deleteAlbum(currentAlbum)}
                                            disabled={isDeleting === `album-${currentAlbum.id}`}
                                            title="Supprimer l'album et toutes ses photos"
                                        >
                                            {isDeleting === `album-${currentAlbum.id}` ? 'Suppression...' : 'Supprimer Album'}
                                        </button>
                                    </div>
                                </div>

                                {/* Zone de drop */}
                                <div
                                    className={`dropzone ${isDragOver ? 'active' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={triggerFileInput}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileInput}
                                        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.tiff,.bmp"
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                    <div className="dropzone-content">
                                        <div className="upload-icon">📁</div>
                                        {isDragOver ? (
                                            <p>Déposez les fichiers ici...</p>
                                        ) : (
                                            <>
                                                <p>Glissez-déposez vos photos ici, ou cliquez pour sélectionner</p>
                                                <small>Formats: JPG, PNG, WebP, HEIC, TIFF, BMP - Taille max recommandée: 50MB</small>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Progression des uploads */}
                                {uploadProgress.length > 0 && (
                                    <div className="upload-progress">
                                        <h4>Progression des Uploads ({uploadProgress.filter(p => p.status === 'completed').length}/{uploadProgress.length})</h4>
                                        {uploadProgress.map((item, index) => (
                                            <div key={index} className="progress-item">
                                                <div className="progress-info">
                                                    <span className="filename">{item.filename}</span>
                                                    <span className={`status status-${item.status}`}>
                                                        {item.status === 'completed' ? '✅' :
                                                            item.status === 'error' ? '❌' :
                                                                item.status === 'uploading' ? '⏫' : '⏳'}
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div
                                                        className={`progress-fill ${item.status}`}
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                                {item.error && (
                                                    <small className="error-text">{item.error}</small>
                                                )}
                                                {item.parts && (
                                                    <small className="parts-info">
                                                        Parties: {item.parts.length} uploadées
                                                    </small>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Liste des photos existantes */}
                                <div className="photos-list">
                                    <div className="photos-header">
                                        <h4>Photos dans l'album ({currentAlbumPhotos.length})</h4>
                                        <div className="photos-actions">
                                            <button
                                                onClick={() => currentAlbum && loadAlbumPhotos(currentAlbum.id)}
                                                className="btn-refresh"
                                                disabled={isLoadingPhotos}
                                                title="Actualiser la liste des photos"
                                            >
                                                {isLoadingPhotos ? '🔄...' : '🔄 Actualiser'}
                                            </button>
                                            {currentAlbumPhotos.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        if (currentAlbum) {
                                                            console.log('🔄 Forcer rechargement photos...');
                                                            loadAlbumPhotos(currentAlbum.id);
                                                        }
                                                    }}
                                                    className="btn-refresh"
                                                    title="Forcer le rechargement"
                                                >
                                                    🔄 Forcer
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isLoadingPhotos ? (
                                        <div className="loading-photos">
                                            <p>Chargement des photos...</p>
                                            <small>Vérification du dossier: albums/{normalizeFolderName(currentAlbum.name)}/</small>
                                        </div>
                                    ) : currentAlbumPhotos.length > 0 ? (
                                        <div className="photos-grid">
                                            {currentAlbumPhotos.map((photo, index) => (
                                                <div key={photo.key} className="photo-item">
                                                    <div className="photo-thumbnail">
                                                        <img
                                                            src={photo.url}
                                                            alt={photo.key.split('/').pop()}
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                console.error('❌ Erreur chargement image:', photo.url);
                                                                e.currentTarget.src = '/placeholder-image.jpg';
                                                            }}
                                                        />
                                                        <div className="photo-overlay">
                                                            <button
                                                                className="btn-delete-photo"
                                                                onClick={() => deletePhoto(photo)}
                                                                disabled={isDeleting === photo.key}
                                                                title="Supprimer cette photo"
                                                            >
                                                                {isDeleting === photo.key ? '🗑️...' : '🗑️'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="photo-info">
                                                        <span className="photo-filename">
                                                            {photo.key.split('/').pop()}
                                                        </span>
                                                        <span className="photo-size">
                                                            {(photo.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                        <span className="photo-date">
                                                            {new Date(photo.uploaded).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-photos">
                                            <div className="placeholder-icon">📷</div>
                                            <p>Aucune photo dans cet album.</p>
                                            <p>Utilisez la zone de drop ci-dessus pour ajouter des photos.</p>
                                            <div className="debug-info">
                                                <small>Dossier R2: albums/{normalizeFolderName(currentAlbum.name)}/</small>
                                                <small>ID Album: {currentAlbum.id}</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="no-album-selected">
                                <div className="placeholder-icon">🎞️</div>
                                <h3>Aucun album sélectionné</h3>
                                <p>Sélectionnez un album existant ou créez-en un nouveau pour commencer l'upload.</p>
                                <button
                                    onClick={() => setIsCreatingAlbum(true)}
                                    className="btn-primary"
                                >
                                    Créer un Nouvel Album
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de création d'album */}
                {isCreatingAlbum && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Créer un Nouvel Album à partir d'une Réservation</h3>

                            {reservations.length === 0 ? (
                                <div className="no-reservations">
                                    <p>Aucune réservation disponible pour créer un album.</p>
                                    <p>Les réservations déjà utilisées pour des albums ne sont pas affichées.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Sélectionner une réservation *</label>
                                        <select
                                            value={selectedReservation}
                                            onChange={(e) => setSelectedReservation(e.target.value)}
                                            className="form-select"
                                        >
                                            <option value="">Choisir une réservation...</option>
                                            {reservations.map(reservation => (
                                                <option key={reservation.id} value={reservation.id}>
                                                    {reservation.customerName} - {reservation.serviceType} -
                                                    {reservation.reservationDate ? ` ${new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}` : ''}
                                                    {reservation.reservationTime ? ` à ${reservation.reservationTime}` : ''}
                                                    {reservation.totalAmount ? ` - ${reservation.totalAmount}€` : ''}
                                                    {reservation.wasUsed ? ' (Réutilisable)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedReservation && (
                                        <div className="reservation-preview">
                                            <h4>Détails de la réservation sélectionnée :</h4>
                                            {(() => {
                                                const reservation = reservations.find(r => r.id === selectedReservation);
                                                if (!reservation) return null;

                                                return (
                                                    <div className="reservation-details">
                                                        {reservation.wasUsed && (
                                                            <div className="reusable-notice">
                                                                <small>🔄 Cette réservation a déjà été utilisée mais peut être réutilisée</small>
                                                            </div>
                                                        )}
                                                        <p><strong>Client:</strong> {reservation.customerName}</p>
                                                        <p><strong>Email:</strong> {reservation.customerEmail || 'Non renseigné'}</p>
                                                        <p><strong>Service:</strong> {reservation.serviceType || 'Non spécifié'}</p>
                                                        {reservation.reservationDate && (
                                                            <p><strong>Date:</strong> {new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}</p>
                                                        )}
                                                        {reservation.reservationTime && (
                                                            <p><strong>Heure:</strong> {reservation.reservationTime}</p>
                                                        )}
                                                        <p><strong>Dossier R2:</strong> albums/{normalizeFolderName(reservation.customerName)}/</p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCreatingAlbum(false);
                                                setSelectedReservation('');
                                            }}
                                            className="btn-secondary"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => selectedReservation && createNewAlbum(selectedReservation)}
                                            disabled={!selectedReservation}
                                            className="btn-primary"
                                        >
                                            Créer l'Album
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}