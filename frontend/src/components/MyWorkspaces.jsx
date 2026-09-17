"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    File,
    Loader2,
    RefreshCw,
    AlertCircle,
    FolderOpen,
} from "lucide-react";

import api from "../services/api";
import "./MyWorkspaces.css";

export default function MyWorkspaces({ workspaceId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDocuments = async () => {
        
        if (!workspaceId) {
            setDocuments([]);
            setError("Please select a workspace first.");
            setLoading(false);
            return;
        }
        
        
        
        
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/workspaces/${workspaceId}/documents`
            );

            console.log("Documents response:", response.data);

            setDocuments(response.data || []);
        } catch (err) {
            console.error("Failed to fetch documents:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to load documents."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!workspaceId) {
            setDocuments([]);
            setError("");
            setLoading(false);
            return;
        }  
        fetchDocuments();
    }, [workspaceId]);

    const getFileIcon = (filename) => {
        const extension = filename?.split(".").pop()?.toLowerCase();

        if (extension === "pdf") {
            return <FileText size={26} />;
        }

        return <File size={26} />;
    };

    return (
        <div className="workspaces-container">

            <div className="workspaces-header">

                <div>
                    <h2>My Workspaces</h2>

                    <p>
                        Manage your uploaded documents and workspace files.
                    </p>
                </div>

                <button
                    className="refresh-documents-btn"
                    onClick={fetchDocuments}
                    disabled={loading}
                    title="Refresh documents"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "spin" : ""}
                    />

                    <span>Refresh</span>
                </button>

            </div>

            {loading && (
                <div className="workspace-state">

                    <Loader2
                        size={28}
                        className="spin"
                    />

                    <p>Loading your documents...</p>

                </div>
            )}

            {!loading && error && (
                <div className="workspace-error">

                    <AlertCircle size={20} />

                    <div>
                        <strong>Unable to load documents</strong>
                        <p>{error}</p>
                    </div>

                </div>
            )}

            {!loading && !error && documents.length === 0 && (
                <div className="workspace-empty">

                    <div className="empty-icon">
                        <FolderOpen size={32} />
                    </div>

                    <h3>No documents yet</h3>

                    <p>
                        Upload a document to start asking questions
                        about your files.
                    </p>

                </div>
            )}

            {!loading && !error && documents.length > 0 && (

                <div className="documents-grid">

                    {documents.map((document) => (

                        <div
                            className="document-card"
                            key={document.id}
                        >

                            <div className="document-icon">
                                {getFileIcon(document.filename)}
                            </div>

                            <div className="document-info">

                                <h3 title={document.filename}>
                                    {document.filename}
                                </h3>

                                <p>
                                    {document.file_type || "Document"}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}