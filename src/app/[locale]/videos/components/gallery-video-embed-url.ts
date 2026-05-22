export const buildYouTubeEmbedUrl = (videoId: string): string => {
    const params = new URLSearchParams({
        controls: '1',
        modestbranding: '1',
        rel: '0',
        playsinline: '1',
        autoplay: '1'
    })

    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`
}
