"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    Bell,
    Search,
    ChevronDown,
    FileText,
    MessageSquare,
    Building2,
    LogIn,
    LogOut,
    User,
    Settings,
    ShieldCheck,
    X,
    Mail,
    Lock,
    Loader2,
} from "lucide-react";

import "./Topbar.css";


export default function Topbar({
    onOpenSettings,
    selectedModel,
    setSelectedModel,
    onSelectConversation,
    onSelectWorkspace,
}) {

    // =========================================
    // AUTH STATE
    // =========================================

    const router = useRouter();

    const [isLoggedIn, setIsLoggedIn] =
        useState(false);

    const [profileOpen, setProfileOpen] =
        useState(false);

    const [loginOpen, setLoginOpen] =
        useState(false);

    const [modelOpen, setModelOpen] =
        useState(false);

    const [user, setUser] =
        useState(null);

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [loginError, setLoginError] =
        useState("");


    // =========================================
    // SEARCH STATE
    // =========================================

    const [searchQuery, setSearchQuery] =
        useState("");

    const [searchResults, setSearchResults] =
        useState([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);


    // =========================================
    // DOCUMENT PREVIEW STATE
    // =========================================

    const [previewDocument, setPreviewDocument] =
        useState(null);

    const [previewUrl, setPreviewUrl] =
        useState(null);

    const [previewLoading, setPreviewLoading] =
        useState(false);

    const [previewError, setPreviewError] =
        useState("");
    
// =========================================
// NOTIFICATIONS
// =========================================

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [notificationLoading, setNotificationLoading] =
        useState(false);    

    // =========================================
    // RESTORE LOGIN
    // =========================================

    useEffect(() => {

        const token =
            localStorage.getItem("access_token");

        const savedUser =
            localStorage.getItem("current_user");


        if (token && savedUser) {

            try {

                const savedUserData =
                    JSON.parse(savedUser);

                setUser(savedUserData);

                setEmail(
                    savedUserData.email || ""
                );

                setIsLoggedIn(true);

            } catch (error) {

                console.error(
                    "Failed to restore user:",
                    error
                );

                localStorage.removeItem(
                    "current_user"
                );

            }

        }

    }, []);


    // =========================================
    // CLEAN PREVIEW URL
    // =========================================

    useEffect(() => {

        return () => {

            if (previewUrl) {

                URL.revokeObjectURL(
                    previewUrl
                );

            }

        };

    }, [previewUrl]);


    // =========================================
    // OPEN LOGIN
    // =========================================

    const handleOpenLogin = () => {

        setProfileOpen(false);

        setLoginError("");

        setLoginOpen(true);

    };


    // =========================================
    // LOGIN
    // =========================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setLoginError("");


        if (
            !email.trim() ||
            !password.trim()
        ) {

            setLoginError(
                "Please enter your email and password."
            );

            return;

        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://52.66.236.4:8000/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email,
                        password,
                    }),

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Invalid email or password."
                );

            }


            // SAVE AUTH DATA

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh_token
            );

            localStorage.setItem(
                "current_user",
                JSON.stringify(data.user)
            );


            // UPDATE UI

            setUser(data.user);

            setEmail(
                data.user.email || ""
            );

            setIsLoggedIn(true);

            setLoginOpen(false);

            setProfileOpen(false);

            setPassword("");


            console.log(
                "Login successful:",
                data.user
            );


        } catch (error) {

            console.error(
                "Login failed:",
                error
            );

            setLoginError(
                error.message ||
                "Unable to sign in."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        localStorage.removeItem(
            "current_user"
        );


        setIsLoggedIn(false);

        setUser(null);

        setEmail("");

        setPassword("");

        setProfileOpen(false);


        router.push("/login");

    };


    // =========================================
    // PROFILE
    // =========================================

    const handleProfile = () => {

        setProfileOpen(false);

        router.push("/profile");

    };


    // =========================================
    // SETTINGS
    // =========================================

    const handleSettings = () => {

        setProfileOpen(false);

        if (onOpenSettings) {
            onOpenSettings();
        }

    };


    // =========================================
    // SECURITY
    // =========================================

    const handleSecurity = () => {

        setProfileOpen(false);

        router.push("/security");

    };


// =========================================
// LOAD NOTIFICATIONS
// =========================================

    const loadNotifications = async () => {

        try {
 
            setNotificationLoading(true);

            const token =
                localStorage.getItem("access_token");

            if (!token) {

                setNotifications([]);
                setUnreadCount(0);

                return;
            }

            const response = await fetch(
                "http://52.66.236.4:8000/me/notifications/list",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to load notifications."
                );
            }

            const data =
                await response.json();

            console.log(
                "Notifications:",
                data
            );

            setNotifications(
                data.notifications || []
            );

            setUnreadCount(
                data.unread_count || 0
            );

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        } finally {

            setNotificationLoading(false);

        }
    };


// =========================================
// TOGGLE NOTIFICATION PANEL
// =========================================

    const handleNotificationClick = () => {

        setNotificationOpen(
            (previous) => !previous
        );

        if (!notificationOpen) {

            loadNotifications();

        }

    };


// =========================================
// MARK NOTIFICATION AS READ
// =========================================

    const handleNotificationRead = async (
        notification
    ) => {

        try {

            if (!notification.is_read) {

                const token =
                    localStorage.getItem(
                        "access_token"
                    );

                const response = await fetch(
                    `http://52.66.236.4:8000/me/notifications/${notification.id}/read`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {

                    throw new Error(
                        "Failed to mark notification as read."
                    );

                }

                setNotifications(
                    (previous) =>
                        previous.map((item) =>
                            item.id === notification.id
                                ? {
                                    ...item,
                                    is_read: true,
                                }
                                : item
                        )
                );

                setUnreadCount(
                    (previous) =>
                        Math.max(previous - 1, 0)
                );

            }

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }

    };


// =========================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================

    const handleMarkAllAsRead = async () => {

        try {

            const token =
                localStorage.getItem(
                    "access_token"
                );

            const response = await fetch(
                "http://52.66.236.4:8000/me/notifications/read-all",
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to mark all notifications as read."
                );

            }

            setNotifications(
                (previous) =>
                    previous.map((notification) => ({
                        ...notification,
                        is_read: true,
                    }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error
            );

        }

    };


    // =========================================
    // GLOBAL SEARCH
    // =========================================

    const handleSearch = async (value) => {

        setSearchQuery(value);


        if (!value.trim()) {

            setSearchResults([]);

            setSearchOpen(false);

            return;

        }


        try {

            setSearchLoading(true);

            setSearchOpen(true);


            const token =
                localStorage.getItem(
                    "access_token"
                );


            const response = await fetch(
                `http://52.66.236.4:8000/search?q=${encodeURIComponent(
                    value
                )}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to perform global search."
                );

            }


            const data =
                await response.json();


            setSearchResults(
                data.results || []
            );


        } catch (error) {

            console.error(
                "Global search failed:",
                error
            );

            setSearchResults([]);

        } finally {

            setSearchLoading(false);

        }

    };


    // =========================================
    // DOCUMENT PREVIEW
    // =========================================

    const loadDocumentPreview = async (
        document
    ) => {

        setPreviewDocument(document);

        setPreviewUrl(null);

        setPreviewError("");

        setPreviewLoading(true);


        try {

            const token =
                localStorage.getItem(
                    "access_token"
                );


            if (!token) {

                throw new Error(
                    "Authentication required."
                );

            }


            const response = await fetch(
                `http://52.66.236.4:8000/workspaces/${document.workspace_id}/documents/${document.id}/preview`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },

                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Preview request failed:",
                    errorText
                );

                throw new Error(
                    "Unable to load document preview."
                );

            }


            const blob =
                await response.blob();


            const url =
                URL.createObjectURL(blob);


            setPreviewUrl(url);


        } catch (error) {

            console.error(
                "Document preview failed:",
                error
            );

            setPreviewError(
                error.message ||
                "Unable to preview document."
            );

        } finally {

            setPreviewLoading(false);

        }

    };


    // =========================================
    // SEARCH RESULT CLICK
    // =========================================

    const handleSearchResultClick = (
        result
    ) => {

        console.log(
            "Search result clicked:",
            result
        );


        // =====================================
        // DOCUMENT
        // =====================================

        if (
            result.type === "document"
        ) {

            loadDocumentPreview(
                result
            );

            setSearchOpen(false);

            setSearchQuery("");

            return;

        }


        // =====================================
        // MESSAGE
        // =====================================

        if (
            result.type === "message"
        ) {

            console.log(
                "Opening message:",
                result.message_id
            );

            console.log(
                "Conversation session:",
                result.session_id
            );


            if (
                onSelectConversation &&
                result.session_id
            ) {

                onSelectConversation(
                    result.session_id,
                    result.message_id
                );

            } else {

                console.error(
                    "Missing conversation data:",
                    {
                        hasCallback:
                            !!onSelectConversation,

                        sessionId:
                            result.session_id,

                        messageId:
                            result.message_id,
                    }
                );

            }


            setSearchOpen(false);

            setSearchQuery("");

            return;

        }


        // =====================================
        // CONVERSATION
        // =====================================

        if (
            result.type === "conversation"
        ) {

            console.log(
                "Opening conversation:",
                result.session_id
            );


            if (
                onSelectConversation &&
                result.session_id
            ) {

                onSelectConversation(
                    result.session_id,
                    null
                );

            } else {

                console.error(
                    "Missing conversation session:",
                    result.session_id
                );

            }


            setSearchOpen(false);

            setSearchQuery("");

            return;

        }


        // =====================================
        // WORKSPACE
        // =====================================

        if (
            result.type === "workspace"
        ) {

            console.log(
                "Workspace clicked:",
                result
            );


            /*
             * Backend search result may provide
             * workspace_id OR id.
             */

            const workspaceId =
                result.workspace_id ||
                result.id;


            if (
                onSelectWorkspace &&
                workspaceId
            ) {

                onSelectWorkspace(
                    workspaceId
                );

            } else {

                console.error(
                    "Missing workspace data:",
                    {
                        hasCallback:
                            !!onSelectWorkspace,

                        workspaceId:
                            workspaceId,

                        result:
                            result,
                    }
                );

            }


            setSearchOpen(false);

            setSearchQuery("");

            return;

        }


        // =====================================
        // FALLBACK
        // =====================================

        setSearchOpen(false);

        setSearchQuery("");

    };


    // =========================================
    // RENDER
    // =========================================

    return (

        <>

            {/* =========================================
                TOPBAR
            ========================================= */}

            <header className="topbar">

                <div className="topbar-left">

                    <h1>
                        AI Workspace Assistant
                    </h1>

                </div>


                <div className="topbar-right">


                    {/* =================================
                        SEARCH
                    ================================= */}

                    <div className="search-container">

                        <div className="search-box">

                            <Search size={18} />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    handleSearch(
                                        event.target.value
                                    )
                                }
                                onFocus={() => {

                                    if (
                                        searchQuery.trim()
                                    ) {

                                        setSearchOpen(
                                            true
                                        );

                                    }

                                }}
                                placeholder="Search documents, chats, workspaces..."
                            />

                        </div>


                        {/* SEARCH RESULTS */}

                        {searchOpen && (

                            <div className="search-results">

                                {searchLoading ? (

                                    <div className="search-message">

                                        Searching...

                                    </div>

                                ) : searchResults.length > 0 ? (

                                    searchResults.map(
                                        (result) => (

                                            <button
                                                key={`${result.type}-${result.id}`}
                                                type="button"
                                                className="search-result-item"
                                                onClick={() =>
                                                    handleSearchResultClick(
                                                        result
                                                    )
                                                }
                                            >

                                                <div className="search-result-icon">

                                                    {result.type ===
                                                    "document" ? (

                                                        <FileText
                                                            size={17}
                                                        />

                                                    ) : result.type ===
                                                      "conversation" ? (

                                                        <MessageSquare
                                                            size={17}
                                                        />

                                                    ) : result.type ===
                                                      "workspace" ? (

                                                        <Building2
                                                            size={17}
                                                        />

                                                    ) : (

                                                        <MessageSquare
                                                            size={17}
                                                        />

                                                    )}

                                                </div>


                                                <div className="search-result-info">

                                                    <span className="search-result-name">

                                                        {result.title}

                                                    </span>


                                                    <span className="search-result-type">

                                                        {result.type ===
                                                        "document"
                                                            ? "Document"
                                                            : result.type ===
                                                              "workspace"
                                                            ? "Workspace"
                                                            : result.type ===
                                                              "conversation"
                                                            ? "Conversation"
                                                            : "Message"}

                                                        {result.subtitle
                                                            ? ` • ${result.subtitle}`
                                                            : ""}

                                                    </span>

                                                </div>

                                            </button>

                                        )
                                    )

                                ) : (

                                    <div className="search-message">

                                        No results found.

                                    </div>

                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================
                        MODEL
                    ================================= */}

                    <div className="model-selector">

                        <button
                            className="model-btn"
                            type="button"
                            onClick={() =>
                                setModelOpen(
                                    !modelOpen
                                )
                            }
                        >

                            {selectedModel ===
                            "gemini-3.5-flash"
                                ? "Gemini Flash"
                                : "Gemini Pro"}

                            <ChevronDown
                                size={16}
                            />

                        </button>


                        {modelOpen && (

                            <div className="model-dropdown">

                                <button
                                    type="button"
                                    onClick={() => {

                                        setSelectedModel(
                                            "gemini-3.5-flash"
                                        );

                                        setModelOpen(
                                            false
                                        );

                                    }}
                                >

                                    {selectedModel ===
                                    "gemini-3.5-flash"
                                        ? "✓ "
                                        : ""}

                                    Gemini Flash

                                </button>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setSelectedModel(
                                            "gemini-3.1-pro-preview"
                                        );

                                        setModelOpen(
                                            false
                                        );

                                    }}
                                >

                                    {selectedModel ===
                                    "gemini-3.1-pro-preview"
                                        ? "✓ "
                                        : ""}

                                    Gemini Pro

                                </button>

                            </div>

                        )}

                    </div>


                    {/* =================================
                        NOTIFICATION
                    ================================= */}
                    <div className="notification-container">
                        <button
                            className="icon-btn notification-btn"
                            type="button"
                            onClick={handleNotificationClick}
                            aria-label="Notifications"
                        >

                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        

                    </button>

                    {/* =================================
                        NOTIFICATION DROPDOWN
                        ================================= */}

                    {notificationOpen && (

                        <div className="notification-dropdown">

                            {/* HEADER */}

                            <div className="notification-header">

                                <div>

                                    <h3>
                                        Notifications
                                    </h3>

                                    <span>
                                        {unreadCount > 0
                                            ? `${unreadCount} unread`
                                            : "You're all caught up"}
                                    </span>

                                </div>


                                {unreadCount > 0 && (

                                    <button
                                        type="button"
                                        className="mark-all-read-btn"
                                        onClick={
                                            handleMarkAllAsRead
                                        }
                                    >
                                        Mark all as read
                                    </button>

                                )}

                            </div>


                            {/* CONTENT */}

                            <div className="notification-list">

                                {notificationLoading ? (

                                    <div className="notification-state">

                                        <Loader2
                                            size={22}
                                            className="login-spinner"
                                        />

                                        <span>
                                            Loading notifications...
                                        </span>

                                    </div>

                                ) : notifications.length === 0 ? (

                                    <div className="notification-state">

                                        <Bell size={30} />

                                        <strong>
                                            No notifications
                                        </strong>

                                        <span>
                                            You're all caught up.
                                        </span>

                                    </div>

                                ) : (

                                    notifications.map(
                                        (notification) => (

                                            <button
                                                key={
                                                    notification.id
                                                }
                                                type="button"
                                                className={
                                                    notification.is_read
                                                        ? "notification-item"
                                                        : "notification-item unread"
                                                }
                                                onClick={() =>
                                                    handleNotificationRead(
                                                        notification
                                                    )
                                                }
                                            >

                                                <div className="notification-item-icon">

                                                    {notification.type ===
                                                    "document" ? (
                                                        <FileText
                                                            size={17}
                                                        />
                                                    ) : notification.type ===
                                                        "workspace" ? (
                                                        <Building2
                                                            size={17}
                                                        />
                                                    ) : (
                                                        <MessageSquare
                                                            size={17}
                                                        />
                                                    )}

                                                </div>


                                                <div className="notification-item-content">

                                                    <div className="notification-item-title">

                                                        {notification.title}

                                                        {!notification.is_read && (

                                                            <span className="notification-unread-dot" />

                                                        )}

                                                    </div>


                                                <p>
                                                    {notification.message}
                                                </p>


                                                <span className="notification-time">

                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleString()}

                                                </span>

                                            </div>

                                        </button>

                                    )
                                )

                            )}

                        </div>

                    </div>

                )}

            </div>


                    {/* =================================
                        PROFILE
                    ================================= */}

                    <div className="profile-container">

                        <button
                            type="button"
                            className="profile-chip"
                            onClick={() =>
                                setProfileOpen(
                                    !profileOpen
                                )
                            }
                        >

                            <div className="profile-avatar">

                                {isLoggedIn
                                    ? email
                                          .charAt(0)
                                          .toUpperCase()
                                    : "R"}

                            </div>


                            <span>

                                {isLoggedIn
                                    ? email.split(
                                          "@"
                                      )[0]
                                    : "Rajat"}

                            </span>


                            <ChevronDown
                                size={15}
                                className={
                                    profileOpen
                                        ? "profile-chevron open"
                                        : "profile-chevron"
                                }
                            />

                        </button>


                        {profileOpen && (

                            <div className="profile-dropdown">

                                {isLoggedIn ? (

                                    <>

                                        <div className="profile-user-info">

                                            <div className="profile-large-avatar">

                                                {email
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}

                                            </div>


                                            <div>

                                                <strong>
                                                    {email.split(
                                                        "@"
                                                    )[0]}
                                                </strong>

                                                <span>
                                                    {email}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="profile-divider" />


                                        <button
                                            className="profile-menu-item"
                                            type="button"
                                            onClick={
                                                handleProfile
                                            }
                                        >

                                            <User
                                                size={17}
                                            />

                                            <span>
                                                Profile
                                            </span>

                                        </button>


                                        <button
                                            className="profile-menu-item"
                                            type="button"
                                            onClick={
                                                handleSettings
                                            }
                                        >

                                            <Settings
                                                size={17}
                                            />

                                            <span>
                                                Settings
                                            </span>

                                        </button>


                                        <button
                                            className="profile-menu-item"
                                            type="button"
                                            onClick={
                                                handleSecurity
                                            }
                                        >

                                            <ShieldCheck
                                                size={17}
                                            />

                                            <span>
                                                Security
                                            </span>

                                        </button>


                                        <div className="profile-divider" />


                                        <button
                                            className="profile-menu-item logout"
                                            type="button"
                                            onClick={
                                                handleLogout
                                            }
                                        >

                                            <LogOut
                                                size={17}
                                            />

                                            <span>
                                                Sign out
                                            </span>

                                        </button>

                                    </>

                                ) : (

                                    <>

                                        <div className="profile-login-header">

                                            <div className="profile-large-avatar">
                                                R
                                            </div>

                                            <div>

                                                <strong>
                                                    Welcome back
                                                </strong>

                                                <span>
                                                    Sign in to your workspace
                                                </span>

                                            </div>

                                        </div>


                                        <div className="profile-divider" />


                                        <button
                                            className="profile-login-button"
                                            type="button"
                                            onClick={
                                                handleOpenLogin
                                            }
                                        >

                                            <LogIn
                                                size={17}
                                            />

                                            Sign in

                                        </button>

                                    </>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            </header>


            {/* =========================================
                LOGIN MODAL
            ========================================= */}

            {loginOpen && (

                <div
                    className="login-overlay"
                    onMouseDown={() =>
                        setLoginOpen(false)
                    }
                >

                    <div
                        className="login-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="login-close"
                            onClick={() =>
                                setLoginOpen(false)
                            }
                        >

                            <X size={18} />

                        </button>


                        <div className="login-header">

                            <div className="login-icon">

                                <LogIn size={22} />

                            </div>

                            <h2>
                                Welcome back
                            </h2>

                            <p>
                                Sign in to your AI workspace
                                to continue.
                            </p>

                        </div>


                        <form
                            className="login-form"
                            onSubmit={handleLogin}
                        >

                            <div className="login-field">

                                <label>
                                    Email address
                                </label>

                                <div className="login-input-wrapper">

                                    <Mail size={17} />

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            <div className="login-field">

                                <label>
                                    Password
                                </label>

                                <div className="login-input-wrapper">

                                    <Lock size={17} />

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />

                                </div>

                            </div>


                            {loginError && (

                                <div className="login-error">

                                    {loginError}

                                </div>

                            )}


                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>
                                        <Loader2
                                            size={17}
                                            className="login-spinner"
                                        />

                                        Signing in...
                                    </>

                                ) : (

                                    <>
                                        <LogIn
                                            size={17}
                                        />

                                        Sign in

                                    </>

                                )}

                            </button>

                        </form>


                        <div className="login-security-note">

                            <ShieldCheck size={15} />

                            <span>
                                Your workspace is protected
                                with secure authentication.
                            </span>

                        </div>

                    </div>

                </div>

            )}


            {/* =========================================
                DOCUMENT PREVIEW MODAL
            ========================================= */}

            {previewDocument && (

                <div
                    className="document-preview-overlay"
                    onMouseDown={() => {

                        setPreviewDocument(
                            null
                        );

                        setPreviewError("");

                        setPreviewUrl(null);

                    }}
                >

                    <div
                        className="document-preview-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="document-preview-header">

                            <div className="document-preview-title">

                                <FileText size={19} />

                                <div>

                                    <strong>
                                        {
                                            previewDocument.filename
                                        }
                                    </strong>

                                    <span>

                                        {
                                            previewDocument.file_type ||
                                            previewDocument.subtitle ||
                                            "Document"
                                        }

                                    </span>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="document-preview-close"
                                onClick={() => {

                                    setPreviewDocument(
                                        null
                                    );

                                    setPreviewError(
                                        ""
                                    );

                                    setPreviewUrl(
                                        null
                                    );

                                }}
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <div className="document-preview-body">

                            {previewLoading ? (

                                <div className="document-preview-unsupported">

                                    <Loader2
                                        size={32}
                                        className="login-spinner"
                                    />

                                    <h3>
                                        Loading Preview....
                                    </h3>

                                    <p>
                                        Please wait while the
                                        document is loaded.
                                    </p>

                                </div>

                            ) : previewError ? (

                                <div className="document-preview-unsupported">

                                    <FileText size={42} />

                                    <h3>
                                        Preview unavailable
                                    </h3>

                                    <p>
                                        {previewError}
                                    </p>

                                </div>

                            ) : previewUrl ? (

                                <iframe
                                    src={previewUrl}
                                    title={
                                        previewDocument.filename
                                    }
                                    className="document-preview-frame"
                                />

                            ) : (

                                <div className="document-preview-unsupported">

                                    <FileText size={42} />

                                    <h3>
                                        Preview unavailable
                                    </h3>

                                    <p>
                                        Unable to load the
                                        document preview.
                                    </p>

                                </div>

                            )}

                        </div>


                        <div className="document-preview-footer">

                            <span>
                                {
                                    previewDocument.filename
                                }
                            </span>


                            {previewUrl && (

                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="document-preview-open"
                                >
                                    Open in new tab
                                </a>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}