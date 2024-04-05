import React, { useCallback, useEffect, useState } from "react";
import hrhandle from "../../../assets/photos/hrhandle.png";
import minhandle from "../../../assets/photos/minhandle.png";
// import moment from "moment-timezone";

interface NamazData {
  namazName: string;
  type: number;
  azaanTime: number;
  jamaatTime: number;
  _id: string;
}

interface NamazComponentProps {
  namazData: NamazData[];
}

const Clock: React.FC<NamazComponentProps> = ({ namazData }) => {
  const [time, setTime] = useState({
    hoursAngle: 0,
    minutesAngle: 0,
    secondsAngle: 0,
    hoursText: "",
    minutesText: "",
    ampm: "",
  });

  const [currentPrayer, setCurrentPrayer] = useState({
    namazName: "",
    timeRemaining: "",
  });

  // console.log(currentPrayer);

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

    return () => clearInterval(clockInterval);
  }, []);

  // console.log(currentPrayer);

  const updatePrayerTimers = useCallback((currentTime, namazData) => {
    const getMidpoint = (time1, time2) => (time1 + time2) / 2;

    const formatTime = (totalSeconds) => {
      const seconds = Math.abs(totalSeconds) % 60;
      const minutes = Math.floor(Math.abs(totalSeconds) / 60) % 60;
      const hours = Math.floor(Math.abs(totalSeconds) / 3600);
      const sign = totalSeconds < 0 ? "-" : "+";
      return `${sign}${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    // Sort prayers by time
    const sortedPrayers = namazData
      .slice()
      .sort((a, b) => a.azaanTime - b.azaanTime);

    // console.log(sortedPrayers);

    let current = null;
    let next = null;

    for (let i = 0; i < sortedPrayers.length; i++) {
      if (currentTime < sortedPrayers[i].azaanTime) {
        next = sortedPrayers[i];

        // console.log(currentTime);
        current =
          sortedPrayers[i - 1] || sortedPrayers[sortedPrayers.length - 1];
        break;
      }
    }

    // If 'next' is still null, we're after the last prayer, so set to first prayer of next day
    if (!next) {
      current = sortedPrayers[sortedPrayers.length - 1];
      next = {
        ...sortedPrayers[0],
        azaanTime: sortedPrayers[0].azaanTime + 24 * 3600,
      };
    }

    const midpoint = getMidpoint(current.azaanTime, next.azaanTime);

    let name, timeRemaining;
    if (currentTime < current.azaanTime || currentTime >= midpoint) {
      // Before current prayer's Azaan or after midpoint, we count down to the next prayer
      name = next.namazName;
      timeRemaining = formatTime(currentTime - next.azaanTime);
    } else {
      // After current prayer's Azaan and before midpoint, count up from current prayer
      name = current.namazName;
      timeRemaining = formatTime(current.azaanTime - currentTime);
    }

    setCurrentPrayer({ namazName: name, timeRemaining: timeRemaining });
  }, []);

  useEffect(() => {
    if (namazData && namazData.length > 0) {
      const interval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);

        updatePrayerTimers(currentTime, namazData);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [namazData, updatePrayerTimers]);

  return (
    <div>
      <div className="clock__content flex-container">
        <div className="clock__circle">
          <div className="clock__rounder"></div>
          <div
            className="clock__hour"
            style={{ transform: `rotateZ(${time.hoursAngle}deg)` }}
          >
            <img src={hrhandle} alt="Hour Hand" style={{ height: "60px" }} />
          </div>
          <div
            className="clock__minutes"
            style={{ transform: `rotateZ(${time.minutesAngle}deg)` }}
          >
            <img src={minhandle} alt="Minute Hand" style={{ height: "70px" }} />
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
    </div>
  );
};

export default Clock;
