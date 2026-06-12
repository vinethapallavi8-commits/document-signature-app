import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments, uploadDocument } from "../api";
import DocumentView from "./DocumentView";
import axios from "axios";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data);
    } catch (err) {
      setMessage("Failed to fetch documents");
    }
  };

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a PDF file");
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      await uploadDocument(formData);
      setMessage("File uploaded successfully!");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  const handleReject = async (docId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://docsign-backend-xnsr.onrender.com/api/sign/${docId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  const statusColor = (status) => {
    if (status === "signed") return "text-green-600 bg-green-100";
    if (status === "rejected") return "text-red-600 bg-red-100";
    return "text-yellow-600 bg-yellow-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white px-8 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">📄 DocSign</h1>
        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload New Document</h2>
          <div className="flex items-center gap-4">
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2" />
            <button onClick={handleUpload}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Upload PDF
            </button>
          </div>
          {message && <p className="mt-3 text-green-600">{message}</p>}
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Documents</h2>
        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
            No documents uploaded yet.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="bg-white rounded-2xl shadow p-6 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{doc.originalName}</p>
                  <p className="text-gray-500 text-sm mt-1">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setSelectedDoc(selectedDoc?._id === doc._id ? null : doc)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                  {selectedDoc?._id === doc._id ? "Hide Preview" : "Preview PDF"}
                </button>
                <button
                  onClick={() => navigate(`/sign/${doc._id}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition">
                  Sign
                </button>
                <button
                  onClick={() => handleReject(doc._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition">
                  Reject
                </button>
              </div>
              {selectedDoc?._id === doc._id && (
                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
                  <DocumentView fileUrl={`https://docsign-backend-xnsr.onrender.com/uploads/${doc.filename}`} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}