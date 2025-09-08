import dayjs from "dayjs";

export const formatDate = (date?: string | null) => {
  if (date) {
    return dayjs(date).locale("sv").format("YYYY-MM-DD HH:mm");
  }
  return null;
};
