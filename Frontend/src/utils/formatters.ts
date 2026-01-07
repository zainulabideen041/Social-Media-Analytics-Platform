export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getDayName = (dayOfWeek: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfWeek];
};

export const getHourFormat = (hour: number): string => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
};

export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    twitter: "#1DA1F2",
    facebook: "#1877F2",
    instagram: "#E4405F",
    linkedin: "#0A66C2",
  };
  return colors[platform.toLowerCase()] || "#6B7280";
};

export const getPlatformIcon = (platform: string): string => {
  // Returns emoji icons for simplicity
  const icons: Record<string, string> = {
    twitter: "🐦",
    facebook: "📘",
    instagram: "📷",
    linkedin: "💼",
  };
  return icons[platform.toLowerCase()] || "📱";
};
