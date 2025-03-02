document.addEventListener('DOMContentLoaded', () => {
    const errorDiv = document.getElementById('error');
    const thumbnailImage = document.getElementById('thumbnailImage');
    const downloadBtn = document.getElementById('downloadBtn');
    let currentThumbnailUrl = '';

    // Initially hide the thumbnail and button until we load
    thumbnailImage.style.display = 'none';
    downloadBtn.style.display = 'none';

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const videoId = extractVideoId(url);

        if (!videoId) {
            showError('Please open a YouTube video page');
            return;
        }

        // Get the highest quality thumbnail
        currentThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        thumbnailImage.src = currentThumbnailUrl;
        
        // Show thumbnail and button when image loads successfully
        thumbnailImage.onload = () => {
            thumbnailImage.style.display = 'block';
            downloadBtn.style.display = 'block';
            errorDiv.style.display = 'none';
        };
        
        // Handle 404 for maxresdefault
        thumbnailImage.onerror = () => {
            currentThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            thumbnailImage.src = currentThumbnailUrl;
            // Try again with the lower quality thumbnail
            thumbnailImage.onload = () => {
                thumbnailImage.style.display = 'block';
                downloadBtn.style.display = 'block';
                errorDiv.style.display = 'none';
            };
        };
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentThumbnailUrl) {
            showError('No thumbnail available');
            return;
        }
        downloadThumbnail(currentThumbnailUrl);
    });

    function extractVideoId(url) {
        if (!url) return null;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        thumbnailImage.style.display = 'none';
        downloadBtn.style.display = 'none';
    }

    function downloadThumbnail(url) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'youtube-thumbnail.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
            })
            .catch(() => {
                showError('Failed to download thumbnail');
            });
    }
}); 