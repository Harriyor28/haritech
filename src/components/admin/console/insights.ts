export interface EnquiryLike {
  created_at?: string;
  status?: string;
}

export interface DayPoint {
  label: string;
  value: number;
  title: string;
}

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Real enquiry counts per day — the console never invents traffic figures. */
export const enquirySeries = (messages: EnquiryLike[], days = 14): DayPoint[] => {
  const today = startOfDay(new Date());
  const points: DayPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const value = messages.filter((message) => {
      if (!message.created_at) return false;
      const stamp = new Date(message.created_at);
      if (Number.isNaN(stamp.getTime())) return false;
      return stamp >= day && stamp < next;
    }).length;

    points.push({
      label: day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      value,
      title: `${day.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })} — ${value} ${value === 1 ? 'enquiry' : 'enquiries'}`,
    });
  }

  return points;
};

export const countWithinDays = (messages: EnquiryLike[], days: number, offsetDays = 0): number => {
  const end = startOfDay(new Date());
  end.setDate(end.getDate() - offsetDays);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  return messages.filter((message) => {
    if (!message.created_at) return false;
    const stamp = new Date(message.created_at);
    if (Number.isNaN(stamp.getTime())) return false;
    if (offsetDays === 0) return stamp >= start;
    return stamp >= start && stamp < end;
  }).length;
};

export const statusCounts = (messages: EnquiryLike[]): Record<string, number> => {
  const counts: Record<string, number> = {
    all: messages.length,
    new: 0,
    in_progress: 0,
    resolved: 0,
    spam: 0,
  };

  messages.forEach((message) => {
    const status = message.status ?? 'new';
    counts[status] = (counts[status] ?? 0) + 1;
  });

  return counts;
};

export const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) return '—';
  return stamp.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

export const formatRelative = (value?: string): string => {
  if (!value) return '—';
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) return '—';
  const diff = Date.now() - stamp.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return stamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const percent = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 100) : 0;
