export function formatMessageTime(creationTime: number): string {
  const date = new Date(creationTime);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    // Today: "2:34 PM"
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } else if (isThisYear) {
    // Older this year: "Feb 15, 2:34 PM"
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } else {
    // Different year: "Feb 15 2024, 2:34 PM"
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  }
}