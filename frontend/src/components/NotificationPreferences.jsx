"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

import {
    Bell,
    Mail,
    Shield,
    Database,
    MessageCircle,
    MessageSquare,
    Monitor,
    Moon,
    ArrowLeft,
    Check,
    Loader2,
    Info,
    Settings as SettingsIcon,
} from "lucide-react";

import "./Settings.css";


const DEFAULT_PREFERENCES = {
    email_security_alerts: true,
    email_account_activity: true,
    email_workspace_activity: true,
    email_document_processing: true,
    email_product_updates: false,

    in_app_chat: true,
    in_app_workspace_activity: true,
    in_app_document_processing: true,
    in_app_system: true,

    do_not_disturb: false,
    quiet_hours_enabled: false,
};


export default function NotificationPreferences() {

    const router = useRouter();

    const [notificationPreferences, setNotificationPreferences] =
        useState(DEFAULT_PREFERENCES);

    const [notificationLoading, setNotificationLoading] =
        useState(true);

    const [notificationSaving, setNotificationSaving] =
        useState(false);

    const [notificationSaved, setNotificationSaved] =
        useState(false);

    const [notificationError, setNotificationError] =
        useState("");


    // =====================================================
    // LOAD NOTIFICATION PREFERENCES
    // =====================================================

    useEffect(() => {

        const loadNotificationPreferences =
            async () => {

                try {

                    setNotificationLoading(true);
                    setNotificationError("");

                    const response =
                        await api.get(
                            "/me/notifications"
                        );

                    setNotificationPreferences({
                        ...DEFAULT_PREFERENCES,
                        ...response.data,
                    });

                } catch (error) {

                    console.error(
                        "Failed to load notification preferences:",
                        error
                    );

                    setNotificationError(
                        error.response?.data?.detail ||
                        "Failed to load notification preferences."
                    );

                } finally {

                    setNotificationLoading(false);

                }

            };


        loadNotificationPreferences();

    }, []);


    // =====================================================
    // TOGGLE NOTIFICATION
    // =====================================================

    const handleNotificationToggle =
        (key) => {

            setNotificationSaved(false);
            setNotificationError("");

            setNotificationPreferences(
                (previous) => ({
                    ...previous,
                    [key]: !previous[key],
                })
            );

        };


    // =====================================================
    // SAVE NOTIFICATION PREFERENCES
    // =====================================================

    const handleSaveNotifications =
        async () => {

            try {

                setNotificationSaving(true);
                setNotificationSaved(false);
                setNotificationError("");

                const response =
                    await api.put(
                        "/me/notifications",
                        notificationPreferences
                    );

                setNotificationPreferences({
                    ...DEFAULT_PREFERENCES,
                    ...response.data,
                });

                setNotificationSaved(true);

                setTimeout(() => {
                    setNotificationSaved(false);
                }, 3000);

            } catch (error) {

                console.error(
                    "Failed to update notification preferences:",
                    error
                );

                setNotificationError(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Failed to update notification preferences."
                );

            } finally {

                setNotificationSaving(false);

            }

        };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="settings-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="settings-detail-header">

                <button
                    className="settings-back-btn"
                    onClick={() => router.back()}
                >

                    <ArrowLeft size={17} />

                    Back

                </button>


                <div className="settings-detail-title">

                    <div className="settings-detail-icon">

                        <Bell size={21} />

                    </div>


                    <div>

                        <h1>
                            Notification Preferences
                        </h1>

                        <p>
                            Choose which notifications
                            you want to receive.
                        </p>

                    </div>

                </div>

            </div>


            <div className="settings-detail-content">


                {/* =================================================
                    LOADING
                ================================================= */}

                {notificationLoading ? (

                    <div className="settings-form-card">

                        <div className="notification-loading">

                            <Loader2
                                size={22}
                                className="notification-spinner"
                            />

                            <span>
                                Loading notification
                                preferences...
                            </span>

                        </div>

                    </div>

                ) : (

                    <>

                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {notificationError && (

                            <div className="notification-error">

                                <Info size={17} />

                                <span>
                                    {notificationError}
                                </span>

                            </div>

                        )}


                        {/* =================================================
                            EMAIL NOTIFICATIONS
                        ================================================= */}

                        <div className="settings-form-card">

                            <div className="settings-form-heading">

                                <div className="notification-heading-row">

                                    <div className="notification-heading-icon email">

                                        <Mail size={19} />

                                    </div>


                                    <div>

                                        <h2>
                                            Email Notifications
                                        </h2>

                                        <p>
                                            Control which activities
                                            can send notifications
                                            to your email address.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <NotificationToggle
                                title="Security Alerts"
                                description="Receive important security and account protection alerts."
                                icon={<Shield size={18} />}
                                value={
                                    notificationPreferences
                                        .email_security_alerts
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "email_security_alerts"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Account Activity"
                                description="Get notified about important activity on your account."
                                icon={<SettingsIcon size={18} />}
                                value={
                                    notificationPreferences
                                        .email_account_activity
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "email_account_activity"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Workspace Activity"
                                description="Receive updates about activity inside your workspace."
                                icon={<Database size={18} />}
                                value={
                                    notificationPreferences
                                        .email_workspace_activity
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "email_workspace_activity"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Document Processing"
                                description="Get updates when documents are processed or completed."
                                icon={<Database size={18} />}
                                value={
                                    notificationPreferences
                                        .email_document_processing
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "email_document_processing"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Product Updates"
                                description="Receive news about new features and improvements."
                                icon={<Bell size={18} />}
                                value={
                                    notificationPreferences
                                        .email_product_updates
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "email_product_updates"
                                    )
                                }
                            />

                        </div>


                        {/* =================================================
                            IN-APP NOTIFICATIONS
                        ================================================= */}

                        <div className="settings-form-card">

                            <div className="settings-form-heading">

                                <div className="notification-heading-row">

                                    <div className="notification-heading-icon app">

                                        <MessageCircle size={19} />

                                    </div>


                                    <div>

                                        <h2>
                                            In-App Notifications
                                        </h2>

                                        <p>
                                            Choose which events
                                            should appear inside
                                            the application.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <NotificationToggle
                                title="Chat Notifications"
                                description="Receive notifications related to conversations and chat activity."
                                icon={<MessageSquare size={18} />}
                                value={
                                    notificationPreferences
                                        .in_app_chat
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "in_app_chat"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Workspace Activity"
                                description="Show notifications for important workspace activity."
                                icon={<Database size={18} />}
                                value={
                                    notificationPreferences
                                        .in_app_workspace_activity
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "in_app_workspace_activity"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Document Processing"
                                description="Show document processing and completion notifications."
                                icon={<Database size={18} />}
                                value={
                                    notificationPreferences
                                        .in_app_document_processing
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "in_app_document_processing"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="System Notifications"
                                description="Receive important system and service notifications."
                                icon={<Monitor size={18} />}
                                value={
                                    notificationPreferences
                                        .in_app_system
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "in_app_system"
                                    )
                                }
                            />

                        </div>


                        {/* =================================================
                            AVAILABILITY
                        ================================================= */}

                        <div className="settings-form-card">

                            <div className="settings-form-heading">

                                <div className="notification-heading-row">

                                    <div className="notification-heading-icon quiet">

                                        <Moon size={19} />

                                    </div>


                                    <div>

                                        <h2>
                                            Availability
                                        </h2>

                                        <p>
                                            Control when notifications
                                            should be delivered.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <NotificationToggle
                                title="Do Not Disturb"
                                description="Temporarily suppress non-critical notifications."
                                icon={<Moon size={18} />}
                                value={
                                    notificationPreferences
                                        .do_not_disturb
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "do_not_disturb"
                                    )
                                }
                            />


                            <NotificationToggle
                                title="Quiet Hours"
                                description="Enable quiet hours for notification delivery."
                                icon={<Moon size={18} />}
                                value={
                                    notificationPreferences
                                        .quiet_hours_enabled
                                }
                                onChange={() =>
                                    handleNotificationToggle(
                                        "quiet_hours_enabled"
                                    )
                                }
                            />

                        </div>


                        {/* =================================================
                            SAVE
                        ================================================= */}

                        <div className="settings-save-area">

                            <button
                                className="settings-save-btn"
                                onClick={
                                    handleSaveNotifications
                                }
                                disabled={
                                    notificationSaving
                                }
                            >

                                {notificationSaving ? (

                                    <>
                                        <Loader2
                                            size={17}
                                            className="notification-spinner"
                                        />

                                        Saving...
                                    </>

                                ) : notificationSaved ? (

                                    <>
                                        <Check size={17} />

                                        Saved
                                    </>

                                ) : (

                                    "Save Changes"

                                )}

                            </button>


                            {notificationSaved && (

                                <span className="settings-saved-message">

                                    Notification preferences
                                    saved successfully.

                                </span>

                            )}

                        </div>

                    </>

                )}

            </div>

        </div>

    );

}


// =========================================================
// REUSABLE NOTIFICATION TOGGLE
// =========================================================

function NotificationToggle({
    title,
    description,
    icon,
    value,
    onChange,
}) {

    return (

        <div className="notification-toggle-row">

            <div className="notification-toggle-icon">

                {icon}

            </div>


            <div className="notification-toggle-content">

                <h3>
                    {title}
                </h3>

                <p>
                    {description}
                </p>

            </div>


            <button
                type="button"
                className={
                    `settings-toggle ${
                        value ? "active" : ""
                    }`
                }
                onClick={onChange}
                aria-label={`Toggle ${title}`}
                aria-pressed={value}
            >

                <span></span>

            </button>

        </div>

    );

}