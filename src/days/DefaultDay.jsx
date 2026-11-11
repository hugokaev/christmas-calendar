// The fallback page, used for any day with no Day<NN>.jsx file yet.
//
// It shows only what has been saved in the editor. If nothing has been
// saved, the page is empty on purpose — a day is a blank canvas until
// somebody builds it.
import './DefaultDay.css'

export default function DefaultDay({ secret }) {
  const title = secret?.title?.trim()
  const text = secret?.instructions?.trim()

  if (!title && !text) return null

  return (
    <article className="defaultday">
      {title && <h1 className="defaultday__title">{title}</h1>}
      {text && <div className="defaultday__body">{text}</div>}
    </article>
  )
}
