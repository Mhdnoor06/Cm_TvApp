// src/api.js
import axios from "axios";

const API_CLIENT_BASE_URL = import.meta.env.VITE_CLIENT_BASE_URL;

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

export const registerTV = async () => {
  const url = `${API_CLIENT_BASE_URL}tv/register`;
  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to register TV:", error);
    throw error;
  }
};

export const pairingStatus = async (pairingCode) => {
  const url = `${API_CLIENT_BASE_URL}tv/pairing-status/${pairingCode}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch pairing status:", error);
    throw error;
  }
};

export const fetchTvData = async (TV_TOKEN) => {
  const url = `${API_CLIENT_BASE_URL}tv/data`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TV_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);
    throw error;
  }
};
