export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getTimeRemaining(deadline: string): string {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

export function calculateUrgencyMultiplier(deadline: string): number {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 1) return 2.0;
  if (days < 3) return 1.5;
  if (days < 7) return 1.2;
  return 1.0;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
