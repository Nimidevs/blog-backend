const getStartAndEndOfDay = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // 00:00:00
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999); // 23:59:59
  console.log(startOfDay, endOfDay)
  return { startOfDay, endOfDay };
};

module.exports = getStartAndEndOfDay
