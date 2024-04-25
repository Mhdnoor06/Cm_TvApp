import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import hrhandle from "../../../assets/photos/hrhandle.png";
import minhandle from "../../../assets/photos/minhandle.png";
import { convertEpochToTimeString } from "../../../healpers/helperfunc";
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

  const currentNamaz = currentPrayer.namazName;
  const lat = 22.465084026777593;
  const lon = 88.30494547779026;
  // console.log(currentPrayer);

  const sortedPrayers = useMemo(() => {
    return namazData.slice().sort((a, b) => a.azaanTime - b.azaanTime);
  }, [namazData]);

  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const secondHandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();

      const secondsAngle = (seconds / 60) * 360;
      const minutesAngle = (minutes / 60) * 360 + (seconds / 60) * 6;
      const hoursAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

      if (secondHandRef.current) {
        secondHandRef.current.style.transform = `rotate(${secondsAngle}deg)`;
      }
      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minutesAngle}deg)`;
      }
      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hoursAngle}deg)`;
      }

      requestAnimationFrame(updateClock);
    };
    requestAnimationFrame(updateClock);
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

  function getAzaanTime(namazName) {
    const namaz = namazData.find((item) => item.namazName === namazName);
    return namaz ? namaz.azaanTime : null;
  }

  return (
    <div>
      <div className="clock__content flex-container">
        <div className="clock__circle">
          <div className="clock__rounder"></div>
          <div
            ref={hourHandRef}
            className="clock__hour"
            style={{ transform: `rotateZ(${time.hoursAngle}deg)` }}
          >
            <img src={hrhandle} alt="Hour Hand" style={{ height: "60px" }} />
          </div>
          <div
            ref={minuteHandRef}
            className="clock__minutes"
            style={{ transform: `rotateZ(${time.minutesAngle}deg)` }}
          >
            <img src={minhandle} alt="Minute Hand" style={{ height: "70px" }} />
          </div>
          <div
            ref={secondHandRef}
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
            <h1 id="next-prayer-name">{currentPrayer.namazName}</h1>
            <div id="next-prayer">
              <h1 id="next-prayer-time">
                {convertEpochToTimeString(getAzaanTime(currentNamaz), lat, lon)}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clock;
