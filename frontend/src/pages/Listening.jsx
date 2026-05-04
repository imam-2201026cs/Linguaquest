import { useState, useEffect } from "react";
import { generateJSON } from "../middleware/groq.js";

const videoLibrary = {
  beginner: [
    {
      id: "sFOqGQmQ4N0",
      title: "Peppa Pig — Full Episodes",
      channel: "Peppa Pig Official",
      duration: "10 min",
      topic: "Family & Daily Life",
      thumbnail: `https://img.youtube.com/vi/sFOqGQmQ4N0/hqdefault.jpg`,
    },
    {
      id: "5XFgvUDGLqc",
      title: "Cocomelon — Bath Song & More",
      channel: "Cocomelon",
      duration: "8 min",
      topic: "Songs & Routines",
      thumbnail: `https://img.youtube.com/vi/5XFgvUDGLqc/hqdefault.jpg`,
    },
    {
      id: "oiXMsA3SdGs",
      title: "BBC Learning English — Simple Conversations",
      channel: "BBC Learning English",
      duration: "6 min",
      topic: "Basic English",
      thumbnail: `https://img.youtube.com/vi/oiXMsA3SdGs/hqdefault.jpg`,
    },
    {
      id: "BoHMkB9yCkU",
      title: "Learn Colors with Balloon",
      channel: "English Singsing",
      duration: "5 min",
      topic: "Colors & Objects",
      thumbnail: `https://img.youtube.com/vi/BoHMkB9yCkU/hqdefault.jpg`,
    },
  ],
  elementary: [
    {
      id: "jNQXAC9IVRw",
      title: "Me at the Zoo — First YouTube Video",
      channel: "jawed",
      duration: "19 sec",
      topic: "Animals",
      thumbnail: `https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg`,
    },
    {
      id: "nmWA28bM0Eg",
      title: "BBC 6 Minute English — Sleep",
      channel: "BBC Learning English",
      duration: "6 min",
      topic: "Health & Habits",
      thumbnail: `https://img.youtube.com/vi/nmWA28bM0Eg/hqdefault.jpg`,
    },
    {
      id: "5MgBikgcWnY",
      title: "English Conversation Practice — At the Airport",
      channel: "Learn English with TV Series",
      duration: "8 min",
      topic: "Travel",
      thumbnail: `https://img.youtube.com/vi/5MgBikgcWnY/hqdefault.jpg`,
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Despacito — Luis Fonsi (English/Spanish)",
      channel: "Luis Fonsi",
      duration: "4 min",
      topic: "Music & Culture",
      thumbnail: `https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg`,
    },
  ],
  intermediate: [
    {
      id: "Ge06MkGXMpA",
      title: "TED-Ed — How Does Your Brain Work?",
      channel: "TED-Ed",
      duration: "5 min",
      topic: "Science",
      thumbnail: `https://img.youtube.com/vi/Ge06MkGXMpA/hqdefault.jpg`,
    },
    {
      id: "SFnMTHhKdkw",
      title: "BBC 6 Minute English — Artificial Intelligence",
      channel: "BBC Learning English",
      duration: "6 min",
      topic: "Technology",
      thumbnail: `https://img.youtube.com/vi/SFnMTHhKdkw/hqdefault.jpg`,
    },
    {
      id: "NbuUW9i-mHs",
      title: "TED-Ed — What Makes a Hero?",
      channel: "TED-Ed",
      duration: "4 min",
      topic: "Storytelling",
      thumbnail: `https://img.youtube.com/vi/NbuUW9i-mHs/hqdefault.jpg`,
    },
    {
      id: "UF8uR6Z6KLc",
      title: "Steve Jobs Stanford Commencement Speech",
      channel: "Stanford University",
      duration: "15 min",
      topic: "Inspiration",
      thumbnail: `https://img.youtube.com/vi/UF8uR6Z6KLc/hqdefault.jpg`,
    },
  ],
  upperIntermediate: [
    {
      id: "UyyjU8fzEYU",
      title: "TED — Your Body Language May Shape Who You Are",
      channel: "TED",
      duration: "21 min",
      topic: "Psychology",
      thumbnail: `https://img.youtube.com/vi/UyyjU8fzEYU/hqdefault.jpg`,
    },
    {
      id: "8S0FDjFBj8o",
      title: "TED — The Power of Introverts",
      channel: "TED",
      duration: "19 min",
      topic: "Personality",
      thumbnail: `https://img.youtube.com/vi/8S0FDjFBj8o/hqdefault.jpg`,
    },
    {
      id: "D9Ihs241zeg",
      title: "TED — The Danger of a Single Story",
      channel: "TED",
      duration: "19 min",
      topic: "Culture & Perspective",
      thumbnail: `https://img.youtube.com/vi/D9Ihs241zeg/hqdefault.jpg`,
    },
    {
      id: "iG9CE55wbtY",
      title: "TED — Do Schools Kill Creativity?",
      channel: "TED",
      duration: "20 min",
      topic: "Education",
      thumbnail: `https://img.youtube.com/vi/iG9CE55wbtY/hqdefault.jpg`,
    },
  ],
  advanced: [
    {
      id: "arj7oStGLkU",
      title: "TED — How Language Shapes the Way We Think",
      channel: "TED",
      duration: "14 min",
      topic: "Language & Cognition",
      thumbnail: `https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg`,
    },
    {
      id: "qp0HIF3SfI4",
      title: "TED — How Great Leaders Inspire Action",
      channel: "TED",
      duration: "18 min",
      topic: "Leadership",
      thumbnail: `https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg`,
    },
    {
      id: "h7v-GG3SEWQ",
      title: "TED — The Puzzle of Motivation",
      channel: "TED",
      duration: "18 min",
      topic: "Motivation",
      thumbnail: `https://img.youtube.com/vi/h7v-GG3SEWQ/hqdefault.jpg`,
    },
    {
      id: "w7ejDZ8SWv8",
      title: "TED — The Art of Misdirection",
      channel: "TED",
      duration: "10 min",
      topic: "Critical Thinking",
      thumbnail: `https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg`,
    },
  ],
  expert: [
    {
      id: "5MuIMqhT8DM",
      title: "TED — The Future of Innovation",
      channel: "TED",
      duration: "15 min",
      topic: "Innovation",
      thumbnail: `https://img.youtube.com/vi/5MuIMqhT8DM/hqdefault.jpg`,
    },
    {
      id: "RcGyVTAoXEU",
      title: "TED — The Hidden Power of Not (Always) Knowing",
      channel: "TED",
      duration: "12 min",
      topic: "Philosophy",
      thumbnail: `https://img.youtube.com/vi/RcGyVTAoXEU/hqdefault.jpg`,
    },
    {
      id: "lmyZMtPVodo",
      title: "TED — How to Speak So That People Want to Listen",
      channel: "TED",
      duration: "10 min",
      topic: "Communication",
      thumbnail: `https://img.youtube.com/vi/lmyZMtPVodo/hqdefault.jpg`,
    },
    {
      id: "eIho2S0ZahI",
      title: "TED — The Magic of Not Giving Up",
      channel: "TED",
      duration: "11 min",
      topic: "Resilience",
      thumbnail: `https://img.youtube.com/vi/eIho2S0ZahI/hqdefault.jpg`,
    },
  ],
};

const levelConfig = {
  beginner: { label: "Beginner", color: "#22c55e", emoji: "🟢", minLevel: 1 },
  elementary: { label: "Elementary", color: "#84cc16", emoji: "🟡", minLevel: 2 },
  intermediate: { label: "Intermediate", color: "#f59e0b", emoji: "🟠", minLevel: 3 },
  upperIntermediate: { label: "Upper Intermediate", color: "#f97316", emoji: "🔴", minLevel: 4 },
  advanced: { label: "Advanced", color: "#ef4444", emoji: "🔥", minLevel: 5 },
  expert: { label: "Expert", color: "#8b5cf6", emoji: "💎", minLevel: 6 },
};

export default function Listening() {
  const [userLevel, setUserLevel] = useState(1);
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "passages"
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);

  // AI Passage mode state
  const [topic, setTopic] = useState("");
  const [passage, setPassage] = useState("");
  const [passageQuestions, setPassageQuestions] = useState([]);
  const [passageAnswers, setPassageAnswers] = useState({});
  const [passageResult, setPassageResult] = useState(null);
  const [passageLoading, setPassageLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserLevel(payload.level || 1);
      } catch {}
    }
  }, []);

  const isLevelUnlocked = (minLevel) => userLevel >= minLevel;

  const handleSelectVideo = async (video) => {
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
      const token = localStorage.getItem("token");
      const res = await fetch("/api/listening/video-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoTitle: selectedVideo.title,
          videoTopic: selectedVideo.topic,
          level: userLevel,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setVocabulary(data.vocabulary || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmitAnswers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/listening/check-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions, answers }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // AI Passage mode
  const handleGeneratePassage = async () => {
    if (!topic.trim()) return;
    setPassageLoading(true);
    setPassage("");
    setPassageQuestions([]);
    setPassageAnswers({});
    setPassageResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/listening/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, level: userLevel }),
      });
      const data = await res.json();
      setPassage(data.passage || "");
      setPassageQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    }
    setPassageLoading(false);
  };

  const handleSubmitPassageAnswers = async () => {
    setPassageLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/listening/check-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: passageQuestions, answers: passageAnswers }),
      });
      const data = await res.json();
      setPassageResult(data);
    } catch (err) {
      console.error(err);
    }
    setPassageLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🎬 Listening</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Watch videos or listen to AI-generated passages to improve your English listening skills.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["videos", "passages"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              background: activeTab === tab ? "#6366f1" : "#f3f4f6",
              color: activeTab === tab ? "#fff" : "#374151",
              transition: "all 0.2s",
            }}
          >
            {tab === "videos" ? "📹 Video Library" : "🎧 AI Passages"}
          </button>
        ))}
      </div>

      {/* VIDEO LIBRARY TAB */}
      {activeTab === "videos" && (
        <div>
          {Object.entries(videoLibrary).map(([levelKey, videos]) => {
            const config = levelConfig[levelKey];
            const unlocked = isLevelUnlocked(config.minLevel);
            return (
              <div key={levelKey} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{config.emoji}</span>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: config.color }}>
                    {config.label}
                  </h2>
                  {!unlocked && (
                    <span style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", borderRadius: 12, padding: "2px 10px" }}>
                      🔒 Unlock at Level {config.minLevel}
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => unlocked && handleSelectVideo(video)}
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        border: selectedVideo?.id === video.id ? `2px solid ${config.color}` : "2px solid #e5e7eb",
                        cursor: unlocked ? "pointer" : "not-allowed",
                        opacity: unlocked ? 1 : 0.5,
                        transition: "all 0.2s",
                        background: "#fff",
                        boxShadow: selectedVideo?.id === video.id ? `0 0 0 3px ${config.color}33` : "none",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                          }}
                        />
                        {!unlocked && (
                          <div style={{
                            position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 28
                          }}>🔒</div>
                        )}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3, marginBottom: 4 }}>
                          {video.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{video.channel}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                          <span style={{ fontSize: 11, background: "#f3f4f6", borderRadius: 6, padding: "2px 6px", color: "#374151" }}>
                            {video.topic}
                          </span>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Selected video player */}
          {selectedVideo && (
            <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 16, padding: 20, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>▶️ {selectedVideo.title}</h3>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
              </div>

              {questions.length === 0 ? (
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  style={{
                    background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                    padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14
                  }}
                >
                  {loading ? "Generating..." : "🧠 Test Me on This Video"}
                </button>
              ) : (
                <div>
                  {vocabulary.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>📚 Key Vocabulary</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {vocabulary.map((w, i) => (
                          <span key={i} style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}>
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {questions.map((q, i) => (
                    <div key={i} style={{ marginBottom: 16, background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #e5e7eb" }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                        Q{i + 1}: {q.question}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {q.options.map((opt, j) => {
                          const letter = ["A", "B", "C", "D"][j];
                          const isSelected = answers[i] === letter;
                          const isCorrect = result && letter === q.answer;
                          const isWrong = result && isSelected && letter !== q.answer;
                          return (
                            <button
                              key={j}
                              onClick={() => !result && setAnswers((prev) => ({ ...prev, [i]: letter }))}
                              style={{
                                textAlign: "left", padding: "8px 12px", borderRadius: 8, cursor: result ? "default" : "pointer",
                                border: `2px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#6366f1" : "#e5e7eb"}`,
                                background: isCorrect ? "#dcfce7" : isWrong ? "#fee2e2" : isSelected ? "#ede9fe" : "#fff",
                                fontWeight: isSelected ? 600 : 400, fontSize: 13,
                              }}
                            >
                              {letter}. {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {!result && (
                    <button
                      onClick={handleSubmitAnswers}
                      disabled={loading || Object.keys(answers).length < questions.length}
                      style={{
                        background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                        padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14,
                        opacity: Object.keys(answers).length < questions.length ? 0.5 : 1
                      }}
                    >
                      {loading ? "Checking..." : "Submit Answers"}
                    </button>
                  )}

                  {result && (
                    <div style={{ marginTop: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                        ✅ Score: {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
                      </div>
                      <div style={{ color: "#166534", fontSize: 14 }}>{result.feedback}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button
                          onClick={() => { setQuestions([]); setAnswers({}); setResult(null); setVocabulary([]); }}
                          style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => { setSelectedVideo(null); setQuestions([]); setAnswers({}); setResult(null); }}
                          style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}
                        >
                          Back to Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI PASSAGES TAB */}
      {activeTab === "passages" && (
        <div style={{ background: "#f9fafb", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🎧 AI-Generated Listening Passages</h2>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g. climate change, sports, travel)"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db",
                fontSize: 14, outline: "none"
              }}
              onKeyDown={(e) => e.key === "Enter" && handleGeneratePassage()}
            />
            <button
              onClick={handleGeneratePassage}
              disabled={passageLoading || !topic.trim()}
              style={{
                background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14,
                opacity: !topic.trim() ? 0.5 : 1
              }}
            >
              {passageLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {passage && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #e5e7eb", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14, color: "#374151" }}>📖 Passage</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#111827" }}>{passage}</p>
            </div>
          )}

          {passageQuestions.length > 0 && (
            <div>
              {passageQuestions.map((q, i) => (
                <div key={i} style={{ marginBottom: 16, background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Q{i + 1}: {q.question}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.options.map((opt, j) => {
                      const letter = ["A", "B", "C", "D"][j];
                      const isSelected = passageAnswers[i] === letter;
                      const isCorrect = passageResult && letter === q.answer;
                      const isWrong = passageResult && isSelected && letter !== q.answer;
                      return (
                        <button
                          key={j}
                          onClick={() => !passageResult && setPassageAnswers((prev) => ({ ...prev, [i]: letter }))}
                          style={{
                            textAlign: "left", padding: "8px 12px", borderRadius: 8,
                            cursor: passageResult ? "default" : "pointer",
                            border: `2px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#6366f1" : "#e5e7eb"}`,
                            background: isCorrect ? "#dcfce7" : isWrong ? "#fee2e2" : isSelected ? "#ede9fe" : "#fff",
                            fontWeight: isSelected ? 600 : 400, fontSize: 13,
                          }}
                        >
                          {letter}. {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!passageResult && (
                <button
                  onClick={handleSubmitPassageAnswers}
                  disabled={passageLoading || Object.keys(passageAnswers).length < passageQuestions.length}
                  style={{
                    background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                    padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14,
                    opacity: Object.keys(passageAnswers).length < passageQuestions.length ? 0.5 : 1
                  }}
                >
                  {passageLoading ? "Checking..." : "Submit Answers"}
                </button>
              )}

              {passageResult && (
                <div style={{ marginTop: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    ✅ Score: {passageResult.score}/{passageResult.total} ({Math.round((passageResult.score / passageResult.total) * 100)}%)
                  </div>
                  <div style={{ color: "#166534", fontSize: 14 }}>{passageResult.feedback}</div>
                  <button
                    onClick={() => { setPassage(""); setPassageQuestions([]); setPassageAnswers({}); setPassageResult(null); setTopic(""); }}
                    style={{ marginTop: 12, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}
                  >
                    Try Another Topic
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}