import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ALL video IDs verified from YouTube search results May 2025
// Video Library is now fetched from backend for structured progression tracking.

export default function Listening() {
  const [userLevel, setUserLevel]           = useState(1);
  const [activeTab, setActiveTab]           = useState("videos");
  const [selectedVideo, setSelectedVideo]   = useState(null);
  const [questions, setQuestions]           = useState([]);
  const [answers, setAnswers]               = useState({});
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [vocabulary, setVocabulary]         = useState([]);
  const [videoLibrary, setVideoLibrary]     = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  // AI Passage mode
  const [topic, setTopic]                         = useState("");
  const [passage, setPassage]                     = useState("");
  const [passageQuestions, setPassageQuestions]   = useState([]);
  const [passageAnswers, setPassageAnswers]       = useState({});
  const [passageResult, setPassageResult]         = useState(null);
  const [passageLoading, setPassageLoading]       = useState(false);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get("/api/listening/videos");
      setVideoLibrary(res.data.library || {});
      setCompletedCount(res.data.completedCount || 0);
    } catch (err) { 
      console.error("Failed to fetch library", err); 
      toast.error("Could not load video library");
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const isUnlocked = (minLevel) => userLevel >= minLevel;

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
        description: selectedVideo.topic, // Fallback for description
        level: userLevel 
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
        answers: Object.keys(answers).map(i => ["A","B","C","D"].indexOf(answers[i])),
        topic: selectedVideo.title,
        videoId: selectedVideo.id,
        mode: "video"
      });
      setResult({ ...res.data, feedback: res.data.score >= 70 ? "Great job! Lesson completed." : "Good effort! Try again to unlock the next lesson." });
      if (res.data.score >= 70) fetchLibrary(); 
    } catch (err) { 
      console.error(err);
      toast.error("Failed to submit answers.");
    }
    setLoading(false);
  };

  const handleGeneratePassage = async () => {
    if (!topic.trim()) return;
    setPassageLoading(true);
    setPassage(""); setPassageQuestions([]); setPassageAnswers({}); setPassageResult(null);
    try {
      const res = await axios.post("/api/listening/generate-passage", { topic, level: userLevel });
      setPassage(res.data.passage || "");
      setPassageQuestions(res.data.questions || []);
    } catch (err) { 
      console.error(err);
      toast.error("Failed to generate AI passage.");
    }
    setPassageLoading(false);
  };

  const handleSubmitPassageAnswers = async () => {
    setPassageLoading(true);
    try {
      const res = await axios.post("/api/listening/submit", { 
        questions: passageQuestions,
        answers: Object.keys(passageAnswers).map(i => ["A","B","C","D"].indexOf(passageAnswers[i])),
        topic: topic,
        mode: "passage"
      });
      setPassageResult({ ...res.data, feedback: res.data.score >= 70 ? "Excellent comprehension!" : "Keep practicing! AI passages help build focus." });
    } catch (err) { 
      console.error(err);
      toast.error("Failed to submit answers.");
    }
    setPassageLoading(false);
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🎬 Listening</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Watch real YouTube videos or practice with AI-generated passages.
      </p>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["videos", "📹 Video Library"], ["passages", "🎧 AI Passages"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 14,
            background: activeTab === key ? "#6366f1" : "#f3f4f6",
            color: activeTab === key ? "#fff" : "#374151",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* CURRICULUM ROADMAP */}
      {activeTab === "videos" && !selectedVideo && (
        <div style={{ paddingBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, background: "rgba(99,102,241,0.1)", padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.2)" }}>
            <div>
              <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Path</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{completedCount} Lessons Mastered</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#818cf8" }}>{Math.min(100, Math.round((completedCount/90)*100))}%</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Overall Progress</div>
            </div>
          </div>

          {Object.entries(videoLibrary).map(([levelKey, levelData]) => {
            return (
              <div key={levelKey} style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>{levelData.label}</h2>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0 0" }}>{levelData.videos.length} Progressive Lessons</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: levelData.progress === 100 ? "#22c55e" : "#818cf8" }}>
                      {levelData.progress}% Complete
                    </div>
                    <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: `${levelData.progress}%`, height: "100%", background: levelData.progress === 100 ? "#22c55e" : "#6366f1", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {levelData.videos.map((video, idx) => (
                    <button
                      key={video.id}
                      onClick={() => video.unlocked && handleSelectVideo(video)}
                      disabled={!video.unlocked}
                      style={{
                        padding: 0, border: "none", textAlign: "left",
                        borderRadius: 16, overflow: "hidden",
                        border: video.completed ? "2px solid #22c55e" : video.unlocked ? "2px solid rgba(99,102,241,0.3)" : "2px solid rgba(255,255,255,0.05)",
                        cursor: video.unlocked ? "pointer" : "not-allowed",
                        background: video.completed ? "rgba(34, 197, 94, 0.05)" : video.unlocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                        display: "block", width: "100%",
                        position: "relative", transition: "all 0.2s",
                        opacity: video.unlocked ? 1 : 0.6
                      }}
                      className={video.unlocked ? "video-card-mobile" : ""}
                    >
                      <div style={{ position: "relative", background: "#000", height: 140 }}>
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: video.unlocked ? 1 : 0.3 }}
                        />
                        {video.completed && (
                          <div style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                            ✓
                          </div>
                        )}
                        {!video.unlocked && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <span style={{ fontSize: 24 }}>🔒</span>
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Complete Previous Lesson</span>
                          </div>
                        )}
                        {video.unlocked && !video.completed && (
                          <div style={{ position: "absolute", bottom: 8, left: 8, background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                            Start Lesson {idx + 1}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "14px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: video.unlocked ? "#fff" : "#64748b", lineHeight: 1.4, marginBottom: 4 }}>
                          {idx + 1}. {video.title}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{video.duration}</span>
                          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "2px 6px", color: "#94a3b8" }}>{video.topic}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIDEO PLAYER */}
      {activeTab === "videos" && selectedVideo && (
        <div>
          <button
            onClick={() => { setSelectedVideo(null); setQuestions([]); setAnswers({}); setResult(null); }}
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, marginBottom: 16, color: "#374151" }}>
            ← Back to Library
          </button>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>▶️ {selectedVideo.title}</h3>

          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
          </div>

          {questions.length === 0 ? (
            <button onClick={handleGenerateQuestions} disabled={loading}
              style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Generating questions..." : "🧠 Test Me on This Video"}
            </button>
          ) : (
            <div>
              {vocabulary.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>📚 Key Vocabulary</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {vocabulary.map((w, i) => (
                      <span key={i} style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: "#f1f5f9" }}>Q{i + 1}: {q.question}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, j) => {
                      const letter = ["A","B","C","D"][j];
                      const isSelected = answers[i] === letter;
                      const isCorrect  = result && j === q.correct; // Backend uses index 'correct'
                      const isWrong    = result && isSelected && j !== q.correct;
                      return (
                        <button key={j}
                          onClick={() => !result && setAnswers(p => ({ ...p, [i]: letter }))}
                          style={{
                            textAlign: "left", padding: "10px 14px", borderRadius: 10,
                            cursor: result ? "default" : "pointer", fontSize: 13,
                            border: `2px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                            background: isCorrect ? "rgba(34, 197, 94, 0.1)" : isWrong ? "rgba(239, 68, 68, 0.1)" : isSelected ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.02)",
                            color: isCorrect ? "#4ade80" : isWrong ? "#f87171" : isSelected ? "#818cf8" : "#94a3b8",
                            fontWeight: isSelected ? 600 : 400,
                            transition: "all 0.2s"
                          }}>
                          <span style={{ marginRight: 8, opacity: 0.7 }}>{letter}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!result && (
                <button onClick={handleSubmitAnswers}
                  disabled={loading || Object.keys(answers).length < questions.length}
                  className="btn-primary"
                  style={{ padding: "10px 24px", fontSize: 14, opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>
                  {loading ? "Checking..." : "Submit Answers"}
                </button>
              )}

              {result && (
                <div style={{ marginTop: 16, background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, color: "#4ade80" }}>
                    ✅ Score: {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>{result.feedback}</div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <span className="xp-badge">+{result.xpEarned} XP</span>
                    <span className="streak-badge">+{result.coinsEarned} Coins</span>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setQuestions([]); setAnswers({}); setResult(null); setVocabulary([]); }}
                      className="btn-primary"
                      style={{ padding: "8px 16px", fontSize: 13 }}>
                      Try Again
                    </button>
                    <button onClick={() => { setSelectedVideo(null); setQuestions([]); setAnswers({}); setResult(null); }}
                      className="btn-ghost"
                      style={{ padding: "8px 16px", fontSize: 13 }}>
                      Back to Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI PASSAGES TAB */}
      {activeTab === "passages" && (
        <div className="glass-card" style={{ padding: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#fff" }}>🎧 AI-Generated Listening Passages</h2>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGeneratePassage()}
              placeholder="Enter a topic (e.g. climate change, space, food)"
              className="input-field"
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 14 }}
            />
            <button onClick={handleGeneratePassage} disabled={passageLoading || !topic.trim()}
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: 14, opacity: !topic.trim() ? 0.5 : 1 }}>
              {passageLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {passage && (
            <div style={{ background: "rgba(30, 41, 59, 0.5)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14, color: "#94a3b8" }}>📖 Passage</div>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "#38bdf8", fontWeight: 500 }}>{passage}</p>
            </div>
          )}

          {passageQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14, color: "#f1f5f9" }}>Q{i + 1}: {q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, j) => {
                  const letter = ["A","B","C","D"][j];
                  const isSelected = passageAnswers[i] === letter;
                  const isCorrect  = passageResult && j === q.correct; // Backend uses index
                  const isWrong    = passageResult && isSelected && j !== q.correct;
                  return (
                    <button key={j}
                      onClick={() => !passageResult && setPassageAnswers(p => ({ ...p, [i]: letter }))}
                      style={{
                        textAlign: "left", padding: "10px 14px", borderRadius: 10,
                        cursor: passageResult ? "default" : "pointer", fontSize: 13,
                        border: `2px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                        background: isCorrect ? "rgba(34, 197, 94, 0.1)" : isWrong ? "rgba(239, 68, 68, 0.1)" : isSelected ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.02)",
                        color: isCorrect ? "#4ade80" : isWrong ? "#f87171" : isSelected ? "#818cf8" : "#94a3b8",
                        fontWeight: isSelected ? 600 : 400,
                        transition: "all 0.2s"
                      }}>
                      <span style={{ marginRight: 8, opacity: 0.7 }}>{letter}.</span> {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {passageQuestions.length > 0 && !passageResult && (
            <button onClick={handleSubmitPassageAnswers}
              disabled={passageLoading || Object.keys(passageAnswers).length < passageQuestions.length}
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: 14, opacity: Object.keys(passageAnswers).length < passageQuestions.length ? 0.5 : 1 }}>
              {passageLoading ? "Checking..." : "Submit Answers"}
            </button>
          )}

          {passageResult && (
            <div style={{ marginTop: 16, background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, color: "#4ade80" }}>
                ✅ Score: {passageResult.score}/{passageResult.total} ({Math.round((passageResult.score / passageResult.total) * 100)}%)
              </div>
              <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>{passageResult.feedback}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <span className="xp-badge">+{passageResult.xpEarned} XP</span>
                <span className="streak-badge">+{passageResult.coinsEarned} Coins</span>
              </div>
              <button
                onClick={() => { setPassage(""); setPassageQuestions([]); setPassageAnswers({}); setPassageResult(null); setTopic(""); }}
                className="btn-primary"
                style={{ marginTop: 20, padding: "8px 20px", fontSize: 13 }}>
                Try Another Topic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
