import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PublicSign() {
  const { token } = useParams();
  const [document, setDocument] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const res = await axios.get(
        `https://docsign-backend-xnsr.onrender.com/api/share/token/${token}`
      );
      setDocument(res.data);
    } catch (err) {
      setError("Invalid or expired link");
    }
  };

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
      await axios.post(
        `https://docsign-backend-xnsr.onrender.com/api/share/sign/${token}`,
        { signature: signatureData }
      );
      setMessage("Document signed successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Signing failed");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-red-500 text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white px-8 py-4 shadow">
        <h1 className="text-xl font-bold">DocSign — Document Signing</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Document</h2>
          <p className="text-gray-500 mb-2">Document: <strong>{document.originalName}</strong></p>
          <p className="text-gray-500 mb-6">Status: <span className="text-yellow-600 font-medium">{document.status}</span></p>

          {message ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-600 text-xl font-semibold">{message}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">Draw your signature below:</p>
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
                  Sign Document
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}