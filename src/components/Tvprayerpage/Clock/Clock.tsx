import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import hrhandle from "../../../assets/photos/hrhandle.png";
import minhandle from "../../../assets/photos/minhandle.png";
import { convertEpochToTimeString } from "../../../healpers/helperfunc";

interface NamazData {
  namazName: string;
  type: number;
  azaanTime: number;
  jamaatTime: number;
  _id: string;
}

interface NamazComponentProps {
  namazData: NamazData[];
  lat: number;
  lon: number;
}

const Clock: React.FC<NamazComponentProps> = ({ namazData, lat, lon }) => {
  // const [time, setTime] = useState({
  //   hoursAngle: 0,
  //   minutesAngle: 0,
  //   secondsAngle: 0,
  //   hoursText: "",
  //   minutesText: "",
  //   ampm: "",
  // });

  const [currentPrayer, setCurrentPrayer] = useState({
    namazName: "",
    timeRemaining: "",
  });

  const currentNamaz = currentPrayer.namazName;
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minuteHandRef = useRef<HTMLDivElement>(null);
  const secondHandRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   const clockInterval = setInterval(() => {
  //     const date = new Date();

  //     const hours = date.getHours();
  //     const minutes = date.getMinutes();
  //     const seconds = date.getSeconds();

  //     const hoursAngle = (hours % 12) * 30 + minutes * 0.5;
  //     const minutesAngle = minutes * 6;
  //     const secondsAngle = seconds * 6;

  //     const hoursFormatted = `${hours % 12 || 12}`.padStart(2, "0");
  //     const minutesFormatted = `${minutes}`.padStart(2, "0");
  //     const ampm = hours >= 12 ? "PM" : "AM";

  //     setTime({
  //       hoursAngle,
  //       minutesAngle,
  //       secondsAngle,
  //       hoursText: hoursFormatted,
  //       minutesText: minutesFormatted,
  //       ampm,
  //     });
  //   }, 1000);

  //   return () => clearInterval(clockInterval);
  // }, []);

  // useEffect(() => {
  //   // Function to calculate and update clock hand angles
  //   const calculateAngles = () => {
  //     const now = new Date();
  //     const seconds = now.getSeconds();
  //     const minutes = now.getMinutes();
  //     const hours = now.getHours();

  //     // Calculate the angles for each hand
  //     const secondsAngle = (seconds / 60) * 360; // Full circle for 60 seconds
  //     const minutesAngle = (minutes / 60) * 360 + (seconds / 60) * 6; // Full circle for 60 minutes + slight movement for seconds
  //     const hoursAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30; // Full circle for 12 hours + slight movement for minutes

  //     // Apply the transformations to the clock hands
  //     const secondHand = document.querySelector(".clock__seconds");
  //     const minuteHand = document.querySelector(".clock__minutes");
  //     const hourHand = document.querySelector(".clock__hour");

  //     if (secondHand) secondHand.style.transform = `rotate(${secondsAngle}deg)`;
  //     if (minuteHand) minuteHand.style.transform = `rotate(${minutesAngle}deg)`;
  //     if (hourHand) hourHand.style.transform = `rotate(${hoursAngle}deg)`;
  //   };

  //   // Set the interval to update the clock hands every second
  //   const interval = setInterval(calculateAngles, 1000);

  //   // Clear the interval when the component unmounts
  //   return () => clearInterval(interval);
  // }, []);

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

  // const updatePrayerTimers = useCallback((currentTime, namazData) => {
  //   const getMidpoint = (time1, time2) => (time1 + time2) / 2;

  //   const formatTime = (totalSeconds, sign) => {
  //     const seconds = Math.abs(totalSeconds) % 60;
  //     const minutes = Math.floor(Math.abs(totalSeconds) / 60) % 60;
  //     const hours = Math.floor(Math.abs(totalSeconds) / 3600);
  //     return `${sign}${String(hours).padStart(2, "0")}:${String(
  //       minutes
  //     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  //   };

  //   // Sort prayers by time
  //   const sortedPrayers = namazData
  //     .slice()
  //     .sort((a, b) => a.azaanTime - b.azaanTime);

  //   let current = null;
  //   let next = null;

  //   for (let i = 0; i < sortedPrayers.length; i++) {
  //     if (currentTime < sortedPrayers[i].azaanTime) {
  //       next = sortedPrayers[i];
  //       current =
  //         sortedPrayers[i - 1] || sortedPrayers[sortedPrayers.length - 1];
  //       break;
  //     }
  //   }

  //   // If 'next' is still null, we're after the last prayer, so set to first prayer of next day
  //   if (!next) {
  //     current = sortedPrayers[sortedPrayers.length - 1];
  //     next = {
  //       ...sortedPrayers[0],
  //       azaanTime: sortedPrayers[0].azaanTime + 24 * 3600,
  //     };
  //   }

  //   const midpoint = getMidpoint(current.azaanTime, next.azaanTime);

  //   let name, timeRemaining;
  //   if (currentTime < current.azaanTime || currentTime >= midpoint) {
  //     // Before current prayer's Azaan or after midpoint, we count down to the next prayer
  //     name = next.namazName;
  //     const sign = "-";
  //     timeRemaining = formatTime(currentTime - next.azaanTime, sign);
  //   } else {
  //     // After current prayer's Azaan and before midpoint, count up from current prayer
  //     name = current.namazName;
  //     const sign = "+";
  //     timeRemaining = formatTime(current.azaanTime - currentTime, sign);
  //   }

  //   setCurrentPrayer({ namazName: name, timeRemaining: timeRemaining });
  // }, []);

  const sortedPrayers = useMemo(() => {
    return namazData.slice().sort((a, b) => a.azaanTime - b.azaanTime);
  }, [namazData]);

  const updatePrayerTimers = useCallback(
    (currentTime) => {
      const formatTime = (totalSeconds, sign) => {
        const absSeconds = Math.abs(totalSeconds);
        const hours = Math.floor(absSeconds / 3600);
        const minutes = Math.floor((absSeconds % 3600) / 60);
        const seconds = absSeconds % 60;
        return `${sign}${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      };

      let current = null;
      let next = null;

      // Find the current and next prayer
      for (let i = 0; i < sortedPrayers.length; i++) {
        if (currentTime < sortedPrayers[i].azaanTime) {
          next = sortedPrayers[i];
          current =
            sortedPrayers[i - 1] || sortedPrayers[sortedPrayers.length - 1];
          break;
        }
      }

      if (!next) {
        // Handle wrap-around to the next day
        current = sortedPrayers[sortedPrayers.length - 1];
        next = {
          ...sortedPrayers[0],
          azaanTime: sortedPrayers[0].azaanTime + 24 * 3600,
        };
      }

      const midpoint = (current.azaanTime + next.azaanTime) / 2;
      const name =
        currentTime < current.azaanTime || currentTime >= midpoint
          ? next.namazName
          : current.namazName;
      const timeDiff =
        currentTime < current.azaanTime || currentTime >= midpoint
          ? next.azaanTime - currentTime
          : currentTime - current.azaanTime;
      const sign =
        currentTime < current.azaanTime || currentTime >= midpoint ? "-" : "+";

      setCurrentPrayer({
        namazName: name,
        timeRemaining: formatTime(timeDiff, sign),
      });
    },
    [sortedPrayers]
  );

  useEffect(() => {
    if (namazData && namazData.length > 0) {
      const interval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);

        updatePrayerTimers(currentTime);
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
      <div className="clock__content flex-container xxl:rounded-l-[250px] xxl:rounded-r-[80px]">
        <div className="clock__circle xxl:w-[400px] xxl:h-[400px] ">
          <div className="clock__rounder"></div>
          <div
            ref={hourHandRef}
            className="clock__hour xxl:h-[180px]"
            // style={{ transform: `rotateZ(${time.hoursAngle}deg)` }}
          >
            <img
              src={hrhandle}
              alt="Hour Hand"
              className="h-[60px]  xxl:h-[110px]"
            />
          </div>
          <div
            ref={minuteHandRef}
            className="clock__minutes xxl:h-[220px]"
            // style={{ transform: `rotateZ(${time.minutesAngle}deg)` }}
          >
            <img
              src={minhandle}
              alt="Minute Hand"
              className="h-[70px]  xxl:h-[125px]"
            />
          </div>
          <div
            ref={secondHandRef}
            className="clock__seconds xxl:before:h-32 xxl:h-52"
            // style={{ transform: `rotateZ(${time.secondsAngle}deg)` }}
          ></div>
          {Array.from({ length: 12 }, (_, i) => {
            const labelStyle = { "--i": i + 1 };
            return (
              <label key={i} style={labelStyle as any}>
                <span className="text-base xxl:text-3xl">{i + 1}</span>
              </label>
            );
          })}
        </div>

        <div>
          <div className="clock_right">
            {namazData.length > 0 ? (
              <>
                <h1 id="next-prayer-name">{currentPrayer.namazName}</h1>
                <div id="next-prayer">
                  <h1 id="next-prayer-time">
                    {convertEpochToTimeString(
                      getAzaanTime(currentNamaz),
                      lat,
                      lon
                    )}
                    <b className="text-yellow-500 mx-3">
                      ({`${currentPrayer.timeRemaining}`})
                    </b>
                  </h1>
                </div>
              </>
            ) : (
              <h1 className=" text-3xl">Timings not updated</h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clock;
