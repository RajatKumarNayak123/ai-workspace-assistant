"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    CheckCircle2,
    CalendarDays,
    Copy,
    Check,
    Pencil,
    ChevronRight,
    LockKeyhole,
    Bell,
    Monitor,
    FileText,
    MessageSquare,
    LayoutGrid,
    Clock3,
    ShieldCheck,
} from "lucide-react";

import api from "../../services/api";
import "./profile.css";


export default function ProfilePage() {

    const router = useRouter();

    // =========================================
    // STATE
    // =========================================

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [copied, setCopied] = useState(false);

    const [editing, setEditing] = useState(false);

    const [fullName, setFullName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    // =========================================
    // LOAD USER
    // =========================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await api.get("/me");

                const userData =
                    response.data;

                setUser(userData);

                setFullName(
                    userData.full_name || ""
                );

                // Keep localStorage synchronized
                localStorage.setItem(
                    "current_user",
                    JSON.stringify(userData)
                );

            } catch (error) {

                console.error(
                    "Failed to load profile:",
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
                    "Unable to load your profile."
                );

            } finally {

                setLoading(false);

            }

        };


        loadProfile();

    }, [router]);


    // =========================================
    // COPY USER ID
    // =========================================

    const copyUserId = async () => {

        if (!user?.id) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                String(user.id)
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1800);

        } catch (error) {

            console.error(
                "Failed to copy user ID:",
                error
            );

        }

    };


    // =========================================
    // SAVE PROFILE
    // =========================================
    //
    // NOTE:
    // Backend update endpoint is not assumed here.
    //
    // Once PUT /me or PATCH /me exists,
    // connect it here.
    //
    // =========================================

    const handleSaveProfile = async () => {

        const trimmedName = fullName.trim();

        if (!trimmedName) {
            setSaveError("Full name cannot be empty.");
            return;
        }

        if (trimmedName.length < 2) {
            setSaveError("Full name must contain at least 2 characters.");
            return;
        }

        try {

            setSaving(true);
            setSaveError("");

            const response = await api.put("/me", {
                full_name: trimmedName,
                email: user.email,
            });

            console.log(
                "Profile updated:",
                response.data
            );

            const updatedUser =
                response.data.user;

            // Update React state
            setUser(updatedUser);

            // Keep edit field synchronized
            setFullName(
                updatedUser.full_name || ""
            );

            // Keep login/profile data synchronized
            localStorage.setItem(
                "current_user",
                JSON.stringify(updatedUser)
            );

            // Close modal
            setSaveSuccess("Profile updated successfully.");
            setEditing(false);
            setTimeout(() => {
                setSaveSuccess("");
            }, 3000);

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("current_user");

                router.push("/login");

                return;
            }

            setSaveError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to update your profile."
            );

        } finally {

            setSaving(false);

        }
    };


    // =========================================
    // BACK
    // =========================================

    const handleBack = () => {

        router.back();

    };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <main className="profile-page">

                <div className="profile-loading">

                    <div className="profile-loading-spinner" />

                    <span>
                        Loading profile...
                    </span>

                </div>

            </main>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error || !user) {

        return (

            <main className="profile-page">

                <div className="profile-error">

                    <ShieldCheck size={32} />

                    <h2>
                        Unable to load profile
                    </h2>

                    <p>
                        {error ||
                            "Profile information is unavailable."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/")}
                    >
                        Back to workspace
                    </button>

                </div>

            </main>

        );

    }


    // =========================================
    // USER VALUES
    // =========================================

    const displayName =
        user.full_name ||
        "User";

    const email =
        user.email ||
        "—";

    const role =
        user.role ||
        "USER";

    const isActive =
        user.is_active === true;

    const initial =
        displayName
            .charAt(0)
            .toUpperCase();


    return (

        <main className="profile-page">

            {/* =====================================
                PAGE HEADER
            ===================================== */}
            {saveSuccess && (
                <div className="profile-success-toast">
                    <CheckCircle2 size={18} />
                    <span>{saveSuccess}</span>
                </div>
            )}
            <div className="profile-page-header">

                <button
                    type="button"
                    className="profile-back-button"
                    onClick={handleBack}
                >

                    <ArrowLeft size={17} />

                    <span>
                        Back
                    </span>

                </button>


                <div>

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Manage your account information
                        and preferences.
                    </p>

                </div>

            </div>


            {/* =====================================
                MAIN GRID
            ===================================== */}

            <div className="profile-layout">


                {/* =================================
                    LEFT COLUMN
                ================================= */}

                <div className="profile-main-column">


                    {/* =================================
                        PROFILE HERO
                    ================================= */}

                    <section className="profile-hero-card">

                        <div className="profile-hero-content">

                            <div className="profile-avatar-large">

                                {initial}

                            </div>


                            <div className="profile-hero-info">

                                <div className="profile-name-row">

                                    <h2>
                                        {displayName}
                                    </h2>

                                    <span className="profile-role-badge">

                                        {role}

                                    </span>

                                </div>


                                <div className="profile-email-row">

                                    <Mail size={16} />

                                    <span>
                                        {email}
                                    </span>

                                    <span className="profile-verified">

                                        <CheckCircle2
                                            size={14}
                                        />

                                        Verified

                                    </span>

                                </div>


                                <div className="profile-member-row">

                                    <CalendarDays
                                        size={15}
                                    />

                                    <span>
                                        Account ID #{user.id}
                                    </span>

                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="profile-edit-main-button"
                            onClick={() =>{
                                setFullName(user.full_name || "");
                                setSaveError("");
                                setEditing(true)
                            }}
                        >

                            <Pencil size={16} />

                            Edit Profile

                        </button>

                    </section>


                    {/* =================================
                        ACCOUNT INFORMATION
                    ================================= */}

                    <section className="profile-section">

                        <div className="profile-section-heading">

                            <div className="section-heading-icon">

                                <User size={18} />

                            </div>

                            <div>

                                <h2>
                                    Account Information
                                </h2>

                                <p>
                                    Your basic account details
                                </p>

                            </div>

                        </div>


                        <div className="account-info-card">


                            {/* FULL NAME */}

                            <div className="account-info-row">

                                <div className="account-info-icon blue">

                                    <User size={19} />

                                </div>


                                <div className="account-info-content">

                                    <span className="account-info-label">
                                        Full Name
                                    </span>

                                    <strong>
                                        {displayName}
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="small-edit-button"
                                    onClick={() =>
                                        setEditing(true)
                                    }
                                >

                                    <Pencil size={14} />

                                    Edit

                                </button>

                            </div>


                            {/* EMAIL */}

                            <div className="account-info-row">

                                <div className="account-info-icon purple">

                                    <Mail size={19} />

                                </div>


                                <div className="account-info-content">

                                    <span className="account-info-label">
                                        Email Address
                                    </span>

                                    <strong>
                                        {email}
                                    </strong>

                                </div>


                                <span className="status-badge verified">

                                    <CheckCircle2
                                        size={14}
                                    />

                                    Verified

                                </span>

                            </div>


                            {/* ROLE */}

                            <div className="account-info-row">

                                <div className="account-info-icon violet">

                                    <Shield size={19} />

                                </div>


                                <div className="account-info-content">

                                    <span className="account-info-label">
                                        Account Role
                                    </span>

                                    <strong>
                                        {role}
                                    </strong>

                                </div>


                                <span className="access-badge">
                                    Standard Access
                                </span>

                            </div>


                            {/* STATUS */}

                            <div className="account-info-row">

                                <div className="account-info-icon green">

                                    <CheckCircle2 size={19} />

                                </div>


                                <div className="account-info-content">

                                    <span className="account-info-label">
                                        Account Status
                                    </span>

                                    <strong>
                                        {isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </strong>

                                </div>


                                <span
                                    className={
                                        isActive
                                            ? "status-badge active"
                                            : "status-badge inactive"
                                    }
                                >

                                    <span className="status-dot" />

                                    {isActive
                                        ? "Active"
                                        : "Inactive"}

                                </span>

                            </div>


                            {/* ACCOUNT ID */}

                            <div className="account-info-row">

                                <div className="account-info-icon blue">

                                    <FileText size={19} />

                                </div>


                                <div className="account-info-content">

                                    <span className="account-info-label">
                                        User ID
                                    </span>

                                    <strong>
                                        {user.id}
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="copy-button"
                                    onClick={copyUserId}
                                    title="Copy user ID"
                                >

                                    {copied ? (
                                        <Check size={17} />
                                    ) : (
                                        <Copy size={17} />
                                    )}

                                </button>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        ABOUT / BIO
                    ================================= */}

                    <section className="profile-section">

                        <div className="profile-section-heading">

                            <div className="section-heading-icon">

                                <User size={18} />

                            </div>

                            <div>

                                <h2>
                                    About You
                                </h2>

                                <p>
                                    A little information about
                                    your workspace profile
                                </p>

                            </div>

                        </div>


                        <div className="bio-card">

                            <div className="bio-header">

                                <div className="bio-icon">

                                    <User size={18} />

                                </div>

                                <div>

                                    <h3>
                                        Bio
                                    </h3>

                                    <p>
                                        Personal profile
                                        description
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="small-edit-button"
                                >

                                    <Pencil size={14} />

                                    Edit

                                </button>

                            </div>


                            <p className="bio-text">

                                Full Stack Developer passionate
                                about building intelligent,
                                reliable and user-friendly
                                applications.

                            </p>

                        </div>

                    </section>


                </div>


                {/* =================================
                    RIGHT COLUMN
                ================================= */}

                <aside className="profile-sidebar">


                    {/* =================================
                        QUICK ACTIONS
                    ================================= */}

                    <section className="sidebar-card">

                        <div className="sidebar-heading">

                            <span className="heading-accent">
                                ⚡
                            </span>

                            <h2>
                                Quick Actions
                            </h2>

                        </div>


                        <div className="quick-actions">


                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    setEditing(true)
                                }
                            >

                                <div className="quick-icon purple">

                                    <User size={18} />

                                </div>

                                <div>

                                    <strong>
                                        Edit Profile
                                    </strong>

                                    <span>
                                        Update your personal
                                        information
                                    </span>

                                </div>

                                <ChevronRight size={18} />

                            </button>


                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    router.push("/security")
                                }
                            >

                                <div className="quick-icon green">

                                    <LockKeyhole size={18} />

                                </div>

                                <div>

                                    <strong>
                                        Security Settings
                                    </strong>

                                    <span>
                                        Password and account
                                        security
                                    </span>

                                </div>

                                <ChevronRight size={18} />

                            </button>


                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    router.push("/notification-preferences")
                                }
                            >

                                <div className="quick-icon yellow">

                                    <Bell size={18} />

                                </div>

                                <div>

                                    <strong>
                                        Notification Preferences
                                    </strong>

                                    <span>
                                        Manage your notifications
                                    </span>

                                </div>

                                <ChevronRight size={18} />

                            </button>


                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    router.push("/connected-devices")
                                }
                            >

                                <div className="quick-icon blue">

                                    <Monitor size={18} />

                                </div>

                                <div>

                                    <strong>
                                        Connected Devices
                                    </strong>

                                    <span>
                                        Manage active sessions
                                    </span>

                                </div>

                                <ChevronRight size={18} />

                            </button>


                        </div>

                    </section>


                    {/* =================================
                        ACCOUNT OVERVIEW
                    ================================= */}

                    <section className="sidebar-card">

                        <div className="sidebar-heading">

                            <span className="heading-accent blue-text">
                                ◔
                            </span>

                            <h2>
                                Account Overview
                            </h2>

                        </div>


                        <div className="overview-list">


                            <div className="overview-row">

                                <FileText size={17} />

                                <span>
                                    Documents Uploaded
                                </span>

                                <strong>
                                    —
                                </strong>

                            </div>


                            <div className="overview-row">

                                <MessageSquare size={17} />

                                <span>
                                    Conversations
                                </span>

                                <strong>
                                    —
                                </strong>

                            </div>


                            <div className="overview-row">

                                <LayoutGrid size={17} />

                                <span>
                                    Workspaces
                                </span>

                                <strong>
                                    —
                                </strong>

                            </div>


                            <div className="overview-row">

                                <Clock3 size={17} />

                                <span>
                                    Last Login
                                </span>

                                <strong>
                                    —
                                </strong>

                            </div>


                        </div>

                    </section>


                    {/* =================================
                        SECURITY CARD
                    ================================= */}

                    <section className="security-card">

                        <div className="security-card-header">

                            <div className="security-title-icon">

                                <ShieldCheck size={20} />

                            </div>

                            <h2>
                                Security
                            </h2>

                        </div>


                        <div className="security-content">

                            <div>

                                <strong>
                                    Your account is protected
                                </strong>

                                <p>
                                    Keep your account secure by
                                    regularly reviewing your
                                    security settings.
                                </p>

                            </div>


                            <div className="security-illustration">

                                <ShieldCheck size={42} />

                            </div>

                        </div>


                        <button
                            type="button"
                            className="security-button"
                            onClick={() =>
                                router.push("/?section=settings")
                            }
                        >
                            Review Security
                        </button>

                    </section>


                </aside>

            </div>


            {/* =====================================
                EDIT PROFILE MODAL
            ===================================== */}

            {editing && (

                <div
                    className="profile-modal-overlay"
                    onMouseDown={() =>
                        setEditing(false)
                    }
                >

                    <div
                        className="profile-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="profile-modal-header">

                            <div>

                                <h2>
                                    Edit Profile
                                </h2>

                                <p>
                                    Update your profile
                                    information.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(false)
                                }
                                className="modal-close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="profile-edit-field">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="profile-edit-field">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={email}
                                disabled
                            />

                            <small>
                                Email address cannot be
                                changed from this page.
                            </small>

                        </div>
                        

                        <div className="profile-modal-actions">

                            <button
                                type="button"
                                className="modal-cancel"
                                onClick={() =>{
                                    setFullName(user.full_name || "");
                                    setSaveError("");
                                    setEditing(false);
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-save"
                                onClick={handleSaveProfile}
                                disabled={saving}

                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>

    );

}