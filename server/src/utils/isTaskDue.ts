import type { TasksDue } from '@server/entities/tasks'


export default function isTaskDue(task: TasksDue, date: Date): boolean {
  const { recurrence } = task
  const startDate = new Date(task.startDate)
  const today = new Date()

  // Check for completed tasks for that date. Task can't be completed in the future
  if (today < date && task.completed?.instanceDate) {
    const instanceDate = new Date(task.completed.instanceDate)
    return instanceDate.toDateString() === date.toDateString()
  }

  // Check for one-time tasks without recurrence
  if (!recurrence) {
    return startDate.toDateString() === date.toDateString()
  }

  const dayOfWeek = ((date.getDay() + 6) % 7) + 1 // Convert to 1 (Mon) - 7 (Sun)
  const separation = recurrence.separationCount

  // Helper function to calculate days between dates
  const daysBetween = (date1: Date, date2: Date) =>
    Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))

  // Helper function to check if date matches separation count, separation count can't be 0
  const matchesSeparationCount = (interval: number) =>
    daysBetween(startDate, date) % (interval + 1) === 0

  switch (recurrence.recurringType) {
    case 'Daily':
      if (separation === 0) {
        return true
      }
      return matchesSeparationCount(separation)

    case 'Weekly':
      if (!recurrence.dayOfWeek || !recurrence.dayOfWeek.includes(dayOfWeek)) {
        return false
      }
      return matchesSeparationCount(separation * 7)

    default:
      return false
  }
}
