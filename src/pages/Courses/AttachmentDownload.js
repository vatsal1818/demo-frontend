import React from "react";
import {
  FileDown,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
} from "lucide-react";
import "./Attachments.css";

const AttachmentsList = ({ attachments }) => {
  const getFileIcon = (fileType) => {
    const type = fileType.toLowerCase();
    if (type.includes("image")) return <FileImage />;
    if (type.includes("video")) return <FileVideo />;
    if (type.includes("pdf") || type.includes("text")) return <FileText />;
    if (type.includes("zip") || type.includes("rar") || type.includes("7z")) {
      return <FileArchive />;
    }
    return <File />;
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  return (
    <div className="attachments-container">
      {attachments.map((attachment) => (
        <div key={attachment.fileUrl} className="attachment-card">
          <div className="attachment-info">
            <div className="file-icon">{getFileIcon(attachment.fileType)}</div>
            <div className="file-details">
              <p className="file-name">{attachment.fileName}</p>
              <span className="file-type">
                {attachment.fileType.split("/")[1].toUpperCase()}
              </span>
            </div>
          </div>

          <div className="attachment-actions">
            <a
              href={`${process.env.REACT_APP_API_URL}${attachment.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-btn"
            >
              View
            </a>
            <button
              onClick={() =>
                handleDownload(`${process.env.REACT_APP_API_URL}${attachment.fileUrl}`, attachment.fileName)
              }
              className="download-btn"
            >
              <FileDown />
              <span>Download</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentsList;
