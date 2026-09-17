"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    Monitor,
    ShieldCheck,
    Clock3,
    Globe,
    Laptop,
    Smartphone,
    Tablet,
    CircleCheck,
    LogOut,
    RefreshCw,
    AlertTriangle,
} from "lucide-react";

import api from "../../services/api";

import "./connected-devices.css";


export default function ConnectedDevicesPage() {

    const router = useRouter();

    // =========================================
    // STATE
    // =========================================

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [signingOutSession, setSigningOutSession] = useState(null);
    const [signOutError, setSignOutError] = useState("");
    // =========================================
    // LOAD SESSIONS
    // =========================================

    const loadSessions = async (showRefreshLoader = false) => {

        try {

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await api.get("/me/sessions");

            setSessions(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load sessions:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                localStorage.removeItem(
                    "current_user"
                );

                router.push("/login");

                return;
            }

            setError(
                error.response?.data?.detail ||
                "Unable to load connected devices."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };

// =========================================
// SIGN OUT SESSION
// =========================================

    const handleSignOutSession = async (sessionId) => {

        try {

            setSigningOutSession(sessionId);
            setSignOutError("");

            await api.delete(
                `/me/sessions/${sessionId}`
            );

            // Remove revoked session from UI
            setSessions((previousSessions) =>
                previousSessions.filter(
                    (session) =>
                        session.session_id !== sessionId
                )
            );

        } catch (error) {

            console.error(
                "Failed to sign out session:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                localStorage.removeItem(
                    "current_user"
                );

                router.push("/login");

                return;
            }

            setSignOutError(
                error.response?.data?.detail ||
                "Unable to sign out this session."
            );

        }  finally {

            setSigningOutSession(null);

        }

    };



    // =========================================
    // INITIAL LOAD
    // =========================================

    useEffect(() => {

        loadSessions();

    }, []);


    // =========================================
    // BACK
    // =========================================

    const handleBack = () => {

        router.back();

    };


    // =========================================
    // DEVICE ICON
    // =========================================

    const getDeviceIcon = (session) => {

        const deviceType =
            (session.device_type || "")
                .toLowerCase();

        if (
            deviceType.includes("mobile") ||
            deviceType.includes("phone")
        ) {

            return <Smartphone size={22} />;

        }

        if (
            deviceType.includes("tablet")
        ) {

            return <Tablet size={22} />;

        }

        if (
            deviceType.includes("desktop")
        ) {

            return <Monitor size={22} />;

        }

        return <Laptop size={22} />;

    };


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDateTime = (value) => {

        if (!value) {
            return "Unknown";
        }

        try {

            return new Date(value)
                .toLocaleString(
                    undefined,
                    {
                        dateStyle: "medium",
                        timeStyle: "short",
                    }
                );

        } catch {

            return "Unknown";

        }

    };


    // =========================================
    // FORMAT LAST ACTIVE
    // =========================================

    const formatLastActive = (value) => {

        if (!value) {
            return "Unknown";
        }

        try {

            const date =
                new Date(value);

            const now =
                new Date();

            const diff =
                Math.floor(
                    (now - date) / 1000
                );

            if (diff < 60) {
                return "Just now";
            }

            if (diff < 3600) {

                const minutes =
                    Math.floor(diff / 60);

                return `${minutes} minute${
                    minutes === 1 ? "" : "s"
                } ago`;

            }

            if (diff < 86400) {

                const hours =
                    Math.floor(diff / 3600);

                return `${hours} hour${
                    hours === 1 ? "" : "s"
                } ago`;

            }

            if (diff < 604800) {

                const days =
                    Math.floor(diff / 86400);

                return `${days} day${
                    days === 1 ? "" : "s"
                } ago`;

            }

            return date.toLocaleDateString(
                undefined,
                {
                    dateStyle: "medium",
                }
            );

        } catch {

            return "Unknown";

        }

    };


    // =========================================
    // SESSION DETAILS
    // =========================================

    const getBrowserText = (session) => {

        return session.browser &&
            session.browser !== "Unknown"
            ? session.browser
            : "Unknown browser";

    };


    const getOperatingSystemText = (session) => {

        return session.operating_system &&
            session.operating_system !== "Unknown"
            ? session.operating_system
            : "Unknown operating system";

    };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <main className="connected-devices-page">

                <div className="connected-devices-loading">

                    <div className="connected-devices-spinner" />

                    <span>
                        Loading connected devices...
                    </span>

                </div>

            </main>

        );

    }


    // =========================================
    // PAGE
    // =========================================

    return (

        <main className="connected-devices-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <div className="connected-devices-header">

                <button
                    type="button"
                    className="connected-devices-back"
                    onClick={handleBack}
                >

                    <ArrowLeft size={17} />

                    <span>
                        Back
                    </span>

                </button>


                <div className="connected-devices-title">

                    <div className="connected-devices-title-icon">

                        <Monitor size={22} />

                    </div>

                    <div>

                        <h1>
                            Connected Devices
                        </h1>

                        <p>
                            Manage devices and active sessions
                            connected to your account.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="refresh-sessions-button"
                    onClick={() =>
                        loadSessions(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "refresh-spinning"
                                : ""
                        }
                    />

                    <span>
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </span>

                </button>

            </div>


            {/* =====================================
                SECURITY INFO
            ===================================== */}

            <section className="devices-security-banner">

                <div className="devices-security-icon">

                    <ShieldCheck size={21} />

                </div>

                <div>

                    <strong>
                        Keep your account secure
                    </strong>

                    <p>
                        Review the devices that are currently
                        signed in to your account. If you don't
                        recognize a session, sign it out.
                    </p>

                </div>

            </section>


            {/* =====================================
                ERROR
            ===================================== */}

            {error && (

                <div className="devices-error">

                    <AlertTriangle size={19} />

                    <div>

                        <strong>
                            Unable to load sessions
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadSessions(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =====================================
                SESSION SUMMARY
            ===================================== */}

            {!error && (

                <div className="devices-summary">

                    <div>

                        <span>
                            Active Sessions
                        </span>

                        <strong>
                            {sessions.length}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Current Device
                        </span>

                        <strong>
                            {
                                sessions.some(
                                    session =>
                                        session.is_current
                                )
                                    ? "This device"
                                    : "Unknown"
                            }
                        </strong>

                    </div>

                </div>

            )}


            {/* =====================================
                EMPTY STATE
            ===================================== */}

            {!error &&
                sessions.length === 0 && (

                    <div className="devices-empty">

                        <div className="devices-empty-icon">

                            <Monitor size={28} />

                        </div>

                        <h2>
                            No active sessions
                        </h2>

                        <p>
                            There are currently no active
                            sessions associated with your
                            account.
                        </p>

                    </div>

                )}


            {/* =====================================
                SESSION LIST
            ===================================== */}

            {!error &&
                sessions.length > 0 && (

                    <section className="sessions-section">

                        <div className="sessions-section-heading">

                            <div>

                                <h2>
                                    Your Sessions
                                </h2>

                                <p>
                                    Devices currently signed in
                                    to your account.
                                </p>

                            </div>

                        </div>


                        <div className="sessions-list">

                            {sessions.map(
                                (session) => (

                                    <article
                                        key={session.id}
                                        className={
                                            session.is_current
                                                ? "session-card current"
                                                : "session-card"
                                        }
                                    >

                                        {/* DEVICE ICON */}

                                        <div
                                            className={
                                                session.is_current
                                                    ? "session-device-icon current"
                                                    : "session-device-icon"
                                            }
                                        >

                                            {getDeviceIcon(
                                                session
                                            )}

                                        </div>


                                        {/* MAIN CONTENT */}

                                        <div className="session-main">

                                            <div className="session-top-row">

                                                <div>

                                                    <h3>

                                                        {session.device_name &&
                                                        session.device_name !==
                                                            "Unknown Device"
                                                            ? session.device_name
                                                            : session.device_type ||
                                                              "Unknown Device"}

                                                    </h3>

                                                    {session.is_current && (

                                                        <span className="current-badge">

                                                            <CircleCheck
                                                                size={13}
                                                            />

                                                            Current Device

                                                        </span>

                                                    )}

                                                </div>

                                            </div>


                                            <div className="session-details">

                                                <div className="session-detail">

                                                    <Globe
                                                        size={14}
                                                    />

                                                    <span>
                                                        {getBrowserText(
                                                            session
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="session-detail">

                                                    <Monitor
                                                        size={14}
                                                    />

                                                    <span>
                                                        {getOperatingSystemText(
                                                            session
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="session-detail">

                                                    <span className="detail-label">
                                                        IP
                                                    </span>

                                                    <span>
                                                        {
                                                            session.ip_address ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="session-meta">

                                                <div className="session-meta-item">

                                                    <Clock3
                                                        size={14}
                                                    />

                                                    <span>
                                                        Last active{" "}
                                                        {
                                                            formatLastActive(
                                                                session.last_active_at
                                                            )
                                                        }
                                                    </span>

                                                </div>


                                                <span className="session-created">

                                                    Signed in{" "}

                                                    {
                                                        formatDateTime(
                                                            session.created_at
                                                        )
                                                    }

                                                </span>

                                            </div>

                                        </div>


                                        {/* ACTION */}

                                        <div className="session-action">

                                            {session.is_current ? (

                                                <span className="current-session-label">

                                                    <ShieldCheck
                                                        size={15}
                                                    />

                                                    Active

                                                </span>

                                            ) : (

                                                <button
                                                    type="button"
                                                    className="signout-session-button"
                                                    onClick={() => 
                                                        handleSignOutSession(session.session_id)
                                                    }
                                                    disabled={
                                                        signingOutSession ===
                                                        session.session_id
                                                    }
                                                >

                                                    {signingOutSession === session.session_id ? (
                                                        <>
                                                            <RefreshCw
                                                                size={15}
                                                                className="refresh-spinning"
                                                            />

                                                            Signing out...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LogOut size={15} />

                                                            Sign out
                                                        </>
                                                    )}
                                                </button>

                                            )}

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    </section>

                )}


            {/* =====================================
                FOOTER NOTE
            ===================================== */}

            <div className="devices-footer-note">

                <ShieldCheck size={16} />

                <span>
                    Signing out of a device will revoke
                    its active session and prevent further
                    access from that device.
                </span>

            </div>

        </main>

    );

}