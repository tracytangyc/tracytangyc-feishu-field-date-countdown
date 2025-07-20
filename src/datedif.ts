export function DateDif(date1: Date, date2: Date, unit: string): number {
  //  set to date1 and date2 00:00:00 of the day.
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  // use timecode to calculate the difference in years, months, days.
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  const diffMonth = date2.getMonth() - date1.getMonth();
  const diffYear = date2.getFullYear() - date1.getFullYear();
  switch (unit) {
    case 'D':
      return Math.floor((time2 - time1) / (1000 * 60 * 60 * 24));
    case 'M':
      return diffYear * 12 + diffMonth;
    case 'Y':
      return diffYear;
    case 'MD':
      if (date1.getDate() > date2.getDate()) {
        let date = new Date(date2.getFullYear(), date2.getMonth() - 1, date1.getDate());
        return Math.floor((time2 - date.getTime()) / (1000 * 60 * 60 * 24));
      }
      else if (date1.getDate() < date2.getDate()) {
        let date = new Date(date2.getFullYear(), date2.getMonth(), date1.getDate());
        return Math.floor((date.getTime() - time1) / (1000 * 60 * 60 * 24));
      }
      return 0;
    case 'YM':
      return diffMonth < 0 ? diffMonth + 12 : diffMonth;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
};