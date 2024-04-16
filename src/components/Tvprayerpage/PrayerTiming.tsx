import React, { useEffect, useState } from "react";
import SunCalc from "suncalc";
import "./styles.css";
import cmlogo from "../../assets/photos/cmlogo.svg";
import OR from "../../assets/photos/OR.svg";
import fajr from "../../assets/photos/Fajr.svg";
import dhur from "../../assets/photos/Dhur.svg";
import asar from "../../assets/photos/asar.svg";
import maghrib from "../../assets/photos/Maghrib.svg";
import isha from "../../assets/photos/isha.svg";
import azaan from "../../assets/photos/azaan.svg";
import iqama from "../../assets/photos/iqama.svg";
import ishraqicon from "../../assets/photos/ishraq.svg";

import { getToken, onMessage } from "firebase/messaging";
import {
  convertEpochToTimeString,
  formatDate,
} from "../../healpers/helperfunc";
import {
  messaging,
  requestNotificationPermission,
} from "../../firebase/firebaseInit";
import Clock from "./Clock/Clock";
import {
  fetchHijriDate,
  fetchJummahTimes,
  fetchPrayerTimes,
} from "../../api-calls";

interface PrayerTime {
  namazName: string;
  type: number;
  azaanTime: number;
  jamaatTime: number;
  _id: string;
}

const PrayerTime: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [otherTimings, setOtherTimings] = useState<PrayerTime[]>([]);
  const [ishraqTime, setIshraqTime] = useState<number>();
  const [hijiriDate, setHijjiriDate] = useState("");

  const lat = 22.465084026777593;
  const lon = 88.30494547779026;

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

    // Define an async function inside the useEffect for handling messages
    const handleMessage = async (payload) => {
      console.log("Message received:", payload);
      try {
        await fetchPrayerTimes();
        await fetchJummahTimes();
      } catch (error) {
        console.error("Error fetching data on message:", error);
      }
    };

    // Listen for messages
    onMessage(messaging, handleMessage);

    // Example for handling 'FETCH_LATEST_DATA' messages from service workers
    const handleServiceWorkerMessage = async (event) => {
      if (event.data && event.data.type === "FETCH_LATEST_DATA") {
        try {
          console.log(
            "Fetching latest data as requested by the service worker..."
          );
          await fetchPrayerTimes();
          await fetchJummahTimes();
        } catch (error) {
          console.error(
            "Error fetching data on service worker message:",
            error
          );
        }
      }
    };

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("message", handleServiceWorkerMessage);
      });
    }

    // Request notification permission
    requestNotificationPermission();

    return () => {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // These calls are correctly awaited.
        const prayerTimesData = await fetchPrayerTimes();
        setPrayerTimes(prayerTimesData);
        const jummahTimesData = await fetchJummahTimes();
        setOtherTimings(jummahTimesData);
        const today = new Date();
        const hijriDateData = await fetchHijriDate(formatDate(today));
        setHijjiriDate(hijriDateData);

        const latitude = Number(lat);
        const longitude = Number(lon);
        const { sunrise } = SunCalc.getTimes(new Date(), latitude, longitude);
        const sunriseUnix = sunrise.getTime() / 1000;
        let ishraqTimeCalc = sunriseUnix ? sunriseUnix + 15 * 60 : undefined;
        setIshraqTime(ishraqTimeCalc);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

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

  console.log(prayerTimes);
  return (
    <div className="App w-screen h-screen overflow-hidden">
      <header>
        <div className="header">
          <img src={cmlogo} alt="" />
          <h1 className="text-3xl  font-bold">Test Masjid</h1>
        </div>
      </header>
      <section className="clock mid-container">
        <div className="clock__container flex-container">
          <div className="appscanner">
            <img src={OR} alt="" className="qr-scanner mb-5" />
            <h1
              className="text-2xl md:text-1xl  font-bold text-center scantext"
              style={{ fontSize: "1.8vw" }}
            >
              Scan to Download
            </h1>
          </div>
          <div className="clock_ishraq">
            <Clock namazData={prayerTimes} />
            <div className="israq">
              <div className="ishraq-icon">
                <img src={ishraqicon} alt="Fajr" />
              </div>
              <h1 className="text-2xl  font-bold">
                Ishraq :{" "}
                {ishraqTime !== undefined
                  ? convertEpochToTimeString(ishraqTime, lat, lon)
                  : "Loading..."}
              </h1>
            </div>
          </div>
          <div className="othertimings">
            {otherTimings.map((timings, i) => (
              <div className="jummatime" key={i}>
                <h1 className="text-2xl font-bold">{timings.namazName}</h1>
                <div className="aitimings">
                  <span>
                    <img src={azaan} alt="" />
                    <p>
                      {convertEpochToTimeString(timings.azaanTime, lat, lon)}
                    </p>
                  </span>
                  <span>
                    <img src={iqama} alt="" />
                    <p>
                      {convertEpochToTimeString(timings.jamaatTime, lat, lon)}
                    </p>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="prayer-times-container">
        <table className="prayer-times h-full">
          <thead>
            <tr>
              <th
                colSpan={6}
                className="text-2xl xxl:text-4xl xxl:leading-[6rem]"
              >
                {hijiriDate}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              {prayerTimes.map((prayer, index) => (
                <td key={index} className="xxl:leading-[6rem]">
                  <div className="prayer-name text-2xl xxl:text-4xl ">
                    <img
                      src={getPrayerImage(prayer.namazName.toLowerCase())}
                      alt={prayer.namazName}
                    />
                    <b>{prayer.namazName}</b>
                  </div>

                  <span className="time-slot text-xl xxl:text-4xl">
                    {convertEpochToTimeString(prayer.azaanTime, lat, lon)}
                  </span>

                  <span className="time-slot text-xl xxl:text-4xl">
                    {convertEpochToTimeString(prayer.jamaatTime, lat, lon)}
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
