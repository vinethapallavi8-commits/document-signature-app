import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function SignDocument() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = async () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL("image/png");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://docsign-backend-xnsr.onrender.com/api/sign/${id}`,
        { signature: signatureData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Document signed successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signing failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white px-8 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">📄 DocSign</h1>
        <button onClick={() => navigate("/dashboard")}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          Back to Dashboard
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Document</h2>
          <p className="text-gray-500 mb-6">Draw your signature in the box below</p>
          <div className="border-2 border-indigo-400 rounded-xl mb-6 bg-white">
            <canvas
              ref={canvasRef}
              width={700}
              height={200}
              style={{ borderRadius: "12px", display: "block", cursor: "crosshair", width: "100%" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="flex gap-4">
            <button onClick={clear}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition">
              Clear
            </button>
            <button onClick={save}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}