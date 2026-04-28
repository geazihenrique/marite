const MS_PER_DAY = 86_400_000;

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseBirthDate = (birthDate?: string) => {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const lastDayOfMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

const addCalendarMonths = (date: Date, months: number) => {
  const targetYear = date.getFullYear() + Math.floor((date.getMonth() + months) / 12);
  const targetMonth = (date.getMonth() + months + 1200) % 12;
  const targetDay = Math.min(date.getDate(), lastDayOfMonth(targetYear, targetMonth));
  return new Date(targetYear, targetMonth, targetDay);
};

const addCalendarYears = (date: Date, years: number) => {
  const targetYear = date.getFullYear() + years;
  const targetDay = Math.min(date.getDate(), lastDayOfMonth(targetYear, date.getMonth()));
  return new Date(targetYear, date.getMonth(), targetDay);
};

const plural = (value: number, singular: string, pluralText: string) => `${value} ${value === 1 ? singular : pluralText}`;

const joinParts = (parts: string[]) => {
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
};

const daysBetween = (from: Date, to: Date) =>
  Math.max(0, Math.floor((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / MS_PER_DAY));

const getCompletedMonths = (birth: Date, today: Date) => {
  let months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
  if (months < 0) return 0;
  if (addCalendarMonths(birth, months).getTime() > startOfLocalDay(today).getTime()) months -= 1;
  return Math.max(0, months);
};

const getCompletedYears = (birth: Date, today: Date) => {
  let years = today.getFullYear() - birth.getFullYear();
  if (years < 0) return 0;
  if (addCalendarYears(birth, years).getTime() > startOfLocalDay(today).getTime()) years -= 1;
  return Math.max(0, years);
};

export const calculateTotalDaysSinceBirth = (birthDate?: string, referenceDate: Date = new Date()) => {
  const birth = parseBirthDate(birthDate);
  if (!birth) return null;
  const today = startOfLocalDay(referenceDate);
  if (birth.getTime() > today.getTime()) return null;
  return daysBetween(birth, today);
};

export const calculateReadableBabyAge = (birthDate?: string, referenceDate: Date = new Date()) => {
  const birth = parseBirthDate(birthDate);
  if (!birth) return '';

  const today = startOfLocalDay(referenceDate);
  if (birth.getTime() > today.getTime()) return '';

  const totalDays = daysBetween(birth, today);
  const completedYears = getCompletedYears(birth, today);

  if (completedYears >= 1) {
    const yearAnchor = addCalendarYears(birth, completedYears);
    const completedMonths = getCompletedMonths(yearAnchor, today);
    const monthAnchor = addCalendarMonths(yearAnchor, completedMonths);
    const days = daysBetween(monthAnchor, today);
    return joinParts([
      plural(completedYears, 'ano', 'anos'),
      completedMonths ? plural(completedMonths, 'mês', 'meses') : '',
      days ? plural(days, 'dia', 'dias') : '',
    ].filter(Boolean));
  }

  const completedMonths = getCompletedMonths(birth, today);

  if (completedMonths >= 1) {
    const monthAnchor = addCalendarMonths(birth, completedMonths);
    const days = daysBetween(monthAnchor, today);
    return joinParts([
      plural(completedMonths, 'mês', 'meses'),
      days ? plural(days, 'dia', 'dias') : '',
    ].filter(Boolean));
  }

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  if (weeks <= 0) return plural(totalDays, 'dia', 'dias');
  return joinParts([
    plural(weeks, 'semana', 'semanas'),
    days ? plural(days, 'dia', 'dias') : '',
  ].filter(Boolean));
};

export const calculateBabyMilestoneMessage = (birthDate?: string, referenceDate: Date = new Date()) => {
  const birth = parseBirthDate(birthDate);
  if (!birth) return '';

  const today = startOfLocalDay(referenceDate);
  if (birth.getTime() >= today.getTime()) return '';

  const completedYears = getCompletedYears(birth, today);
  if (completedYears >= 1 && addCalendarYears(birth, completedYears).getTime() === today.getTime()) {
    return `Hoje completa ${plural(completedYears, 'ano', 'anos')}`;
  }

  const completedMonths = getCompletedMonths(birth, today);
  if (completedMonths >= 1 && addCalendarMonths(birth, completedMonths).getTime() === today.getTime()) {
    return `Hoje completa ${plural(completedMonths, 'mês', 'meses')}`;
  }

  const totalDays = daysBetween(birth, today);
  if (completedMonths === 0 && totalDays > 0 && totalDays % 7 === 0) {
    return `Hoje completa ${plural(totalDays / 7, 'semana', 'semanas')}`;
  }

  return '';
};