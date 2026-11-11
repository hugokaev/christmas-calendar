// Finds every day page automatically.
//
// Any file in this folder named Day01.jsx ... Day25.jsx becomes that day's
// page. Nothing else needs editing — there is no shared list to update,
// which is the point: you and Gabriel can both add day files and Git will
// never make you resolve a conflict over it.
//
// import.meta.glob is a Vite feature. It runs at build time and turns the
// matching files into a list we can read.
import DefaultDay from './DefaultDay.jsx'

const modules = import.meta.glob('./Day*.jsx', { eager: true })

const customDays = {}

for (const [path, module] of Object.entries(modules)) {
  const match = path.match(/Day(\d{1,2})\.jsx$/)
  if (match && module.default) {
    customDays[Number(match[1])] = module.default
  }
}

// The component that should draw this day.
export function getDayComponent(day) {
  return customDays[day] ?? DefaultDay
}

// Has someone built a custom page for this day yet?
// Not used by the site itself; handy when working out what is built.
export function hasCustomPage(day) {
  return Boolean(customDays[day])
}
