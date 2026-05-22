# web-andalay Context

Guest-facing public site for a single property (the Andalay brand). Serves the homepage, room browsing, reservations, manage-booking, and pre-check-in flows. Reads property content through `/v1/open/property-info` (no auth) and never writes property configuration — administration happens in `apps/web`.

This file pins down web-andalay-specific terms that don't live in the root `CONTEXT.md` (which covers booking/payment domain language shared across apps).

## Language

### Homepage Carousel

**Homepage Carousel**:
The image carousel rendered on the homepage using the property's public gallery images. The homepage does not render embedded video; all guest video playback belongs to `/videos`.
_Avoid_: Reintroducing homepage-specific video configuration or a video wrapper around the carousel. A legacy `PropertyVideo` row with role `1` may still exist in the database, but it is not part of the guest-site API contract.

### Property Info (read model)

**PropertyInfo** _(GET /v1/open/property-info response)_:
The open, unauthenticated view of a property used by the guest site. Carries only the fields the public site needs: name, description, hours, deposit/cancellation policy bits, social URLs, and booking-step content per locale. Distinct from the authenticated admin `PropertyResponseDto` returned by `/v1/properties/:id` — the admin DTO has internal fields (`reservationStaffEmails`, email config, contacts, facilities) that the guest site must not see.
_Avoid_: Reaching for fields on `PropertyResponseDto` from web-andalay — they are not in the open contract and reading them couples the guest app to admin-only state.

**Open property-info locale parameter**:
The endpoint accepts `?locale=en|th` and the response's locale-keyed sections (`bookingSteps`, `bookingBullets`) are filtered server-side with an `en` fallback when the requested locale has no rows. The non-locale-keyed sections (`name`, social URLs, etc.) are unaffected by the parameter.

### Open API Contract

**API-key-scoped property resolution**:
All guest-facing open endpoints resolve the current property from the API key — no `propertyId` path or query parameter. The `x-api-key` header sent by the frontend on every request uniquely identifies one property on the backend; the frontend never needs to know the numeric property ID. All open read endpoints live under `/v1/open/`.
_Avoid_: Adding `propertyId` as a path parameter to open endpoints — the API key is the single source of truth for which property is being served. Avoid `PROPERTY_ID` in environment variables — it would be redundant with (and potentially inconsistent with) what the API key already encodes. See ADR 0007.

## Relationships

- The homepage page component (`src/app/[locale]/page.tsx`) reads `PropertyInfo` from `/v1/open/property-info` and gallery image URLs from `fetchPropertyImages()`. It renders `<Carousel images={imageUrls} isOnHomePage />` directly.
- `<Carousel />` remains in use elsewhere (room cards, page wrapper) and is the only homepage hero media surface.

## Out of guest-app scope

These belong to `apps/web` (admin), not here:

- **Configuring** guest videos. Admins manage video gallery content on the dedicated property videos surface; web-andalay only consumes `/videos` gallery data.
- **Uploading** video content from the guest site. Uploads are admin-only.

### Video Gallery

**Gallery Thumbnail**:
The click-to-play image shown for each gallery video before the player loads. For YouTube videos: the public thumbnail URL at `img.youtube.com/vi/{videoId}/maxresdefault.jpg` — no API key required. For uploaded videos (`source = VIDEO_SOURCE.UPLOAD`): a **Video Thumbnail** if one has been captured by the admin, otherwise a styled placeholder (dark background, orange play icon). Vimeo thumbnails are out of scope for the current gallery implementation (no Vimeo videos in use).
_Avoid_: Pre-loading iframes for every gallery video on page mount — even with 20 videos this blocks the render thread. Always use `GalleryThumbnail` first; the iframe loads only when the user opens the `GalleryLightbox`.

**Video Thumbnail** _(uploaded videos only)_:
A still-frame JPEG captured client-side from an uploaded gallery video by an admin using the **Thumbnail Selection Modal**. Stored in R2 as a separate object; tracked via a `FileLink` record with `entityType = PROPERTY_VIDEO_THUMBNAIL`, `entityId = PropertyVideo.id`, and `role = FILE_LINK_ROLE.THUMBNAIL` pointing to a `File` record. No `thumbnailKey` column exists on `PropertyVideo` — the thumbnail is always fetched through that `FileLink` shape. When no thumbnail has been set, the styled placeholder renders. When a new thumbnail is saved, the previous `FileLink` is soft-deleted (`deletedAt`) and left for the reaper; the `File` and R2 object are not immediately deleted. See ADR 0011.
_Avoid_: A nullable `thumbnailKey` column on `PropertyVideo` — the `FileLink` pattern is the established lifecycle tracking mechanism in this codebase. See ADR 0011.
_Avoid_: Extracting video frames server-side with FFmpeg — the browser captures the frame via `<canvas>` and uploads the JPEG directly to R2 through a presigned PUT URL.

**Edit Video Details Modal**:
The admin-facing per-video modal in the gallery editor (`apps/web`) for setting a video's `title` and `description`. Triggered by an "Edit details" button on a video row. Both fields are optional plain text; saving sends a PATCH to update the `PropertyVideo` row. Title and description are wired through the API together in a single pass.
_Avoid_: Inline field editing on the video row — a dedicated modal keeps the row layout clean and is consistent with the `Thumbnail Selection Modal` pattern.

**Thumbnail Selection Modal**:
The admin-facing modal opened by the "Set thumbnail" button on an uploaded video row in the gallery editor (`apps/web`). Flow:
1. The uploaded video plays inside the modal using its R2 URL.
2. The admin scrubs to the desired frame and pauses.
3. "Capture frame" draws the current frame to a hidden `<canvas>` and shows a preview below the player.
4. "Save thumbnail" calls `POST /v1/properties/:id/gallery-videos/:videoId/thumbnail/presigned`, PUTs the canvas JPEG to R2, then calls a confirm endpoint which creates the `File` + `FileLink(THUMBNAIL)` records.
5. The modal closes and the video row immediately shows the new thumbnail.
_Avoid_: Merging the capture and save steps into a single click — the preview step lets admins confirm the frame before committing the upload.

**Gallery Lightbox**:
The full-screen modal overlay that renders the video player (YouTube iframe or uploaded `<video>`) for one selected gallery video. Opened by clicking any `GalleryThumbnail` in the grid or the featured slot. Displays the video's `title` in the header and its `description` below the player when either is present. Supports:
- Prev/next navigation via ← → arrow buttons and keyboard arrow keys
- Close via an ✕ button or the ESC key
- Scroll-lock on the page body while open
The sequence for navigation is: featured video first (index 0), then remaining videos in API rank order — matching the visual order in the grid.
_Avoid_: Inline-replace (swapping thumbnail for iframe in-place in the grid) — at 20 videos this leaves one live iframe surrounded by 19 thumbnails with no visual breathing room, and the swap state leaks across grid re-renders. See ADR 0010.

**Gallery Video Title**:
A nullable, short display label for a gallery video. Stored as `title: String?` on the `PropertyVideo` row. Rendered as a text line below the `GalleryThumbnail` card in the grid when present; omitted entirely (no empty placeholder) when `null`. Also rendered in the `GalleryLightbox` header when present.
_Avoid_: Treating an absent title as an error state — most videos may have no title and the layout must degrade gracefully.

**Gallery Video Description**:
A nullable, plain-text editorial blurb for a gallery video. Max 1000 characters. Stored as `description: String?` on the `PropertyVideo` row. Rendered below the video player inside the `GalleryLightbox` when present; omitted entirely (no empty placeholder) when `null`. Never shown in the thumbnail grid.
_Avoid_: Treating an absent description as an error state — most videos will have no description. Avoid rich text or markdown — the field is plain text only.

**Featured Gallery Video**:
The single `PropertyVideo` row with `isFeatured = true` for a property's gallery. Rendered above the video grid as a large `GalleryThumbnail` with the "Featured Video" label. Clicking it opens the `GalleryLightbox` at index 0. At most one featured video is enforced at the service layer. A gallery with no featured video renders the grid only (no featured section).
_Avoid_: Rendering the featured video as a full-width iframe on page load — it is a `GalleryThumbnail` like all others; the iframe loads only inside the `GalleryLightbox`.

## Flagged ambiguities

- The word "video" alone is ambiguous in this codebase: gallery images are sometimes loosely called "videos" in conversation when discussing media, but `PropertyVideo` rows cover video gallery entries. Image gallery content is a separate model (`ImageGallery`) and is not touched by `/videos` gallery work.
- Legacy `PropertyVideo` rows with `role = 1` may exist from the retired homepage hero-video feature. New code should use `VIDEO_ROLE.GALLERY` only.
