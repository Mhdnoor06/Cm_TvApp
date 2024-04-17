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
import { ClipLoader } from "react-spinners";
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

interface PrayerTime {
  namazName: string;
  type: number;
  azaanTime: number;
  jamaatTime: number;
  _id: string;
}

interface PrayerTimeProps {
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  data: any;
}

const PrayerTime: React.FC<PrayerTimeProps> = ({ data, setProgress }) => {
  const [ishraqTime, setIshraqTime] = useState<number>();
  const [hijiriDate, setHijjiriDate] = useState("");
  const [loadingPrayerTimes, setLoadingPrayerTimes] = useState(true);
  const masjidName = data.masjidName;
  const lon = data.coordinates[0];
  const lat = data.coordinates[1];

  useEffect(() => {
    const loadData = async () => {
      try {
        setProgress(0);
        setLoadingPrayerTimes(true);
        setProgress(30);
        setLoadingPrayerTimes(false);

        const latitude = Number(lat);
        const longitude = Number(lon);
        const { sunrise } = SunCalc.getTimes(new Date(), latitude, longitude);
        const sunriseUnix = sunrise.getTime() / 1000;
        let ishraqTimeCalc = sunriseUnix ? sunriseUnix + 15 * 60 : undefined;
        setIshraqTime(ishraqTimeCalc);
        setProgress(100);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadingPrayerTimes(false);
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
          <h1 className="text-3xl  font-bold">{masjidName}</h1>
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
          <div className="clock_ishraq ">
            <Clock
              namazData={data.prayerTimes[0].timings}
              lon={lon}
              lat={lat}
            />
            <div className="israq">
              <div className="ishraq-icon">
                <img src={ishraqicon} alt="ishraq" className="h-8" />
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
            {data.specialTiming.map((timings, i) => (
              <div className="jummatime" key={i}>
                <h1 className="text-2xl font-bold">{timings.name}</h1>
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
        {loadingPrayerTimes ? (
          <div className="flex flex-col items-center justify-center h-[35vh]">
            Loading...
            <ClipLoader color="#36d7b7" />
          </div>
        ) : (
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
                {data.prayerTimes[0].timings.map((prayer, index) => (
                  <td key={index} className="xxl:leading-[6rem]">
                    <div className="prayer-name text-2xl xxl:text-4xl ">
                      <img
                        src={getPrayerImage(prayer.namazName.toLowerCase())}
                        alt={prayer.namazName}
                        className="h-8"
                      />
                      <b>{prayer.namazName}</b>
                    </div>

                    <span className="time-slot">
                      {convertEpochToTimeString(prayer.azaanTime, lat, lon)}
                    </span>

                    <span className="time-slot">
                      {convertEpochToTimeString(prayer.jamaatTime, lat, lon)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default PrayerTime;
