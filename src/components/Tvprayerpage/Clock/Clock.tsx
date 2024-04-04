import React, { useEffect, useState } from "react";
import hrhandle from "../../../assets/photos/hrhandle.png";
import minhandle from "../../../assets/photos/minhandle.png";

const Clock = () => {
  const [time, setTime] = useState({
    hoursAngle: 0,
    minutesAngle: 0,
    secondsAngle: 0,
    hoursText: "",
    minutesText: "",
    ampm: "",
  });

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

  return (
    <div>
      <div className="clock__content grid">
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
