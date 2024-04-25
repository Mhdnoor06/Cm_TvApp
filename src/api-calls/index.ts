// src/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NldFR5cGUiOiJ0aW1ldGFibGUiLCJtYXNqaWRJZCI6IjY1ZmUwNDRhOGIyMmEwYTM2ZGQxMjRiZCIsInVzZXJJZCI6IjY1NjYzYjg3ODlhNmQ2Y2UzMGU5MDFmMyIsImlhdCI6MTcxMjE1MjYxN30.IHJBcngfC_cEtVbPVxDH4fD8hkfAoAtTyYr4LQr0AWQ";

export const fetchPrayerTimes = async () => {
  const url = `${API_BASE_URL}widget/prayer-timetable`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.data[0].timings;
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);
    throw error;
  }
};

export const fetchJummahTimes = async () => {
  const url = `${API_BASE_URL}widget/special-timetable`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.data
      .map((timingData) => ({
        namazName: timingData.name,
        azaanTime: timingData.azaanTime || 0,
        jamaatTime: timingData.jamaatTime,
      }))
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch Jummah times:", error);
    throw error;
  }
};

export const fetchHijriDate = async (date) => {
  const apiUrl = `https://api.aladhan.com/v1/gToH/${date}`;
  try {
    const response = await axios.get(apiUrl);
    const data = response.data.data;
    return `${data.hijri.month.en} ${data.hijri.day}, ${data.hijri.year} (${data.gregorian.weekday.en}, ${data.gregorian.day} ${data.gregorian.month.en} ${data.gregorian.year})`;
  } catch (error) {
    console.error("Error fetching Hijri date:", error);
    throw error;
  }
};
