import { useState } from "react"
import { getInitials } from "../../utils/initials"
import "./TeamLogo.css"

function TeamLogo({ logoUrl, name, className = "", alt }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (logoUrl && !imageFailed) {
    return (
      <img
        src={logoUrl}
        alt={alt ?? name}
        className={className}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div className={`${className} team-logo-fallback`.trim()}>
      <span>{getInitials(name)}</span>
    </div>
  )
}

export default TeamLogo
