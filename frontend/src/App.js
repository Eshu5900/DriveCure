import React, { useState, useEffect } from "react";
import "./style.css";

// 🔥 FIXED API URL (IMPORTANT)
const API_URL = "https://drivecure-backend.onrender.com";

function App() {
  const [problem, setProblem] = useState("");
  const [diagnosis, setDiagnosis] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // 🎤 Voice
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome browser for voice support");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setProblem(text);
      handleDiagnose(text);
    };
  };

  const formatINR = (value) => {
    if (!value) return "";
    return value.replace(/\$/g, "₹").replace(/USD/gi, "rupees");
  };

  // 🔊 Voice
  const speakPriority = (data) => {
    let text = "";

    text += `${data.problemSummary}. `;

    if (data.mainCause) {
      text += `The main cause is ${data.mainCause}. `;
    }

    text += `It is better to ${data.repairOrReplace}. `;

    if (data.repairOrReplace === "Repair") {
      text += `Estimated repair cost is ${formatINR(data.repairCostEstimate)}. `;
    } else {
      text += `Estimated replacement cost is ${formatINR(data.replaceCostEstimate)}. `;
    }

    text += data.canDriverFix === "Yes"
      ? "You can fix this yourself."
      : "You should visit a mechanic.";

    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // 📍 Location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      window.open(
        `https://www.google.com/maps/search/mechanic+near+me/@${lat},${lng},15z`
      );
    });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🔥 FETCH HISTORY
  const fetchHistory = async () => {
    const res = await fetch(`${API_URL}/api/history`);
    const data = await res.json();
    setHistory(data);
  };

  // 🤖 Diagnose
  const handleDiagnose = async (voiceInput = null) => {
    const inputText = voiceInput || problem;
    if (!inputText) return;

    setLoading(true);

    const res = await fetch(`${API_URL}/api/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problem: inputText,
      }),
    });

    const data = await res.json();

    const isDIY = data.canDriverFix === "Yes";

    setDiagnosis([
      { title: "Problem", content: data.problemSummary },
      { title: "Main Cause", content: data.mainCause },

      {
        title: "Top Causes",
        content: "• " + (data.topCauses || []).join("\n• "),
      },

      {
        title: "Solutions",
        content: "• " + (data.solutions || []).join("\n• "),
      },

      { title: "Action", content: data.repairOrReplace },
      { title: "Repair Cost", content: formatINR(data.repairCostEstimate) },
      { title: "Replace Cost", content: formatINR(data.replaceCostEstimate) },

      {
        title: "Can Fix Yourself?",
        content: isDIY ? "Yes (DIY Possible)" : "No (Mechanic Required)",
        status: isDIY ? "good" : "bad",
      },

      ...(isDIY && data.diySteps?.length
        ? [
            {
              title: "DIY Steps",
              content: "• " + data.diySteps.join("\n• "),
            },
          ]
        : []),

      ...(!isDIY
        ? [
            {
              title: "⚠️ Danger Alert",
              content: "This issue requires professional attention.",
              status: "bad",
            },
          ]
        : []),
    ]);

    if (voiceInput) speakPriority(data);

    setLoading(false);
    fetchHistory();
    setActivePage("dashboard");
  };

  return (
    <div className="app">

      <div className="sidebar">
        <h2>DriveCure</h2>

        <div
          className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </div>

        <div
          className={`sidebar-item ${activePage === "history" ? "active" : ""}`}
          onClick={() => setActivePage("history")}
        >
          History
        </div>
      </div>

      <div className="main">
        <div className="container">

          {activePage === "dashboard" && (
            <>
              <h1 className="title">Vehicle Insights</h1>
              <p className="subtitle">Smart AI Vehicle Assistant</p>

              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe your vehicle problem..."
              />

              <div className="button-group">
                <button onClick={() => handleDiagnose()}>Analyze</button>
                <button onClick={startListening}>🎤 Speak</button>
                <button onClick={getLocation}>📍 Nearby</button>
              </div>

              {loading && <div className="loader">Analyzing...</div>}

              {diagnosis.map((d, i) => (
                <div key={i} className="card">
                  <strong>{d.title}</strong>
                  <p style={{ whiteSpace: "pre-line" }} className={d.status}>
                    {d.content}
                  </p>
                </div>
              ))}
            </>
          )}

          {activePage === "history" && (
            <>
              <h2>Previous Searches</h2>

              {history.map((h, i) => (
                <div
                  key={i}
                  className="history-item"
                  onClick={() => {
                    setProblem(h.problem);
                    handleDiagnose(h.problem);
                  }}
                >
                  {h.problem}
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;