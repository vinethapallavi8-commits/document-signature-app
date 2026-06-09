export default function DocumentView({ fileUrl }) {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <iframe
        src={fileUrl}
        width="100%"
        height="600px"
        style={{ border: "none", borderRadius: "8px" }}
        title="PDF Preview"
      />
    </div>
  );
}