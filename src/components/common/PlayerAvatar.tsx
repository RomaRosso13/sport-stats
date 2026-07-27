import { useState } from "react"
import { getInitials } from "../../utils/initials"
import "./PlayerAvatar.css"

function PlayerAvatar({ photoUrl, name, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${className} player-avatar-photo`.trim()}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div className={`${className} player-avatar-fallback`.trim()}>
      <span>{getInitials(name, 1)}</span>
    </div>
  )
}

export default PlayerAvatar
