import dayjs from "dayjs";

export const dateToTimeAgoString = (messageCreatedAt: Date) => {
  const diffHours = dayjs().diff(dayjs(messageCreatedAt), "hour");
  const diffDays = dayjs().diff(dayjs(messageCreatedAt), "day");

  if (diffDays >= 1) {
    return `${diffDays} dag${diffDays > 1 ? "ar" : ""} sen`;
  }
  if (diffHours >= 1) {
    return `${diffHours} timm${diffHours > 1 ? "ar" : "e"} sen`;
  }
  return "Meddelande nyligen";
};
