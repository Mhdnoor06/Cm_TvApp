import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, utcToZonedTime } from "date-fns-tz";
import tzlookup from "tz-lookup";
import SunCalc from "suncalc";
import "./styles.css";
import cmlogo from "../assets/photos/cmlogo.svg";
import OR from "../assets/photos/OR.svg";
import hrhandle from "../assets/photos/hrhandle.png";
import minhandle from "../assets/photos/minhandle.png";
import fajr from "../assets/photos/Fajr.svg";
import dhur from "../assets/photos/Dhur.svg";
import asar from "../assets/photos/asar.svg";
import maghrib from "../assets/photos/Maghrib.svg";
import isha from "../assets/photos/isha.svg";
import azaan from "../assets/photos/azaan.svg";
import iqama from "../assets/photos/iqama.svg";
import ishraqicon from "../assets/photos/ishraq.svg";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { formatDate } from "../healpers/helperfunc";

const firebaseConfig = {
  apiKey: "AIzaSyAzPFB3NeFWcxd6dMlEmGg3pR3r2blNRoM",
  authDomain: "connectmazjid-tv-app.firebaseapp.com",
  projectId: "connectmazjid-tv-app",
  storageBucket: "connectmazjid-tv-app.appspot.com",
  messagingSenderId: "951849592726",
  appId: "1:951849592726:web:d7884ebe237b610b9a5fb7",
  measurementId: "G-QW3YM2V1Q0",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.log("Unable to get permission to notify.");
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
};

interface PrayerTime {
  namazName: string;
  azaanTime: number;
  jamaatTime: number;
}

const PrayerTime: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [otherTimings, setOtherTimings] = useState<PrayerTime[]>([]);
  const [ishraqTime, setIshraqTime] = useState<number>();
  const [hijiriDate, setHijjiriDate] = useState("");

  const lat = 22.465084026777593;
  const lon = 88.30494547779026;

  const [time, setTime] = useState({
    hoursAngle: 0,
    minutesAngle: 0,
    secondsAngle: 0,
    hoursText: "",
    minutesText: "",
    ampm: "",
  });

  useEffect(() => {
    navigator.serviceWorker
      .register("firebase-messaging-sw.js")
      .then((registration) => {
        return getToken(messaging, {
          serviceWorkerRegistration: registration,
        });
      })
      .then((currentToken) => {
        console.log("Current token:", currentToken);
      })
      .catch((error) => {
        console.error("Error registering service worker:", error);
      });

    // Listen for messages
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      fetchPrayerTimes();
      fetchJummahTimes();
    });

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "FETCH_LATEST_DATA") {
            // fetchPrayerTimes();
            // fetchJummahTimes();
            console.log("fetchong");
          }
        });
      });
    }

    // Request notification permission
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const latitude = Number(lat);
    const longitude = Number(lon);

    const { sunrise } = SunCalc.getTimes(new Date(), latitude, longitude);
    const sunriseUnix = sunrise.getTime() / 1000;
    let ishraqTime: number | undefined = sunriseUnix
      ? sunriseUnix + 15 * 60
      : undefined;

    setIshraqTime(ishraqTime);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const date = new Date();

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      const hoursAngle = (hours % 12) * 30 + minutes * 0.5; // Each hour = 30 degrees, minutes adjustment
      const minutesAngle = minutes * 6; // Each minute = 6 degrees
      const secondsAngle = seconds * 6; // Each second = 6 degrees

      const hoursFormatted = `${hours % 12 || 12}`.padStart(2, "0");
      const minutesFormatted = `${minutes}`.padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";

      setTime({
        hoursAngle,
        minutesAngle,
        secondsAngle,
        hoursText: hoursFormatted,
        minutesText: minutesFormatted,
        ampm,
      });
    }, 1000);
    fetchPrayerTimes();
    fetchJummahTimes();
    return () => clearInterval(clockInterval);
  }, []);

  // console.log(import.meta.env.BASE_URL);

  const fetchPrayerTimes = async () => {
    console.log("fetching");
    const apiURL =
      "https://api.connectmazjid.com/api/v2/widget/prayer-timetable";
    const bearerToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NldFR5cGUiOiJ0aW1ldGFibGUiLCJtYXNqaWRJZCI6IjY1ZmUwNDRhOGIyMmEwYTM2ZGQxMjRiZCIsInVzZXJJZCI6IjY1NjYzYjg3ODlhNmQ2Y2UzMGU5MDFmMyIsImlhdCI6MTcxMjE1MjYxN30.IHJBcngfC_cEtVbPVxDH4fD8hkfAoAtTyYr4LQr0AWQ";

    try {
      const response = await axios.get(apiURL, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data[0].timings) {
        setPrayerTimes(response.data.data[0].timings);
      }
    } catch (error) {
      console.error("Failed to fetch prayer times:", error);
    }
  };

  const fetchJummahTimes = async () => {
    const apiURL =
      "https://api.connectmazjid.com/api/v2/widget/special-timetable";
    const bearerToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NldFR5cGUiOiJ0aW1ldGFibGUiLCJtYXNqaWRJZCI6IjY1ZmUwNDRhOGIyMmEwYTM2ZGQxMjRiZCIsInVzZXJJZCI6IjY1NjYzYjg3ODlhNmQ2Y2UzMGU5MDFmMyIsImlhdCI6MTcxMjE1MjYxN30.IHJBcngfC_cEtVbPVxDH4fD8hkfAoAtTyYr4LQr0AWQ"; // Replace with your actual bearer token

    try {
      const response = await axios.get(apiURL, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const otherTimingData = response.data.data
          .map((timingData: any) => {
            if (timingData.jamaatTime) {
              return {
                namazName: timingData.name,
                azaanTime: timingData.azaanTime || 0,
                jamaatTime: timingData.jamaatTime,
              };
            } else {
              return null;
            }
          })
          .filter(Boolean);

        setOtherTimings(otherTimingData);
      }
    } catch (error) {
      console.error("Failed to fetch Jummah times:", error);
    }
  };

  const convertEpochToTimeString = (epoch: number): string => {
    if (epoch <= 0) {
      return "--";
    }
    const timeZone = tzlookup(lat, lon);

    const date = new Date(epoch * 1000);
    const zonedDate = utcToZonedTime(date, timeZone);
    return format(zonedDate, "hh:mm a", { timeZone });
  };

  const getPrayerImage = (prayerName: string): string => {
    switch (prayerName) {
      case "fajr":
        return fajr;
      case "dhur":
        return dhur;
      case "asar":
        return asar;
      case "maghrib":
        return maghrib;
      case "isha":
        return isha;
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const apiUrl = `https://api.aladhan.com/v1/gToH/${formatDate(
          new Date()
        )}`;
        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const hijriData = data.data.hijri;
        const gregorianData = data.data.gregorian;

        const hijriFormattedDate = `${hijriData.month.en} ${hijriData.day}, ${hijriData.year}`;

        const gregorianFormattedDate = `(${gregorianData.weekday.en}, ${gregorianData.day} ${gregorianData.month.en} ${gregorianData.year})`;

        const fullDate = `${hijriFormattedDate} ${gregorianFormattedDate}`;

        setHijjiriDate(fullDate);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchHijriDate();
  }, []);

  return (
    <div className="App">
      <header>
        <div className="header">
          <img src={cmlogo} alt="" />
          <h1>Test Masjid</h1>
        </div>
      </header>
      <section className="clock container">
        <div className="clock__container grid">
          <div className="appscanner">
            <img src={OR} alt="" />
            <h1>Scan to Download</h1>
          </div>
          <div className="clock_ishraq">
            <div className="clock__content grid">
              <div className="clock__circle">
                <div className="clock__rounder"></div>
                <div
                  className="clock__hour"
                  style={{ transform: `rotateZ(${time.hoursAngle}deg)` }}
                >
                  <img
                    src={hrhandle}
                    alt="Hour Hand"
                    style={{ height: "60px" }}
                  />
                </div>
                <div
                  className="clock__minutes"
                  style={{ transform: `rotateZ(${time.minutesAngle}deg)` }}
                >
                  <img
                    src={minhandle}
                    alt="Minute Hand"
                    style={{ height: "70px" }}
                  />
                </div>
                <div
                  className="clock__seconds"
                  style={{ transform: `rotateZ(${time.secondsAngle}deg)` }}
                ></div>
                {Array.from({ length: 12 }, (_, i) => {
                  const labelStyle = { "--i": i + 1 };
                  return (
                    <label key={i} style={labelStyle as any}>
                      <span>{i + 1}</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <div className="clock_right">
                  <h1 id="next-prayer-name">Maghrib</h1>
                  <div id="next-prayer">
                    <h1 id="next-prayer-time">{`${time.hoursText}:${time.minutesText} ${time.ampm}`}</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="israq">
              <div className="ishraq-icon">
                <img src={ishraqicon} alt="Fajr" />
              </div>
              <h1>
                Ishraq :{" "}
                {ishraqTime !== undefined
                  ? convertEpochToTimeString(ishraqTime)
                  : "Loading..."}
              </h1>
            </div>
          </div>
          <div className="othertimings">
            {otherTimings.map((timings, i) => (
              <div className="jummatime" key={i}>
                <h1>{timings.namazName}</h1>
                <div className="aitimings">
                  <span>
                    <img src={azaan} alt="" />
                    <p>{convertEpochToTimeString(timings.azaanTime)}</p>
                  </span>
                  <span>
                    <img src={iqama} alt="" />
                    <p>{convertEpochToTimeString(timings.jamaatTime)}</p>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="prayer-times-container">
        <table className="prayer-times">
          <thead>
            <tr>
              <th colSpan="6">{hijiriDate}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              {prayerTimes.map((prayer, index) => (
                <td key={index}>
                  <div className="prayer-name">
                    <img
                      src={getPrayerImage(prayer.namazName.toLowerCase())}
                      alt={prayer.namazName}
                    />
                    <b>{prayer.namazName}</b>
                  </div>

                  <span className="time-slot">
                    {convertEpochToTimeString(prayer.azaanTime)}
                  </span>

                  <span className="time-slot">
                    {convertEpochToTimeString(prayer.jamaatTime)}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default PrayerTime;
