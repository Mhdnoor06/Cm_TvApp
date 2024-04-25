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

import {
  convertEpochToTimeString,
  formatDate,
} from "../../healpers/helperfunc";

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
  const [loaderTxt, setLoaderTxt] = useState("");

  const lat = 22.465084026777593;
  const lon = 88.30494547779026;

  useEffect(() => {
    const loadData = async () => {
      try {
        // These calls are correctly awaited.
        setLoaderTxt("Loading...");
        const prayerTimesData = await fetchPrayerTimes();
        setPrayerTimes(prayerTimesData);
        prayerTimes.length < 0
          ? setLoaderTxt("Prayer timings are not updated")
          : null;
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

  return (
    <div className="App w-screen h-screen overflow-hidden">
      <header>
        <div className="header">
          <img src={cmlogo} alt="" />
          <h1 className="text-3xl  font-bold">Islamic Center of Quad Cities</h1>
        </div>
      </header>
      <section className="clock mid-container">
        <div className="clock__container flex-container">
          <div className="appscanner">
            <img src={OR} alt="" className="qr-scanner min-h-[650px]:mb-5" />
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
                <img src={ishraqicon} alt="Fajr" className="h-8" />
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
            {otherTimings.length > 0 &&
              otherTimings.map((timings, i) => (
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
              {prayerTimes.length > 0 ? (
                prayerTimes.map((prayer, index) => (
                  <td key={index} className="xxl:leading-[6rem]">
                    <div className="prayer-name text-2xl xxl:text-4xl">
                      <img
                        src={getPrayerImage(prayer.namazName.toLowerCase())}
                        alt={prayer.namazName}
                        className="h-8"
                      />
                      <b>{prayer.namazName}</b>
                    </div>

                    <span className="time-slot ">
                      {convertEpochToTimeString(prayer.azaanTime, lat, lon)}
                    </span>

                    <span className="time-slot">
                      {convertEpochToTimeString(prayer.jamaatTime, lat, lon)}
                    </span>
                  </td>
                ))
              ) : (
                <td className="text-xl m-auto h-full">{loaderTxt}</td>
              )}
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default PrayerTime;
