"use client";

import {
    FileText,
    Database,
    ShieldCheck,
    Clock3,
    Activity,
    BrainCircuit,
} from "lucide-react";

import "./MetricsPanel.css";

export default function MetricsPanel() {

    return (
        <aside className="metrics-panel">

            <h2 className="metrics-title">
                Retrieval Metrics
            </h2>

            <div className="metric-card">

                <div className="metric-header">
                    <Database size={18} />
                    Retrieved Chunks
                </div>

                <div className="metric-value">
                    3
                </div>

            </div>


            <div className="metric-card">

                <div className="metric-header">
                    <ShieldCheck size={18} />
                    Confidence
                </div>

                <div className="metric-progress">

                    <div
                        className="metric-progress-fill"
                        style={{ width: "87%" }}
                    />

                </div>

                <span className="metric-percent">
                    87%
                </span>

            </div>


            <div className="metric-card">

                <div className="metric-header">
                    <Clock3 size={18} />
                    Response Time
                </div>

                <div className="metric-value">
                    1.42 sec
                </div>

            </div>


            <div className="metric-card">

                <div className="metric-header">
                    <BrainCircuit size={18} />
                    AI Model
                </div>

                <div className="badge">
                    Gemini Flash
                </div>

            </div>


            <div className="metric-card">

                <div className="metric-header">
                    <FileText size={18} />
                    Sources
                </div>

                <div className="source-list">

                    <span>Resume.pdf</span>
                    <span>Chunk 4_1</span>
                    <span>Chunk 4_3</span>

                </div>

            </div>


            <div className="metric-card">

                <div className="metric-header">
                    <Activity size={18} />
                    Status
                </div>

                <div className="status success">
                    ● Connected
                </div>

            </div>

        </aside>
    );
}