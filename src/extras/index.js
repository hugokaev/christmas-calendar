// Extra bits for the main calendar page, found automatically.
//
// Drop any .jsx file into src/extras/top/ and it appears above the
// calendar. Drop one into src/extras/bottom/ and it appears below.
//
// Neither of you ever edits a shared file to register them, so you can
// both add things to the main page and Git will merge it cleanly. Your
// countdown and Gabriel's Christmas tree can land in the same commit
// without touching each other.
//
// Each file just needs to export a component as its default:
//
//   export default function Countdown() {
//     return <p>12 sleeps to go</p>
//   }

function collect(modules) {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, module]) => ({
      name: path.split('/').pop().replace(/\.jsx$/, ''),
      Component: module.default,
    }))
    .filter((entry) => typeof entry.Component === 'function')
}

export const topExtras = collect(
  import.meta.glob('./top/*.jsx', { eager: true }),
)

export const bottomExtras = collect(
  import.meta.glob('./bottom/*.jsx', { eager: true }),
)
