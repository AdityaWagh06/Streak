export function formatDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthName(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function isDateToday(dateStr) {
  return dateStr === formatDate(new Date());
}

export function isDateYesterday(dateStr) {
  return dateStr === shiftDate(formatDate(new Date()), -1);
}

export function isInGracePeriod() {
  const now = new Date();
  return now.getHours() < 4;
}

/**
 * Generates an array of weeks (columns), each containing 7 day objects (Sunday=0 to Saturday=6).
 * Aligned to the current week so today is near the far right of the heatmap.
 */
export function getWeeksForHeatmap(weeksCount = 14) {
  const today = new Date();
  const todayStr = formatDate(today);
  const todayDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

  // End of current week (Saturday)
  const endOffset = 6 - todayDayOfWeek;
  const currentWeekEnd = new Date(today);
  currentWeekEnd.setDate(today.getDate() + endOffset);

  // Total days to generate = weeksCount * 7
  const totalDays = weeksCount * 7;
  const startDate = new Date(currentWeekEnd);
  startDate.setDate(currentWeekEnd.getDate() - totalDays + 1);

  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = formatDate(d);

    currentWeek.push({
      dateStr,
      dayOfWeek: d.getDay(),
      dayOfMonth: d.getDate(),
      month: d.getMonth(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr,
      isFuture: d > today,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}
