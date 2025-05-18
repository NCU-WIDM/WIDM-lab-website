// utils/dateUtils.js
export function currentDayName(locale = 'en-US') {
  return new Date().toLocaleDateString(locale, { weekday: 'long' })
}
