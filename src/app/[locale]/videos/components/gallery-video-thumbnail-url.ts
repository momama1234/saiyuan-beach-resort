// hqdefault (480x360) is guaranteed to exist for all YouTube videos.
// maxresdefault.jpg is NOT reliable — YouTube returns HTTP 404 with a grey 120×90 JPEG
// placeholder for videos that lack a high-res thumbnail, and browsers render that image
// without firing img.onerror, so client-side fallbacks don't help.
export const getYouTubeThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
}
