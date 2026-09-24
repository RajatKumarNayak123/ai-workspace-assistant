"use client";

import { useEffect, useState } from "react";

import {
    Activity,
    Database,
    Search,
    GitMerge,
    BrainCircuit,
    Clock3,
    MessageSquare,
    BarChart3,
    RefreshCw,
} from "lucide-react";

import "./RetrievalMetrics.css";

const API_BASE_URL = "http://52.66.236.4:8000";

export default function RetrievalMetrics({workspaceId,}) {

    const [stats, setStats] = useState({
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        avgResponseTime: 0,
        avgVectorHits: 0,
        avgBm25Hits: 0,
        avgRrfSelected: 0,
        avgReranked: 0,
    });

    const [recentQueries, setRecentQueries] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [lastUpdated, setLastUpdated] = useState(null);


    // ==================================================
    // FETCH RETRIEVAL METRICS
    // ==================================================

    const fetchMetrics = async () => {

        try {

            setLoading(true);
            setError("");

            // ------------------------------------------
            // SUMMARY
            // ------------------------------------------

            const summaryResponse = await fetch(
                `${API_BASE_URL}/metrics/summary?workspace_id=${workspaceId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            if (!summaryResponse.ok) {
                throw new Error(
                    `Summary API failed: ${summaryResponse.status}`
                );
            }

            const summaryJson = await summaryResponse.json();

            const summary = summaryJson.data || {};


            // ------------------------------------------
            // RECENT QUERIES
            // ------------------------------------------

            const recentResponse = await fetch(
                `${API_BASE_URL}/metrics/recent?workspace_id=${workspaceId}&limit=20`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            if (!recentResponse.ok) {
                throw new Error(
                    `Recent metrics API failed: ${recentResponse.status}`
                );
            }

            const recentJson = await recentResponse.json();

            const recent = recentJson.data || [];


            // ------------------------------------------
            // UPDATE STATE
            // ------------------------------------------

            setStats({

                totalQueries:
                    summary.total_queries ?? 0,

                successfulQueries:
                    summary.successful_queries ?? 0,

                failedQueries:
                    summary.failed_queries ?? 0,

                avgResponseTime:
                    summary.average_response_time ?? 0,

                avgVectorHits:
                    summary.average_vector_hits ?? 0,

                avgBm25Hits:
                    summary.average_bm25_hits ?? 0,

                avgRrfSelected:
                    summary.average_rrf_selected ?? 0,

                avgReranked:
                    summary.average_reranked ?? 0,
            });


            setRecentQueries(recent);

            setLastUpdated(
                new Date().toLocaleTimeString()
            );

        } catch (err) {

            console.error(
                "Failed to load retrieval metrics:",
                err
            );

            setError(
                "Unable to load retrieval analytics."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        if (!workspaceId) {
            setLoading(false);
            return;
        }

        fetchMetrics();

    }, [workspaceId]);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <div className="retrieval-metrics-page">

                <div className="analytics-loading">

                    <RefreshCw
                        size={28}
                        className="loading-spinner"
                    />

                    <h3>
                        Loading Retrieval Analytics...
                    </h3>

                    <p>
                        Fetching RAG pipeline metrics.
                    </p>

                </div>

            </div>
        );
    }


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="retrieval-metrics-page">


            {/* ========================================= */}
            {/* HEADER */}
            {/* ========================================= */}

            <div className="retrieval-metrics-header">

                <div>

                    <h1>
                        Retrieval Analytics
                    </h1>

                    <p>
                        Monitor and analyze the performance
                        of the RAG retrieval pipeline.
                    </p>

                </div>


                <div className="analytics-header-right">

                    <div className="analytics-status">

                        <span className="status-dot"></span>

                        RAG Pipeline

                    </div>


                    <button
                        className="refresh-metrics-btn"
                        onClick={fetchMetrics}
                    >

                        <RefreshCw size={15} />

                        Refresh

                    </button>

                </div>

            </div>


            {/* ========================================= */}
            {/* ERROR */}
            {/* ========================================= */}

            {error && (

                <div className="analytics-error">

                    {error}

                </div>

            )}


            {/* ========================================= */}
            {/* LAST UPDATED */}
            {/* ========================================= */}

            {lastUpdated && (

                <div className="metrics-last-updated">

                    Last updated: {lastUpdated}

                </div>

            )}


            {/* ========================================= */}
            {/* OVERVIEW CARDS */}
            {/* ========================================= */}

            <div className="analytics-overview">


                {/* TOTAL QUERIES */}

                <div className="analytics-card">

                    <div className="analytics-card-top">

                        <span>
                            Total Queries
                        </span>

                        <div className="analytics-icon blue">

                            <MessageSquare size={18} />

                        </div>

                    </div>


                    <div className="analytics-value">

                        {stats.totalQueries}

                    </div>


                    <div className="analytics-label">

                        Questions processed

                    </div>

                </div>


                {/* RESPONSE TIME */}

                <div className="analytics-card">

                    <div className="analytics-card-top">

                        <span>
                            Avg Response Time
                        </span>

                        <div className="analytics-icon purple">

                            <Clock3 size={18} />

                        </div>

                    </div>


                    <div className="analytics-value">

                        {Number(
                            stats.avgResponseTime
                        ).toFixed(2)}s

                    </div>


                    <div className="analytics-label">

                        Average generation time

                    </div>

                </div>


                {/* FINAL RETRIEVED */}

                <div className="analytics-card">

                    <div className="analytics-card-top">

                        <span>
                            Avg Retrieved
                        </span>

                        <div className="analytics-icon cyan">

                            <Database size={18} />

                        </div>

                    </div>


                    <div className="analytics-value">

                        {Number(
                            stats.avgReranked
                        ).toFixed(1)}

                    </div>


                    <div className="analytics-label">

                        Final chunks used

                    </div>

                </div>


                {/* STATUS */}

                <div className="analytics-card">

                    <div className="analytics-card-top">

                        <span>
                            Pipeline Status
                        </span>

                        <div className="analytics-icon green">

                            <Activity size={18} />

                        </div>

                    </div>


                    <div className="analytics-value status-value">

                        Active

                    </div>


                    <div className="analytics-label">

                        Retrieval pipeline running

                    </div>

                </div>

            </div>


            {/* ========================================= */}
            {/* RETRIEVAL PIPELINE */}
            {/* ========================================= */}

            <section className="analytics-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Retrieval Pipeline
                        </h2>

                        <p>
                            Average results produced at each
                            retrieval stage.
                        </p>

                    </div>

                    <BarChart3 size={20} />

                </div>


                <div className="pipeline-grid">


                    {/* VECTOR */}

                    <div className="pipeline-card">

                        <div className="pipeline-icon">

                            <Search size={19} />

                        </div>


                        <div className="pipeline-info">

                            <h3>
                                Vector Search
                            </h3>

                            <p>
                                Semantic similarity retrieval
                            </p>

                        </div>


                        <strong>

                            {Number(
                                stats.avgVectorHits
                            ).toFixed(1)}

                        </strong>

                    </div>


                    {/* BM25 */}

                    <div className="pipeline-card">

                        <div className="pipeline-icon">

                            <Search size={19} />

                        </div>


                        <div className="pipeline-info">

                            <h3>
                                BM25 Search
                            </h3>

                            <p>
                                Keyword-based retrieval
                            </p>

                        </div>


                        <strong>

                            {Number(
                                stats.avgBm25Hits
                            ).toFixed(1)}

                        </strong>

                    </div>


                    {/* RRF */}

                    <div className="pipeline-card">

                        <div className="pipeline-icon">

                            <GitMerge size={19} />

                        </div>


                        <div className="pipeline-info">

                            <h3>
                                RRF Fusion
                            </h3>

                            <p>
                                Combined retrieval results
                            </p>

                        </div>


                        <strong>

                            {Number(
                                stats.avgRrfSelected
                            ).toFixed(1)}

                        </strong>

                    </div>


                    {/* CROSS ENCODER */}

                    <div className="pipeline-card">

                        <div className="pipeline-icon">

                            <BrainCircuit size={19} />

                        </div>


                        <div className="pipeline-info">

                            <h3>
                                Cross Encoder
                            </h3>

                            <p>
                                Final relevance reranking
                            </p>

                        </div>


                        <strong>

                            {Number(
                                stats.avgReranked
                            ).toFixed(1)}

                        </strong>

                    </div>

                </div>

            </section>


            {/* ========================================= */}
            {/* QUERY PERFORMANCE */}
            {/* ========================================= */}

            <section className="analytics-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Query Performance
                        </h2>

                        <p>
                            Retrieval performance for recent
                            questions.
                        </p>

                    </div>

                </div>


                <div className="query-table">


                    {/* TABLE HEADER */}

                    <div className="query-table-header">

                        <span>
                            Question
                        </span>

                        <span>
                            Vector
                        </span>

                        <span>
                            BM25
                        </span>

                        <span>
                            RRF
                        </span>

                        <span>
                            Reranked
                        </span>

                        <span>
                            Time
                        </span>

                    </div>


                    {/* ================================= */}
                    {/* QUERY ROWS */}
                    {/* ================================= */}

                    {recentQueries.length === 0 ? (

                        <div className="empty-analytics">

                            <BarChart3 size={28} />

                            <h3>
                                No query analytics yet
                            </h3>

                            <p>
                                Ask questions in AI Chat
                                to start collecting
                                retrieval metrics.
                            </p>

                        </div>

                    ) : (

                        recentQueries.map((query) => (

                            <div
                                className="query-row"
                                key={query.id}
                            >

                                <div
                                    className="query-question"
                                    title={query.question}
                                >

                                    <MessageSquare
                                        size={15}
                                    />

                                    <span>
                                        {query.question}
                                    </span>

                                </div>


                                <span className="metric-number">
                                    {query.vector_hits}
                                </span>


                                <span className="metric-number">
                                    {query.bm25_hits}
                                </span>


                                <span className="metric-number">
                                    {query.rrf_selected}
                                </span>


                                <span className="metric-number">
                                    {query.reranked}
                                </span>


                                <span className="metric-time">
                                    {Number(
                                        query.response_time
                                    ).toFixed(2)}s
                                </span>

                            </div>

                        ))

                    )}

                </div>

            </section>


            {/* ========================================= */}
            {/* QUERY SUCCESS SUMMARY */}
            {/* ========================================= */}

            <section className="analytics-section">


                <div className="section-heading">

                    <div>

                        <h2>
                            Query Health
                        </h2>

                        <p>
                            Overall success and failure
                            statistics.
                        </p>

                    </div>

                </div>


                <div className="health-grid">


                    <div className="health-card success-health">

                        <span>
                            Successful Queries
                        </span>

                        <strong>
                            {stats.successfulQueries}
                        </strong>

                    </div>


                    <div className="health-card failed-health">

                        <span>
                            Failed Queries
                        </span>

                        <strong>
                            {stats.failedQueries}
                        </strong>

                    </div>


                    <div className="health-card">

                        <span>
                            Success Rate
                        </span>

                        <strong>

                            {stats.totalQueries > 0
                                ? (
                                    (
                                        stats.successfulQueries /
                                        stats.totalQueries
                                    ) * 100
                                ).toFixed(1)
                                : "0.0"
                            }%

                        </strong>

                    </div>

                </div>

            </section>

        </div>
    );
}