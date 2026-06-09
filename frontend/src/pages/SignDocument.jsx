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
        `http://localhost:3002/api/sign/${id}`,
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
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <h2>Sign Document</h2>
      <p>Draw your signature below:</p>
      <div style={{ border: "2px solid #4f46e5", borderRadius: "8px", marginBottom: "15px", background: "white", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={660}
          height={200}
          style={{ borderRadius: "8px", display: "block", cursor: "crosshair" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={clear}
          style={{ padding: "10px 20px", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer" }}>
          Clear
        </button>
        <button onClick={save}
          style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Save Signature
        </button>
      </div>
    </div>
  );
}