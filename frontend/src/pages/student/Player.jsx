import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const Player = () => {
  const {
    enrolledCourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);

  const [openSections, setOpenSections] = useState({});

  const [playerData, setPlayerData] = useState(null);

  const [progressData, setProgressData] = useState(null);

  const [initialRating, setInitialRating] = useState(0);

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);

        course.courseRatings.map((rating) => {
          if (rating.userId === userData.__id) {
            setInitialRating(rating.rating);
          }
        });
      }
    });
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses]);

  const markLectureCompleted = async (lectureId) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        backendUrl + "/api/user/update-course-progress",
        {
          courseId: courseData._id,
          lectureId: lectureId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        backendUrl + "/api/user/get-course-progress",
        {
          courseId: courseData._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setProgressData(data.progressData);
        console.log(data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRating = async (rating) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        backendUrl + "/api/user/add-rating",
        {
          courseId: courseData._id,
          rating: rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (courseData) {
      getCourseProgress();
    }
  }, [courseData]);

  const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    }
  } catch (e) {
    return null;
  }
  return null;
};

  return courseData ? (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* left side */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                        src={assets.down_arrow_icon}
                        alt=""
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} Lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? "max-h-96" : "h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, index) => (
                        <li key={index} className="flex items-start gap-2 py-1">
                          <img
                            src={
                               progressData?.lectureCompleted?.includes(lecture.lectureId)
                                ? assets.blue_tick_icon
                                : assets.play_icon
                            }
                            alt=""
                            className="w-4 h-4 mt-0"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: index + 1,
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Watch
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  { units: ["h", "m"] }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRating} />
          </div>
        </div>
        {/* right side */}
        <div className="md:mt-10">
               {playerData ? (
        <div>
          {(() => {
            const videoId = extractVideoId(playerData.lectureUrl);
            return videoId ? (
              <YouTube videoId={videoId} iframeClassName="w-full aspect-video" />
            ) : (
              <p className="text-red-600">Invalid video URL</p>
            );
          })()}
              

              <div className="flex justify-between items-center mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture}.{" "}
                  {playerData.lectureTitle}
                </p>
                <button
                  onClick={() => markLectureCompleted(playerData.lectureId)}
                  className="text-blue-600"
                >
                 {progressData?.lectureCompleted?.includes(playerData.lectureId)
                  ? "Completed"
                   : "Mark Complete"}

                </button>
              </div>
            </div>
          ) : (
            <img src={courseData ? courseData.courseThumbnail : ""} alt="" />
          )}
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;
