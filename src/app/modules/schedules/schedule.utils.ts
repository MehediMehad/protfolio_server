// Combine date + time into DateTime object for Prisma ex: 2023-01-01T00:00:00
const parseDateTime = (date: string, timeStr: string) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  const base = new Date(date);
  base.setHours(hour, minute, 0, 0);
  return base; // 2025-01-01T00:00:00
};

export { parseDateTime };
