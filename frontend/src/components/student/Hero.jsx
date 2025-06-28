import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70">
      <h1 className="text-3xl md:text-5xl leading-tight md:leading-[56px] font-bold text-gray-800 max-w-3xl mx-auto text-center relative">
        Empower Your Future With the Courses Designed to{" "}
        <span className="text-blue-600">Fit Your Choice.</span>
        <img
          src={assets.sketch}
          alt=""
          className="md:block hidden absolute -bottom-6 right-0 w-32"
        />
      </h1>

      <p className="hidden md:block text-gray-500 max-w-2xl mx-auto text-center mt-4 text-base leading-relaxed">
        We bring together world-class instructors, interactive content, and a
        supportive community to help you achieve your personal and professional
        goals.
      </p>

      <p className="md:hidden text-gray-500 max-w-sm mx-auto text-center mt-4 text-sm leading-relaxed">
        We bring together world-class instructors to help you achieve your
        professional goals.
      </p>
      <SearchBar />
    </div>
  );
};

export default Hero;
