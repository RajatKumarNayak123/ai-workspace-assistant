"use client";

import { useRef, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";
import "./UploadDocuments.css";
export default function UploadDocuments({ workspaceId }) {
    console.log("UploadDocuments workspaceId:", workspaceId);
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSelectFile = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedFile(file);
        setMessage("");
        setError("");
    };

    const handleUpload = async () => {
        
        if (!workspaceId) {
            setError("Please select a workspace first.");
            return;
        }
        
        if (!selectedFile) {
            setError("Please select a document first.");
            return;
        }

        setUploading(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();

            formData.append("file", selectedFile);

            const response = await api.post(
                `/workspaces/${workspaceId}/documents/upload`,
                formData
            );

            console.log("Upload response:", response.data);

            setMessage("Document uploaded successfully.");
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (err) {
            console.error("Document upload failed:", err);

            const backendMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Document upload failed.";

            setError(backendMessage);

        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setMessage("");
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="upload-container">

            <div className="upload-header">
                <div>
                    <h2>Upload Documents</h2>
                    <p>
                        Upload documents to your workspace for RAG-based AI chat.
                    </p>
                </div>
            </div>

            <div
                className="upload-box"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={42} />

                <h3>Select a document</h3>

                <p>
                    Click here to browse your computer
                </p>

                <span>
                    PDF, DOCX, TXT and other supported documents
                </span>

                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleSelectFile}
                />
            </div>

            {selectedFile && (
                <div className="selected-file">

                    <div>
                        <strong>{selectedFile.name}</strong>

                        <span>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemoveFile}
                    >
                        <X size={18} />
                    </button>

                </div>
            )}

            {selectedFile && (
                <button
                    className="upload-submit-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Upload Document"}
                </button>
            )}

            {message && (
                <div className="upload-success">
                    <CheckCircle size={18} />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

        </div>
    );
}