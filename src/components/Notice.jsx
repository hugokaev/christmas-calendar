// Small plain messages for loading, errors and empty states.
// Deliberately boring so it does not fight the rest of the design.
import './Notice.css'

export default function Notice({ kind = 'info', children }) {
  return <p className={`notice notice--${kind}`}>{children}</p>
}
