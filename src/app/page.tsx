"use client";

import { useState } from "react";
// import { Button } from "@nextui-org/button";
import axios from "axios";

const styles = {
  buttonStyles: {
    background: "transparent",
    color: "#1d9bf0",
    border: "1px solid #536471",
    width: "100%",
    padding: "10px",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
};

export default function Home() {
  const [tweetText, setTweetText] = useState("Cool Tweet from Next.js!");
  const [tweetTime, setTweetTime] = useState("2024-12-18T14:30");
  const [errors, setErrors] = useState({ tweetText: "", tweetTime: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors = { tweetText: "", tweetTime: "" };

    if (tweetText.trim() === "") {
      newErrors.tweetText = "Tweet text is required.";
      valid = false;
    }
    if (tweetTime.trim() === "") {
      newErrors.tweetTime = "Tweet time is required.";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log(tweetText, tweetTime);
      await axios.post("/api/addTweet", {
        tweet: tweetText,
        postedTime: new Date(tweetTime).toISOString(),
      });
      alert("Tweet scheduled successfully!");
      setTweetText("");
      setTweetTime("");
    } catch (error) {
      console.error("Error scheduling tweet:", error);
      alert("Failed to schedule tweet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-black min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-6xl font-bold text-white">Twitter Scheduler</h1>

      <div className="w-full">
        <h3 className="text-white">Tweet Text</h3>
        <textarea
          className="border border-[#ffffffaa] placeholder:text-[#747576] px-5 py-3 rounded-md w-full text-white bg-[#141518]"
          placeholder="Type your tweet here"
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
        />
        {errors.tweetText && <p className="text-red-500">{errors.tweetText}</p>}
      </div>

      <div className="w-full">
        <h3 className="text-white">Tweet Time</h3>
        <input
          aria-label="Date and time"
          type="datetime-local"
          className="border border-[#ffffffaa] placeholder:text-[#747576] px-5 py-3 rounded-md w-full text-white bg-[#141518]"
          value={tweetTime}
          onChange={(e) => setTweetTime(e.target.value)}
        />
        {errors.tweetTime && <p className="text-red-500">{errors.tweetTime}</p>}
      </div>
      <button style={styles.buttonStyles} onClick={onSubmit}>
        {isSubmitting ? "Submitting..." : "Post"}
      </button>
      {/* 
      <Button
        color="primary"
        style={styles.buttonStyles}
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Post"}
      </Button> */}
    </div>
  );
}
