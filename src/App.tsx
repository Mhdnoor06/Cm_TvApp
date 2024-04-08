import { useState } from "react";

import "./App.css";
import PrayerTime from "./components/Tvprayerpage/PrayerTiming";
import MainPage from "./components/MainPage";
import LoadingBar from "react-top-loading-bar";

function App() {
  const [progress, setProgress] = useState(0);
  return (
    <>
      <LoadingBar color="#154F30" height={3} progress={progress} />
      <PrayerTime setProgress={setProgress} />
    </>
  );
}

export default App;
