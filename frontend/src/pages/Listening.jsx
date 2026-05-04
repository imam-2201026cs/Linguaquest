import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Listening() {
  const [userLevel, setUserLevel] = useState(1);
  const [activeTab, setActiveTab] = useState("videos");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);
  const [videoLibrary, setVideoLibrary] = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  const [topic, setTopic] = useState("");
  const [passage, setPassage] = useState("");
  const [passageQuestions, setPassageQuestions] = useState([]);
  const [passageAnswers, setPassageAnswers] = useState({});
  const [passageResult, setPassageResult] = useState(null);
  const [passageLoading, setPassageLoading] = useState(false);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get("/api/listening/videos");
      setVideoLibrary(res.data.library || {});
      setCompletedCount(res.data.completedCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Could not load video library");
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setVocabulary([]);
  };

  const handleGenerateQuestions = async () => {
    if (!selectedVideo) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/listening/video-questions", {
        title: selectedVideo.title,
        topic: selectedVideo.topic,
        videoId: selectedVideo.id,
        level: userLevel,
      });
      setQuestions(res.data.questions || []);
      setVocabulary(res.data.vocabulary || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate questions.");
    }
    setLoading(false);
  };

  const handleSubmitAnswers = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/listening/submit", {
        questions,
        answers: Object.keys(answers).map((i) =>
          ["A", "B", "C", "D"].indexOf(answers[i])
        ),
        topic: selectedVideo.title,
        videoId: selectedVideo.id,
        mode: "video",
      });

      setResult({
        ...res.data,
        feedback:
          res.data.score >= 70
            ? "Great job! Lesson completed."
            : "Try again to unlock next lesson",
      });

      if (res.data.score >= 70) {
        toast.success("🎉 Lesson Mastered!");
        fetchLibrary();
      }
    } catch (err) {
      console.error(err);
      toast.error("Submit failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>🎬 Listening</h1>

      {Object.entries(videoLibrary).map(([levelKey, levelData]) => (
        <div key={levelKey}>
          <h2>{levelData.label}</h2>

          {/* ✅ FIXED TEMPLATE STRING */}
          <div
            style={{
              width: `${levelData.progress}%`,
              height: "6px",
              background: "#6366f1",
            }}
          />

          {levelData.videos.map((video, idx) => (
            <button key={video.id} onClick={() => handleSelectVideo(video)}>
              
              {/* ✅ FIXED TEMPLATE STRING */}
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                style={{ width: "100%" }}
              />

              <p>{video.title}</p>
            </button>
          ))}
        </div>
      ))}

      {selectedVideo && (
        <div>
          <h3>{selectedVideo.title}</h3>

          {/* ✅ FIXED TEMPLATE STRING */}
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
            title={selectedVideo.title}
            style={{ width: "100%", height: 300 }}
          />

          {questions.length === 0 ? (
            <button onClick={handleGenerateQuestions}>
              Generate Questions
            </button>
          ) : (
            <div>
              {questions.map((q, i) => (
                <div key={i}>
                  <p>{q.question}</p>

                  {q.options.map((opt, j) => {
                    const letter = ["A", "B", "C", "D"][j];

                    return (
                      <button
                        key={j}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [i]: letter }))
                        }
                      >
                        {letter}. {opt}
                      </button>
                    );
                  })}
                </div>
              ))}

              <button onClick={handleSubmitAnswers}>
                Submit Answers
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}