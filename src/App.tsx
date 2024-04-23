import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchTvData, pairingStatus, registerTV } from "./api-calls";
import "./App.css";
import PrayerTime from "./components/Tvprayerpage/PrayerTiming";
import MainPage from "./components/MainPage";
import Event from "./components/Tveventpage/Event";
import Redirector from "./healpers/Redirector";
import LoadingBar from "react-top-loading-bar";

function App() {
  const [progress, setProgress] = useState(0);
  const [tvCode, setTvCode] = useState<string | null>("");
  const [successMsg, setSuccessMsg] = useState<string | null>("");

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [registrationInitiated, setRegistrationInitiated] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData(token);
    } else if (!registrationInitiated) {
      setRegistrationInitiated(true);
      registerTV()
        .then((data) => {
          console.log("TV registered successfully:", data);
          setTvCode(data.pairingCode);
        })
        .catch((error) => {
          console.error("Failed to register TV:", error);
        });
    }
  }, [token, registrationInitiated]);

  useEffect(() => {
    let intervalId;
    if (tvCode && !token) {
      intervalId = setInterval(async () => {
        try {
          const response = await pairingStatus(tvCode);
          console.log("Checking pairing status:", response);
          if (response.paired) {
            console.log("Pairing successful:", response);
            setTvCode("Successfully Paired");
            setSuccessMsg("Select a view and save");
            setToken(response.token);
            localStorage.setItem("token", response.token);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error checking pairing status:", error);
        }
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [tvCode, token]);

  useEffect(() => {
    const fetchDataInterval = setInterval(() => {
      if (token) {
        console.log("Fetch data every 15 minutes");
        fetchData(token);
      }
    }, 15 * 60 * 1000);

    if (data && redirectPath) {
      if (
        (redirectPath === "/prayer" && !data.prayerTimes) ||
        (redirectPath === "/event" && !data.events)
      ) {
        // If redirected path doesn't match current preference, update redirectPath
        if (data.prayerTimes && data.prayerTimes.length > 0) {
          setRedirectPath("/prayer");
        } else if (data.events && data.events.length > 0) {
          setRedirectPath("/event");
        }
      }
    }

    return () => clearInterval(fetchDataInterval);
  }, [token, redirectPath, data]);

  const fetchData = async (token) => {
    try {
      const response = await fetchTvData(token);
      if (response && (response.prayerTimes || response.events)) {
        setLoading(false);
        console.log(response);
        if (response.prayerTimes && response.prayerTimes.length >= 0) {
          setRedirectPath("/prayer");
          setData(response);
        } else if (response.events && response.events.length >= 0) {
          setRedirectPath("/event");
          setData(response);
        }
      } else {
        setTimeout(() => {
          fetchData(token);
        }, 5000);
      }
    } catch (error) {
      console.error("Error fetching TV data:", error);
      setLoading(false);
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  return (
    <>
      <LoadingBar color="#154F30" height={3} progress={progress} />

      <Router>
        {redirectPath && <Redirector redirectPath={redirectPath} />}

        <Routes>
          <Route
            path="/"
            element={<MainPage code={tvCode} successMsg={successMsg} />}
          />
          <Route
            path="/prayer"
            element={
              loading ? (
                <div>Loading...</div>
              ) : (
                <PrayerTime setProgress={setProgress} data={data} />
              )
            }
          />
          <Route
            path="/event"
            element={loading ? <div>Loading...</div> : <Event data={data} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
