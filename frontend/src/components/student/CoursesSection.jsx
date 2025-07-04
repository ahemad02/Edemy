import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-medium text-gray-800 text-center">
        Learn from the best
      </h2>
      <p className="text-sm md:text-base text-gray-500 mt-3 text-center">
        Discover our top-rated courses across various categories. From coding
        and design to <br />
        business and wellness, our courses are crafted to deliver results.
      </p>

      <div className="grid gap-6 px-4 md:px-0 md:my-16 my-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        {allCourses.slice(0, 4).map((course, index) => (
          <CourseCard course={course} key={index} />
        ))}
      </div>

      <Link
        to={"/course-list"}
        onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
        className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded flex justify-center items-center mt-10 mx-auto cursor-pointer w-60"
      >
        Show all courses
      </Link>
    </div>
  );
};

export default CoursesSection;
