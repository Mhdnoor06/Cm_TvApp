import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import calendericon from "../../assets/photos/calendericon.svg";
import clockicon from "../../assets/photos/clockicon.svg";
import ImagePreview from "../../assets/photos/masjidPreview.png";

import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "./Event.css";
import {
  convertEpochToTimeString,
  formatDateToReadableString,
} from "../../healpers/helperfunc";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);

const Event: React.FC<{ data: any }> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const swiperRefThumbnail = useRef(null);

  const lon = data.coordinates[0];
  const lat = data.coordinates[1];

  useEffect(() => {
    const swiperInstance = swiperRef.current;

    if (swiperInstance) {
      const onSlideChange = () => {
        setActiveIndex(swiperInstance.realIndex);

        const slidesPerView = swiperInstance.params.slidesPerView;

        const lastVisibleSlideIndex = activeIndex + slidesPerView;

        if (lastVisibleSlideIndex >= data.events.length) {
          swiperRefThumbnail.current.slideNext();
        }
      };

      swiperInstance.on("slideChange", onSlideChange);

      return () => {
        swiperInstance.off("slideChange", onSlideChange);
      };
    }
  }, [activeIndex, data]);

  const EventCard = ({ event }) => (
    <div className="flex flex-col md:flex-row md:items-center shadow-lg rounded-lg overflow-hidden h-60vh">
      <div className="w-50vw h-60vh">
        <img
          className="object-cover w-full h-full"
          src={
            event.eventPhotos.length > 0
              ? event.eventPhotos[0].url
              : ImagePreview
          }
          alt="Event"
        />
      </div>
      <div className="w-50vw h-60vh p-8 overflow-y-auto flex flex-col gap-3">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
          <h1 className="text-3xl font-bold text-custom-green">
            {event.eventName}
          </h1>
        </div>
        <p className="block mt-1 text-xl leading-tight font-medium text-black hover:underline">
          {event.address}
        </p>
        <div className="mt-4">
          <div className="text-custom-green text-2xl flex gap-10 items-center">
            <div className="flex items-center justify-center gap-3">
              <img src={calendericon} className="inline-block w-7 h-7" />
              {formatDateToReadableString(event.metaData.startDate, lat, lon)}
            </div>
            <div className="flex items-center justify-center gap-3">
              <img src={clockicon} className="inline-block w-7 h-7" />
              {convertEpochToTimeString(event.timings[0].startTime, lat, lon)}-
              {convertEpochToTimeString(event.timings[0].endTime, lat, lon)}
            </div>
          </div>
        </div>
        <div className=" mt-2">
          <h2 className="text-xl text-custom-green font-medium">Description</h2>
          <p className="mt-2  text-xl">{event.description}</p>
        </div>
      </div>
    </div>
  );

  const ShortEventCard = ({ event }) => (
    <div className="w-full h-[37vh] flex flex-col bg-custom-green text-white shadow-lg rounded-xl">
      <div className="h-3/5">
        <img
          className="object-cover w-full h-full rounded-xl"
          src={
            event.eventPhotos.length > 0
              ? event.eventPhotos[0].url
              : ImagePreview
          }
          alt="Event"
        />
      </div>
      <div className="h-2/5 text-sm p-2 flex flex-col justify-center">
        {" "}
        <h1 className="font-medium text-base">{event.eventName}</h1>
        <div className="text-xs">{event.address}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-image">
      {data.events && data.events.length > 0 ? (
        <React.Fragment>
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            spaceBetween={10}
            slidesPerView={1}
            loop={data.events.length > 1}
            autoplay={
              data.events.length > 1
                ? { delay: 3000, disableOnInteraction: false }
                : false
            }
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {data.events.map((event, index) => (
              <SwiperSlide key={index}>
                <EventCard event={event} />
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper
            spaceBetween={10}
            slidesPerView={5}
            loop={data.events.length > 5}
            autoplay={
              data.events.length > 5
                ? { delay: 3000, disableOnInteraction: false }
                : false
            }
            onSwiper={(swiper) => (swiperRefThumbnail.current = swiper)}
          >
            {data.events.map((event, index) => (
              <SwiperSlide key={index} className="h-40vh">
                <div
                  className={`cursor-pointer m-3 rounded-xl ${
                    index === activeIndex ? "ring-4 ring-yellow-400 " : ""
                  }`}
                  onClick={() => {
                    swiperRef.current.slideToLoop(index);
                  }}
                >
                  <ShortEventCard event={event} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </React.Fragment>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <p className="text-3xl text-custom-green font-bold">
            There are no upcoming events
          </p>
        </div>
      )}
    </div>
  );
};

export default Event;
