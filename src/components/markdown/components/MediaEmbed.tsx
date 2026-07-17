/** Native players for direct video/audio file URLs. */
export const MediaEmbed = ({
  kind,
  src,
  title,
}: {
  kind?: string
  src?: string
  title?: string
}) => {
  if (!src) return null
  return (
    <figure className="media-embed not-prose my-6">
      {kind === 'audio' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio controls preload="metadata" src={src} className="w-full" />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          controls
          preload="metadata"
          src={src}
          className="w-full rounded-xl"
        />
      )}
      {title && (
        <figcaption className="mt-2 text-center text-sm opacity-60">
          {title}
        </figcaption>
      )}
    </figure>
  )
}
