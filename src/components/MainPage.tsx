import React, { useState, useEffect } from "react";
import logo from "../assets/photos/cmlogo.svg";
import OR from "../assets/photos/OR.svg";
import googlePlay from "../assets/photos/google.png";
import appleStore from "../assets/photos/apple.png";
import "./MainPage.css";

const MainPage = ({ code, successMsg }) => {
  return (
    <div className="bg-image min-h-screen w-full">
      <div className="header flex items-center justify-center p-4">
        <img src={logo} alt="" className="h-14 w-auto" />
      </div>
      <div className="flex flex-col md:flex-row w-full h-[80vh] p-4">
        <div className="left flex flex-col items-center justify-center text-center w-3/5 space-y-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-custom-green">
            Welcome to Connect Mazjid TV App
          </h1>
          <p className="text-2xl md:text-2xl font-semibold mb-2 text-custom-green">
            Your TV Code is
          </p>
          <p className="mb-4 text-xl">
            To show prayer timings and event please add your TV with Admin
            Portal
          </p>
          <div className="box bg-white py-4 px-[10vw] rounded-2xl border-2 border-[#6F6F6F] mb-4">
            <h2 className="text-3xl font-bold text-custom-green">{code}</h2>
          </div>
          {successMsg && (
            <p className="text-2xl md:text-2xl font-semibold mb-2 text-custom-green">
              {successMsg}
            </p>
          )}
          <p className="mb-4 text-lg">
            Note: Enter above code in your in Admin portal.
          </p>
        </div>
        <div className="right w-2/5 flex flex-col items-center justify-center mt-4 md:mt-0">
          <img src={OR} alt="" className="mb-4 w-auto" />
          <h1 className="text-2xl font-bold mb-4 w-full text-center text-custom-green">
            Scan to Download Connect Mazjid App
          </h1>
          <div className="store flex gap-4">
            <img src={googlePlay} alt="" className="h-12 w-auto" />
            <img src={appleStore} alt="" className="h-12 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
