function formatDate() {
  function dateformat(isoString) {
    const date = new Date(isoString);
    const formatted = `${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    return formatted;
  }

  function dateTimeFormat(isoString) {
    const date = new Date(isoString);

    const dateStr = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeStr = `${hours}:${minutes}${ampm}`;

    return {
      date: dateStr,
      time: timeStr,
    };
  }
  function formatTime(time24) {
    const [hourStr, minuteStr] = time24.split(":");
    let hours = parseInt(hourStr);
    const minutes = minuteStr.padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes}${ampm}`;
  }

  return { dateformat, dateTimeFormat, formatTime };
}

export default formatDate;
