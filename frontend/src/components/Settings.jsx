"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

import {
    Settings as SettingsIcon,
    Bot,
    Database,
    MessageSquare,
    History,
    Palette,
    Shield,
    ShieldCheck,
    Bell,
    LockKeyhole,
    KeyRound,
    Smartphone,
    Trash2,
    FileText,
    AlertTriangle,
    ChevronRight,
    ArrowLeft,
    Check,
    CheckCircle2,
    Loader2,
    Mail,
    MessageCircle,
    Monitor,
    Moon,
    Info,
} from "lucide-react";

import "./Settings.css";


const settingsItems = [
    {
        id: "general",
        icon: SettingsIcon,
        title: "General",
        description:
            "Manage workspace and application preferences.",
    },
    {
        id: "ai",
        icon: Bot,
        title: "AI Configuration",
        description:
            "Configure model and AI response behavior.",
    },
    {
        id: "rag",
        icon: Database,
        title: "RAG & Retrieval",
        description:
            "Configure search, fusion and reranking behavior.",
    },
    {
        id: "chat",
        icon: MessageSquare,
        title: "Chat",
        description:
            "Manage conversation and response preferences.",
    },
    {
        id: "appearance",
        icon: Palette,
        title: "Appearance",
        description:
            "Customize the look and feel of your workspace.",
    },
    {
        id: "notifications",
        icon: Bell,
        title: "Notification Preferences",
        description:
            "Manage email and in-app notification preferences.",
    },
    {
        id: "security",
        icon: Shield,
        title: "Security",
        description:
            "Manage authentication and security preferences.",
    },
    {
        id: "data",
        icon: Trash2,
        title: "Data Management",
        description:
            "Manage conversations, documents and stored data.",
    },
];


export default function Settings() {
    const router = useRouter();
    // =====================================================
    // AI CONFIGURATION STATE
    // =====================================================

    const [aiModel, setAiModel] = useState(
        "gemini-flash-latest"
    );

    const [temperature, setTemperature] = useState(0.2);

    const [maxTokens, setMaxTokens] = useState(1024);

    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful AI workspace assistant. Answer questions accurately using the provided context."
    );

    const [aiSaved, setAiSaved] = useState(false);

// =====================================================
// RAG & RETRIEVAL STATE
// =====================================================

    const [ragSettings, setRagSettings] = useState({
        query_rewriting_enabled: false,

        vector_enabled: true,
        vector_top_k: 5,

        bm25_enabled: true,
        bm25_top_k: 5,

        rrf_enabled: true,
        rrf_top_k: 10,

        reranker_enabled: true,
        reranker_top_k: 4,
    });

    const [ragLoading, setRagLoading] = useState(false);
    const [ragSaving, setRagSaving] = useState(false);
    const [ragSaved, setRagSaved] = useState(false);
    const [ragError, setRagError] = useState(""); 


// =====================================================
// CHAT SETTINGS STATE
// =====================================================

    const [chatSettings, setChatSettings] = useState({
        conversation_history_enabled: true,
        response_preference: "balanced",
    });

    const [chatLoading, setChatLoading] = useState(false);
    const [chatSaving, setChatSaving] = useState(false);
    const [chatSaved, setChatSaved] = useState(false);
    const [chatError, setChatError] = useState("");


    // =====================================================
    // GENERAL SETTINGS STATE
    // =====================================================

    const [workspaceName, setWorkspaceName] =
        useState("Workspace 1");

    const [autoSave, setAutoSave] =
        useState(true);

    const [saved, setSaved] =
        useState(false);

// =====================================================
// APPEARANCE SETTINGS STATE
// =====================================================

    const [appearanceSettings, setAppearanceSettings] =
        useState({
            theme: "dark",
            accentColor: "default",
            density: "comfortable",
        });

    const [appearanceSaved, setAppearanceSaved] =
        useState(false);
        


    // =====================================================
    // ACTIVE SETTING
    // =====================================================

    const [activeSetting, setActiveSetting] =
        useState(null);

     
    // =====================================================
    // DATA MANAGEMENT STATE
    // =====================================================

    const [documents, setDocuments] = useState([]);

    const [dataLoading, setDataLoading] = useState(false);
    const [dataError, setDataError] = useState("");

    const [deletingDocumentId, setDeletingDocumentId] =
        useState(null);

    const [deletingConversations, setDeletingConversations] =
        useState(false);

    const [dataSuccess, setDataSuccess] = useState("");

    const [showDeleteConversationsConfirm, setShowDeleteConversationsConfirm] =
        useState(false);

    const [showDeleteDocumentConfirm, setShowDeleteDocumentConfirm] =
        useState(null);    


    // =====================================================
    // NOTIFICATION PREFERENCES STATE
    // =====================================================

    const [notificationPreferences, setNotificationPreferences] =
        useState({
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
        });


    const [notificationLoading, setNotificationLoading] =
        useState(false);

    const [notificationSaving, setNotificationSaving] =
        useState(false);

    const [notificationSaved, setNotificationSaved] =
        useState(false);

    const [notificationError, setNotificationError] =
        useState("");

    // =====================================================
    // LOAD DOCUMENTS
    // =====================================================

    const loadDocuments = async () => {

        try {

            setDataLoading(true);
            setDataError("");
            setDataSuccess("");

            const response = await api.get(
                "/workspaces/1/documents"
            );

            setDocuments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load documents:",
                error
            );

            setDataError(
                error.response?.data?.detail ||
                "Unable to load documents."
            );

        } finally {

            setDataLoading(false);

        }

    };



    // =====================================================
    // DELETE DOCUMENT
    // =====================================================

    const handleDeleteDocument = async (documentId) => {

        try {

            setDeletingDocumentId(documentId);
            setDataError("");
            setDataSuccess("");

            await api.delete(
                `/workspaces/1/documents/${documentId}`
            );

            setDocuments((previous) =>
                previous.filter(
                    (document) =>
                        document.id !== documentId
                )
            );

            setDataSuccess(
                "Document deleted successfully."
            );

        } catch (error) {

            console.error(
                "Failed to delete document:",
                error
            );

            setDataError(
                error.response?.data?.detail ||
                "Unable to delete document."
            );

        } finally {

            setDeletingDocumentId(null);
            setShowDeleteDocumentConfirm(null);

        }

    };


        // =====================================================
    // DELETE ALL CONVERSATIONS
    // =====================================================

    const handleDeleteAllConversations = async () => {

        try {

            setDeletingConversations(true);
            setDataError("");
            setDataSuccess("");

            const response = await api.delete(
                "/me/data/conversations"
            );

            setDataSuccess(
                response.data?.message ||
                "All conversations deleted successfully."
            );

            setShowDeleteConversationsConfirm(false);

        } catch (error) {

            console.error(
                "Failed to delete conversations:",
                error
            );

            setDataError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to delete conversations."
            );

        } finally {

            setDeletingConversations(false);

        }

    };


    // =====================================================
    // RESTORE AI SETTINGS
    // =====================================================

    useEffect(() => {

        const savedAISettings =
            localStorage.getItem(
                "ai_workspace_ai_settings"
            );

        if (!savedAISettings) {
            return;
        }

        try {

            const parsed =
                JSON.parse(savedAISettings);

            if (parsed.model) {
                setAiModel(parsed.model);
            }

            if (
                typeof parsed.temperature === "number"
            ) {
                setTemperature(
                    parsed.temperature
                );
            }

            if (
                typeof parsed.maxTokens === "number"
            ) {
                setMaxTokens(
                    parsed.maxTokens
                );
            }

            if (parsed.systemPrompt) {
                setSystemPrompt(
                    parsed.systemPrompt
                );
            }

        } catch (error) {

            console.error(
                "Failed to restore AI settings:",
                error
            );

        }

    }, []);


// =====================================================
// RESTORE & APPLY APPEARANCE SETTINGS
// =====================================================

    useEffect(() => {

        const savedAppearance =
            localStorage.getItem(
                "ai_workspace_appearance_settings"
            ); 

        let settings = {
            theme: "dark",
            accentColor: "default",
            density: "comfortable",
        };

        if (savedAppearance) {

            try {

                const parsed =
                    JSON.parse(savedAppearance);

                settings = {
                    theme:
                        parsed.theme || "dark",

                    accentColor:
                        parsed.accentColor || "default",

                    density:
                        parsed.density || "comfortable",
                };

            } catch (error) {

                console.error(
                    "Failed to restore Appearance settings:",
                    error
                );

            }

        }

        setAppearanceSettings(settings);

    }, []);


// =====================================================
// APPLY APPEARANCE SETTINGS
// =====================================================

    useEffect(() => {

        const root =
            document.documentElement;

    // =========================================
    // THEME
    // =========================================

        root.setAttribute(
            "data-theme",
            appearanceSettings.theme
        );


    // =========================================
    // ACCENT COLOR
    // =========================================

        root.setAttribute(
            "data-accent",
            appearanceSettings.accentColor
        );


    // =========================================
    // DENSITY
    // =========================================

        root.setAttribute(
            "data-density",
            appearanceSettings.density
        );

    }, [appearanceSettings]);

    const handleAppearanceChange = (
        key,
        value
    ) => {

        setAppearanceSaved(false);

        setAppearanceSettings(
            (previous) => ({
                ...previous,
                [key]: value,
            })
        );

    };


// =====================================================
// SAVE APPEARANCE SETTINGS
// =====================================================

    const handleSaveAppearance = () => {

        localStorage.setItem(
            "ai_workspace_appearance_settings",
            JSON.stringify(
                appearanceSettings
            )
        );

        setAppearanceSaved(true);

        console.log(
            "Appearance settings saved:",
            appearanceSettings
        );

    };
    
    // =====================================================
    // OPEN SETTING
    // =====================================================

    const handleOpenSetting = (id) => {

        setSaved(false);
        setAiSaved(false);
        setNotificationSaved(false);
        setNotificationError("");

        setActiveSetting(id);

        if (id === "notifications") {
            loadNotificationPreferences();
        }
        if (id === "rag") {
            loadRagSettings();
        }
        if (id === "chat") {
            loadChatSettings();
        }
        if (id === "data") {
            loadDocuments();
        }

    };


    // =====================================================
    // BACK
    // =====================================================

    const handleBack = () => {

        setActiveSetting(null);

        setSaved(false);
        setAiSaved(false);
        setNotificationSaved(false);
        setRagSaved(false);
        setAppearanceSaved(false);
        setNotificationError("");
        setRagError("");
        

    };


    // =====================================================
    // SAVE GENERAL SETTINGS
    // =====================================================

    const handleSaveGeneral = () => {

        const settings = {
            workspaceName,
            autoSave,
        };

        localStorage.setItem(
            "ai_workspace_general_settings",
            JSON.stringify(settings)
        );

        setSaved(true);

        console.log(
            "General settings saved:",
            settings
        );

    };


    // =====================================================
    // SAVE AI SETTINGS
    // =====================================================

    const handleSaveAI = async () => {

        try {

            const response = await api.put(
                "/workspaces/1/settings/ai",
                {
                    model: aiModel,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    system_prompt: systemPrompt,
                }
            );

            const savedSettings =
                response.data;

            localStorage.setItem(
                "ai_workspace_ai_settings",
                JSON.stringify({
                    model: savedSettings.model,
                    temperature:
                        savedSettings.temperature,
                    maxTokens:
                        savedSettings.max_tokens,
                    systemPrompt:
                        savedSettings.system_prompt,
                })
            );

            setAiSaved(true);

            console.log(
                "AI configuration saved successfully:",
                savedSettings
            );

        } catch (error) {

            console.error(
                "Failed to save AI configuration:",
                error
            );

            setAiSaved(false);

        }

    };

     
// =====================================================
// LOAD CHAT SETTINGS
// =====================================================

    const loadChatSettings = async () => {

        try {

            setChatLoading(true);
            setChatError("");
            setChatSaved(false);

            const response = await api.get(
                "/workspaces/1/settings/chat"
            );

            const data = response.data;

            setChatSettings({
                conversation_history_enabled:
                    data.conversation_history_enabled,

                response_preference:
                    data.response_preference,
            });

        } catch (error) {

            console.error(
                "Failed to load Chat settings:",
                error
            );

            setChatError(
                error.response?.data?.detail ||
                "Unable to load Chat settings."
            );

        } finally {

            setChatLoading(false);

        }

    };




// =====================================================
// LOAD RAG SETTINGS
// =====================================================

    const loadRagSettings = async () => {

        try {

            setRagLoading(true);
            setRagError("");
            setRagSaved(false);

            const response = await api.get(
                "/workspaces/1/settings/rag"
            );

            const data = response.data;

            setRagSettings({
                query_rewriting_enabled:
                    data.query_rewriting_enabled,

                vector_enabled:
                    data.vector_enabled,

                vector_top_k:
                    data.vector_top_k,

                bm25_enabled:
                    data.bm25_enabled,

                bm25_top_k:
                    data.bm25_top_k,

                rrf_enabled:
                    data.rrf_enabled,

                rrf_top_k:
                    data.rrf_top_k,

                reranker_enabled:
                    data.reranker_enabled,

                reranker_top_k:
                    data.reranker_top_k,
            });

        } catch (error) {

            console.error(
                "Failed to load RAG settings:",
                error
            );

            setRagError(
                error.response?.data?.detail ||
                "Unable to load RAG settings."
            );

        } finally {

            setRagLoading(false);

        }

    };

// =====================================================
// TOGGLE RAG SETTING
// =====================================================

    const handleRagToggle = (key) => {
 
        setRagSaved(false);
        setRagError("");

        setRagSettings((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));

    };

// =====================================================
// TOGGLE CHAT SETTING
// =====================================================

    const handleChatToggle = (key) => {

        setChatSaved(false);
        setChatError("");

        setChatSettings((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));

    };

// =====================================================
// SAVE CHAT SETTINGS
// =====================================================

    const handleSaveChat = async () => {

        try {

            setChatSaving(true);
            setChatSaved(false);
            setChatError("");

            const response = await api.put(
                "/workspaces/1/settings/chat",
                chatSettings
            );

            const data = response.data;

            setChatSettings({
                conversation_history_enabled:
                    data.conversation_history_enabled,

                response_preference:
                    data.response_preference,
            });

            setChatSaved(true);

            console.log(
                "Chat settings saved successfully:",
                data
            );

        } catch (error) {

            console.error(
                "Failed to save Chat settings:",
                error
            );

            setChatError(
                error.response?.data?.detail ||
                "Unable to save Chat settings."
            );

        } finally {

            setChatSaving(false);

        }

    };



    // =====================================================
// SAVE RAG SETTINGS
// =====================================================

    const handleSaveRag = async () => {

        try {

            setRagSaving(true);
            setRagSaved(false);
            setRagError("");

            const response = await api.put(
                "/workspaces/1/settings/rag",
                ragSettings
            );

            const data = response.data;

            setRagSettings({
                query_rewriting_enabled:
                    data.query_rewriting_enabled,

                vector_enabled:
                    data.vector_enabled,

                vector_top_k:
                    data.vector_top_k,

                bm25_enabled:
                    data.bm25_enabled,

                bm25_top_k:
                    data.bm25_top_k,

                rrf_enabled:
                    data.rrf_enabled,

                rrf_top_k:
                    data.rrf_top_k,

                reranker_enabled:
                    data.reranker_enabled,

                reranker_top_k:
                    data.reranker_top_k,
            });

            setRagSaved(true);

        } catch (error) {

            console.error(
                "Failed to save RAG settings:",
                error
            );

            setRagError(
                error.response?.data?.detail ||
                "Unable to save RAG settings."
            );

        } finally {

            setRagSaving(false);

        }

    };

    // =====================================================
    // LOAD NOTIFICATION PREFERENCES
    // =====================================================

    const loadNotificationPreferences =
        async () => {

            try {

                setNotificationLoading(true);
                setNotificationError("");
                setNotificationSaved(false);

                const response =
                    await api.get(
                        "/me/notifications"
                    );

                const data =
                    response.data;

                setNotificationPreferences({
                    email_security_alerts:
                        data.email_security_alerts,

                    email_account_activity:
                        data.email_account_activity,

                    email_workspace_activity:
                        data.email_workspace_activity,

                    email_document_processing:
                        data.email_document_processing,

                    email_product_updates:
                        data.email_product_updates,

                    in_app_chat:
                        data.in_app_chat,

                    in_app_workspace_activity:
                        data.in_app_workspace_activity,

                    in_app_document_processing:
                        data.in_app_document_processing,

                    in_app_system:
                        data.in_app_system,

                    do_not_disturb:
                        data.do_not_disturb,

                    quiet_hours_enabled:
                        data.quiet_hours_enabled,
                });

            } catch (error) {

                console.error(
                    "Failed to load notification preferences:",
                    error
                );

                setNotificationError(
                    "Unable to load notification preferences."
                );

            } finally {

                setNotificationLoading(false);

            }

        };


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

                const savedPreferences =
                    response.data;

                setNotificationPreferences({
                    email_security_alerts:
                        savedPreferences.email_security_alerts,

                    email_account_activity:
                        savedPreferences.email_account_activity,

                    email_workspace_activity:
                        savedPreferences.email_workspace_activity,

                    email_document_processing:
                        savedPreferences.email_document_processing,

                    email_product_updates:
                        savedPreferences.email_product_updates,

                    in_app_chat:
                        savedPreferences.in_app_chat,

                    in_app_workspace_activity:
                        savedPreferences.in_app_workspace_activity,

                    in_app_document_processing:
                        savedPreferences.in_app_document_processing,

                    in_app_system:
                        savedPreferences.in_app_system,

                    do_not_disturb:
                        savedPreferences.do_not_disturb,

                    quiet_hours_enabled:
                        savedPreferences.quiet_hours_enabled,
                });

                setNotificationSaved(true);

                console.log(
                    "Notification preferences saved successfully:",
                    savedPreferences
                );

            } catch (error) {

                console.error(
                    "Failed to save notification preferences:",
                    error
                );

                const detail =
                    error.response?.data?.detail;

                setNotificationError(
                    detail ||
                    "Unable to save notification preferences. Please try again."
                );

            } finally {

                setNotificationSaving(false);

            }

        };


    // =====================================================
    // GENERAL SETTINGS
    // =====================================================

    if (activeSetting === "general") {

        return (

            <div className="settings-page">

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <SettingsIcon size={21} />

                        </div>


                        <div>

                            <h1>
                                General Settings
                            </h1>

                            <p>
                                Manage general workspace
                                preferences.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="settings-detail-content">

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Workspace
                            </h2>

                            <p>
                                Basic information about
                                your AI workspace.
                            </p>

                        </div>


                        <div className="settings-field">

                            <label>
                                Workspace Name
                            </label>

                            <input
                                type="text"
                                value={workspaceName}
                                onChange={(event) =>
                                    setWorkspaceName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter workspace name"
                            />

                            <span>
                                This name identifies your
                                current workspace.
                            </span>

                        </div>

                    </div>


                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Conversation
                            </h2>

                            <p>
                                Control how conversations
                                are handled.
                            </p>

                        </div>


                        <div className="settings-toggle-row">

                            <div>

                                <h3>
                                    Auto-save conversations
                                </h3>

                                <p>
                                    Automatically save your
                                    conversation list locally.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={
                                    `settings-toggle ${
                                        autoSave
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setAutoSave(
                                        !autoSave
                                    )
                                }
                                aria-label="Toggle auto-save"
                            >

                                <span></span>

                            </button>

                        </div>

                    </div>


                    <div className="settings-save-area">

                        <button
                            className="settings-save-btn"
                            onClick={handleSaveGeneral}
                        >

                            {saved ? (
                                <>
                                    <Check size={17} />
                                    Saved
                                </>
                            ) : (
                                "Save Changes"
                            )}

                        </button>


                        {saved && (

                            <span className="settings-saved-message">

                                General settings saved
                                successfully.

                            </span>

                        )}

                    </div>

                </div>

            </div>

        );
    }


    // =====================================================
    // AI CONFIGURATION
    // =====================================================

    if (activeSetting === "ai") {

        return (

            <div className="settings-page">

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <Bot size={21} />

                        </div>


                        <div>

                            <h1>
                                AI Configuration
                            </h1>

                            <p>
                                Configure how the AI model
                                generates responses.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="settings-detail-content">

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Model Configuration
                            </h2>

                            <p>
                                Select the AI model used by
                                the workspace assistant.
                            </p>

                        </div>


                        <div className="settings-field">

                            <label>
                                AI Model
                            </label>

                            <select
                                value={aiModel}
                                onChange={(event) =>
                                    setAiModel(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="gemini-flash-latest">
                                    Gemini Flash Latest
                                </option>

                                <option value="gemini-2.5-flash">
                                    Gemini 2.5 Flash
                                </option>

                            </select>


                            <span>
                                This model will be used for
                                AI response generation.
                            </span>

                        </div>

                    </div>


                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Generation Settings
                            </h2>

                            <p>
                                Control response creativity
                                and length.
                            </p>

                        </div>


                        <div className="settings-field">

                            <label>
                                Temperature
                            </label>


                            <div className="range-setting">

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(event) =>
                                        setTemperature(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                />


                                <span className="range-value">
                                    {temperature.toFixed(1)}
                                </span>

                            </div>


                            <span>
                                Lower values produce more
                                focused responses. Higher values
                                produce more creative responses.
                            </span>

                        </div>


                        <div className="settings-field">

                            <label>
                                Max Response Tokens
                            </label>


                            <input
                                type="number"
                                min="128"
                                max="8192"
                                step="128"
                                value={maxTokens}
                                onChange={(event) =>
                                    setMaxTokens(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                            />


                            <span>
                                Maximum amount of text the AI
                                can generate.
                            </span>

                        </div>

                    </div>


                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                AI Behavior
                            </h2>

                            <p>
                                Define the assistant's general
                                behavior.
                            </p>

                        </div>


                        <div className="settings-field">

                            <label>
                                System Instructions
                            </label>


                            <textarea
                                value={systemPrompt}
                                onChange={(event) =>
                                    setSystemPrompt(
                                        event.target.value
                                    )
                                }
                                rows={7}
                                placeholder="Enter system instructions..."
                            />


                            <span>
                                These instructions will define
                                the general behavior of the AI
                                assistant.
                            </span>

                        </div>

                    </div>


                    <div className="settings-save-area">

                        <button
                            className="settings-save-btn"
                            onClick={handleSaveAI}
                        >

                            {aiSaved ? (
                                <>
                                    <Check size={17} />
                                    Saved
                                </>
                            ) : (
                                "Save Configuration"
                            )}

                        </button>


                        {aiSaved && (

                            <span className="settings-saved-message">

                                AI configuration saved
                                successfully.

                            </span>

                        )}

                    </div>

                </div>

            </div>

        );
    }


// =====================================================
// RAG & RETRIEVAL
// =====================================================

    if (activeSetting === "rag") {

        return (

            <div className="settings-page">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <Database size={21} />

                        </div>


                        <div>

                            <h1>
                                RAG & Retrieval
                            </h1>

                            <p>
                                Configure document search,
                                fusion and reranking behavior.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="settings-detail-content">


                    {ragLoading ? (

                        <div className="settings-form-card">

                            <div className="notification-loading">

                                <Loader2
                                    size={22}
                                    className="notification-spinner"
                                />

                                <span>
                                    Loading RAG settings...
                                </span>

                            </div>

                        </div>

                    ) : (

                        <>


                            {/* =================================
                                ERROR
                                ================================= */}

                            {ragError && (

                                <div className="notification-error">

                                    <Info size={17} />

                                    <span>
                                        {ragError}
                                    </span>

                                </div>

                            )}


                            {/* =================================
                                QUERY PROCESSING
                                ================================= */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Query Processing
                                    </h2>

                                    <p>
                                        Control how user questions
                                        are prepared before retrieval.
                                    </p>

                                </div>


                                <NotificationToggle

                                    title="Query Rewriting"

                                    description={
                                        "Rewrite the user's question into a standalone retrieval query before searching documents."
                                    }

                                    icon={
                                        <MessageSquare
                                            size={18}
                                        />
                                    }

                                    value={
                                        ragSettings
                                            .query_rewriting_enabled
                                    }

                                    onChange={() =>
                                        handleRagToggle(
                                            "query_rewriting_enabled"
                                        )
                                    }

                                />

                            </div>


                            {/* =================================
                                VECTOR SEARCH
                                ================================= */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Vector Retrieval
                                    </h2>

                                    <p>
                                        Configure semantic similarity
                                        search over document embeddings.
                                    </p>

                                </div>


                                <NotificationToggle

                                    title="Enable Vector Retrieval"

                                    description={
                                        "Use semantic vector search to retrieve contextually relevant document chunks."
                                    }

                                    icon={
                                        <Database
                                            size={18}
                                        />
                                    }

                                    value={
                                        ragSettings.vector_enabled
                                    }

                                    onChange={() =>
                                        handleRagToggle(
                                            "vector_enabled"
                                        )
                                    }

                                />


                                <div className="settings-field">
 
                                    <label>
                                        Vector Top K
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        step="1"
                                        value={
                                            ragSettings.vector_top_k
                                        }
                                        disabled={
                                            !ragSettings.vector_enabled
                                        }
                                        onChange={(event) =>
                                            setRagSettings(
                                                (previous) => ({
                                                    ...previous,
                                                    vector_top_k:
                                                        Number(
                                                            event.target.value
                                                        ),
                                                })
                                            )
                                        }
                                    />

                                    <span>
                                        Number of chunks retrieved
                                        from vector search.
                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                BM25
                                ================================= */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        BM25 Retrieval
                                    </h2>

                                    <p>
                                        Configure keyword-based
                                        document retrieval.
                                    </p>

                                </div>


                                <NotificationToggle

                                    title="Enable BM25 Retrieval"

                                    description={
                                        "Use keyword-based retrieval to complement semantic vector search."
                                    }

                                    icon={
                                        <Database
                                            size={18}
                                        />
                                    }

                                    value={
                                        ragSettings.bm25_enabled
                                    }

                                    onChange={() =>
                                        handleRagToggle(
                                            "bm25_enabled"
                                        )
                                    }

                                />


                                <div className="settings-field">

                                    <label>
                                        BM25 Top K
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        step="1"
                                        value={
                                            ragSettings.bm25_top_k
                                        }
                                        disabled={
                                            !ragSettings.bm25_enabled
                                        }
                                        onChange={(event) =>
                                            setRagSettings(
                                                (previous) => ({
                                                    ...previous,
                                                    bm25_top_k:
                                                        Number(
                                                            event.target.value
                                                        ),
                                                })
                                            )
                                        }
                                    />

                                    <span>
                                        Number of chunks retrieved
                                        using BM25 keyword search.
                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                RRF
                                ================================= */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Reciprocal Rank Fusion
                                    </h2>

                                    <p>
                                        Combine semantic and keyword
                                        retrieval results into one ranking.
                                    </p>

                                </div>


                                <NotificationToggle

                                    title="Enable RRF Fusion"

                                    description={
                                        "Combine Vector and BM25 retrieval results using Reciprocal Rank Fusion."
                                    }

                                    icon={
                                        <Database
                                            size={18}
                                        />
                                    }

                                    value={
                                        ragSettings.rrf_enabled
                                    }

                                    onChange={() =>
                                        handleRagToggle(
                                            "rrf_enabled"
                                        )
                                    }

                                />


                                <div className="settings-field">

                                    <label>
                                        RRF Top K
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        step="1"
                                        value={
                                            ragSettings.rrf_top_k
                                        }
                                        disabled={
                                            !ragSettings.rrf_enabled
                                        }
                                        onChange={(event) =>
                                            setRagSettings(
                                                (previous) => ({
                                                    ...previous,
                                                    rrf_top_k:
                                                        Number(
                                                            event.target.value
                                                        ),
                                                })
                                            )
                                        }
                                    />

                                    <span>
                                        Maximum number of chunks
                                        passed from fusion to reranking.
                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                RERANKER
                                ================================= */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">
 
                                    <h2>
                                        Reranking
                                    </h2>

                                    <p>
                                        Use a cross-encoder to improve
                                        the final relevance ordering.
                                    </p>

                                </div>


                                <NotificationToggle

                                    title="Enable Cross-Encoder Reranking"

                                    description={
                                        "Rerank the fused retrieval results before building the final RAG context."
                                    }

                                    icon={
                                        <Bot
                                            size={18}
                                        />
                                    }

                                    value={
                                        ragSettings.reranker_enabled
                                    }

                                    onChange={() =>
                                        handleRagToggle(
                                            "reranker_enabled"
                                        )
                                    }

                                />


                                <div className="settings-field">

                                    <label>
                                        Reranker Top K
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={
                                            ragSettings.reranker_top_k
                                        }
                                        disabled={
                                            !ragSettings.reranker_enabled
                                        }
                                        onChange={(event) =>
                                            setRagSettings(
                                                (previous) => ({
                                                    ...previous,
                                                    reranker_top_k:
                                                        Number(
                                                            event.target.value
                                                        ),
                                                })
                                            )
                                        }
                                    />

                                    <span>
                                        Number of final chunks passed
                                        to the RAG context.
                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                PIPELINE PREVIEW
                                ================================= */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Current Retrieval Pipeline
                                    </h2>

                                    <p>
                                        The pipeline currently configured
                                        for this workspace.
                                    </p>

                                </div>


                                <div className="configuration-card">

                                    <div className="configuration-row">

                                        <span>
                                            Query Rewriting
                                        </span>

                                        <strong>
                                            {
                                                ragSettings
                                                    .query_rewriting_enabled
                                                    ? "Enabled"
                                                    : "Disabled"
                                            }
                                        </strong>

                                    </div>


                                    <div className="configuration-row">

                                        <span>
                                            Vector Retrieval
                                        </span>

                                        <strong>

                                            {
                                                ragSettings.vector_enabled
                                                    ? `Top ${ragSettings.vector_top_k}`
                                                    : "Disabled"
                                            }

                                        </strong>

                                    </div>


                                    <div className="configuration-row">

                                        <span>
                                            BM25 Retrieval
                                        </span>

                                        <strong>

                                            {
                                                ragSettings.bm25_enabled
                                                    ? `Top ${ragSettings.bm25_top_k}`
                                                    : "Disabled"
                                            }

                                        </strong>

                                    </div>


                                    <div className="configuration-row">

                                        <span>
                                            RRF Fusion
                                        </span>

                                        <strong>

                                            {
                                                ragSettings.rrf_enabled
                                                    ? `Top ${ragSettings.rrf_top_k}`
                                                    : "Disabled"
                                            }

                                        </strong>

                                    </div>


                                    <div className="configuration-row">

                                        <span>
                                            Cross Encoder
                                        </span>

                                        <strong>

                                            {
                                                ragSettings.reranker_enabled
                                                    ? `Top ${ragSettings.reranker_top_k}`
                                                    : "Disabled"
                                            }

                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                SAVE
                                ================================= */}

                            <div className="settings-save-area">

                                <button
                                    className="settings-save-btn"
                                    onClick={handleSaveRag}
                                    disabled={ragSaving}
                                >

                                    {ragSaving ? (

                                        <>
                                            <Loader2
                                                size={17}
                                                className="notification-spinner"
                                            />

                                            Saving...

                                        </>

                                    ) : ragSaved ? (

                                        <>
                                            <Check size={17} />

                                            Saved

                                        </>

                                    ) : (

                                        "Save Changes"

                                    )}

                                </button>


                                {ragSaved && (

                                    <span className="settings-saved-message">

                                        RAG settings saved
                                        successfully.

                                    </span>

                                )}

                            </div>

                        </>

                    )}

                </div>

            </div>

        );

    }


// =====================================================
// CHAT SETTINGS
// =====================================================

    if (activeSetting === "chat") {

        return (

            <div className="settings-page">

                {/* =========================================
                    HEADER
                    ========================================= */}

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <MessageSquare size={21} />

                        </div>


                        <div>

                            <h1>
                                Chat
                            </h1>

                            <p>
                                Manage conversation and response preferences.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    CONTENT
                    ========================================= */}

                <div className="settings-detail-content">

                    {chatLoading ? (

                        <div className="settings-form-card">

                            <div className="notification-loading">

                                <Loader2
                                    size={22}
                                    className="notification-spinner"
                                />

                                <span>
                                    Loading Chat settings...
                                </span>

                            </div>

                        </div>

                    ) : (

                        <>

                            {/* =================================
                                ERROR
                                ================================== */}

                            {chatError && (

                                <div className="notification-error">

                                    <Info size={17} />

                                    <span>
                                        {chatError}
                                    </span>

                                </div>

                            )}


                            {/* =================================
                                CONVERSATION HISTORY
                                ================================== */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Conversation History
                                    </h2>

                                    <p>
                                        Control how conversation history
                                        is handled by the workspace.
                                    </p>

                                </div>


                                <NotificationToggle

                                    title="Enable Conversation History"

                                    description={
                                        "Save conversation messages so they can be viewed and continued later."
                                    }

                                    icon={
                                        <History
                                            size={18}
                                        />
                                    }

                                    value={
                                        chatSettings
                                            .conversation_history_enabled
                                    }

                                    onChange={() =>
                                        handleChatToggle(
                                            "conversation_history_enabled"
                                        )
                                    }

                                />

                            </div>


                            {/* =================================
                                RESPONSE PREFERENCE
                                ================================== */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Response Preference
                                    </h2>

                                    <p>
                                        Choose the preferred response
                                        style for the AI assistant.
                                    </p>

                                </div>


                                <div className="settings-field">

                                    <label>
                                        Response Style
                                    </label>

                                    <select
                                        value={
                                            chatSettings
                                                .response_preference
                                        }
                                        onChange={(event) => {

                                            setChatSaved(false);
                                            setChatError("");

                                            setChatSettings(
                                                (previous) => ({
                                                    ...previous,
                                                    response_preference:
                                                        event.target.value,
                                                })
                                            );

                                        }}
                                    >

                                        <option value="concise">
                                            Concise
                                        </option>

                                        <option value="balanced">
                                            Balanced
                                        </option>

                                        <option value="detailed">
                                            Detailed
                                        </option>

                                    </select>


                                    <span>
                                        Controls how concise or detailed
                                        the assistant's responses should be.
                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                CURRENT CONFIGURATION
                                ================================== */}

                            <div className="settings-form-card">

                                <div className="settings-form-heading">

                                    <h2>
                                        Current Chat Configuration
                                    </h2>

                                    <p>
                                        Current conversation and response
                                        preferences for this workspace.
                                    </p>

                                </div>


                                <div className="configuration-card">

                                    <div className="configuration-row">

                                        <span>
                                            Conversation History
                                        </span>

                                        <strong>
                                            {
                                                chatSettings
                                                    .conversation_history_enabled
                                                    ? "Enabled"
                                                    : "Disabled"
                                            }
                                        </strong>

                                    </div>


                                    <div className="configuration-row">

                                        <span>
                                            Response Preference
                                        </span>

                                        <strong>
                                            {
                                                chatSettings
                                                    .response_preference
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                SAVE
                                ================================== */}

                            <div className="settings-save-area">

                                <button
                                    className="settings-save-btn"
                                    onClick={handleSaveChat}
                                    disabled={chatSaving}
                                >

                                    {chatSaving ? (

                                        <>

                                            <Loader2
                                                size={17}
                                                className="notification-spinner"
                                            />

                                            Saving...

                                        </>

                                    ) : chatSaved ? (

                                        <>

                                            <Check size={17} />

                                            Saved

                                        </>

                                    ) : (

                                        "Save Changes"

                                    )}

                                </button>


                                {chatSaved && (

                                    <span className="settings-saved-message">

                                        Chat settings saved
                                        successfully.

                                    </span>

                                )}

                            </div>

                        </>

                    )}

                </div>

            </div>

        );
    }
   
    
// =====================================================
// APPEARANCE SETTINGS
// =====================================================

    if (activeSetting === "appearance") {

        return (

            <div className="settings-page">

                {/* =========================================
                    HEADER
                    ========================================= */}

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <Palette size={21} />

                        </div>


                        <div>

                            <h1>
                                Appearance
                            </h1>

                            <p>
                                Customize the look and feel
                                of your workspace.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="settings-detail-content">


                    {/* =====================================
                        THEME
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Theme
                            </h2>

                            <p>
                                Choose how the workspace
                                interface should appear.
                            </p>

                        </div>


                        <div className="appearance-options">

                            <button
                                type="button"
                                className={
                                    `appearance-option ${
                                        appearanceSettings.theme === "dark"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "theme",
                                        "dark"
                                    )
                                }
                            >

                                <div className="appearance-option-icon">

                                    <Moon size={20} />

                                </div>


                                <div>

                                    <strong>
                                        Dark
                                    </strong>

                                    <span>
                                        Use a dark workspace
                                        interface.
                                    </span>

                                </div>


                                {appearanceSettings.theme === "dark" && (

                                    <Check
                                        size={18}
                                        className="appearance-check"
                                    />

                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    `appearance-option ${
                                        appearanceSettings.theme === "light"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "theme",
                                        "light"
                                    )
                                }
                            >

                                <div className="appearance-option-icon">

                                    <Monitor size={20} />

                                </div>


                                <div>

                                    <strong>
                                        Light
                                    </strong>

                                    <span>
                                        Use a bright workspace
                                        interface.
                                    </span>

                                </div>


                                {appearanceSettings.theme === "light" && (

                                    <Check
                                        size={18}
                                        className="appearance-check"
                                    />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        ACCENT COLOR
                        ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Accent Color
                            </h2>

                            <p>
                                Choose the primary accent
                                color used throughout the workspace.
                            </p>

                        </div>


                        <div className="accent-options">


                            <button
                                type="button"
                                className={
                                    `accent-option accent-default ${
                                        appearanceSettings.accentColor === "default"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "accentColor",
                                        "default"
                                    )
                                }
                            >

                                <span className="accent-color-dot"></span>

                                <span>
                                    Default
                                </span>

                                {appearanceSettings.accentColor === "default" && (
                                    <Check size={16} />
                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    `accent-option accent-blue ${
                                        appearanceSettings.accentColor === "blue"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "accentColor",
                                        "blue"
                                    )
                                }
                            >

                                <span className="accent-color-dot"></span>

                                <span>
                                    Blue
                                </span>

                                {appearanceSettings.accentColor === "blue" && (
                                    <Check size={16} />
                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    `accent-option accent-purple ${
                                        appearanceSettings.accentColor === "purple"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "accentColor",
                                        "purple"
                                    )
                                }
                            >

                                <span className="accent-color-dot"></span>

                                <span>
                                    Purple
                                </span>

                                {appearanceSettings.accentColor === "purple" && (
                                    <Check size={16} />
                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    `accent-option accent-green ${
                                        appearanceSettings.accentColor === "green"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "accentColor",
                                        "green"
                                    )
                                }
                            >

                                <span className="accent-color-dot"></span>

                                <span>
                                    Green
                                </span>

                                {appearanceSettings.accentColor === "green" && (
                                    <Check size={16} />
                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    `accent-option accent-orange ${
                                        appearanceSettings.accentColor === "orange"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "accentColor",
                                        "orange"
                                    )
                                }
                            >

                                <span className="accent-color-dot"></span>

                                <span>
                                    Orange
                                </span>

                                {appearanceSettings.accentColor === "orange" && (
                                    <Check size={16} />
                                )}

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        DENSITY
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Interface Density
                            </h2>

                            <p>
                                Control the spacing and
                                compactness of the workspace interface.
                            </p>

                        </div>


                        <div className="density-options">

                            <button
                                type="button"
                                className={
                                    `density-option ${
                                        appearanceSettings.density === "comfortable"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "density",
                                        "comfortable"
                                    )
                                }
                            >

                                <div>

                                    <strong>
                                        Comfortable
                                    </strong>

                                    <span>
                                        More spacing between
                                        interface elements.
                                    </span>

                                </div>


                                {appearanceSettings.density === "comfortable" && (

                                    <Check size={18} />

                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    `density-option ${
                                        appearanceSettings.density === "compact"
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleAppearanceChange(
                                        "density",
                                        "compact"
                                    )
                                }
                            >

                                <div>

                                    <strong>
                                        Compact
                                    </strong>

                                    <span>
                                        Reduce spacing to show
                                        more content.
                                    </span>

                                </div>


                                {appearanceSettings.density === "compact" && (

                                    <Check size={18} />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        SAVE
                    ====================================== */}

                    <div className="settings-save-area">

                        <button
                            className="settings-save-btn"
                            onClick={handleSaveAppearance}
                        >

                            {appearanceSaved ? (

                                <>
                                    <Check size={17} />

                                    Saved
                                </>

                            ) : (

                                "Save Appearance"

                            )}

                        </button>


                        {appearanceSaved && (

                            <span className="settings-saved-message">

                                Appearance settings saved
                                successfully.

                            </span>

                        )}

                    </div>

                </div>

            </div>

        );

    }





    // =====================================================
    // NOTIFICATION PREFERENCES
    // =====================================================

    if (activeSetting === "notifications") {

        return (

            <div className="settings-page">

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

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


                    {/* =====================================
                        LOADING
                    ====================================== */}

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


                            {/* =================================
                                ERROR
                            ================================== */}

                            {notificationError && (

                                <div className="notification-error">

                                    <Info size={17} />

                                    <span>
                                        {notificationError}
                                    </span>

                                </div>

                            )}


                            {/* =================================
                                EMAIL NOTIFICATIONS
                            ================================== */}

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


                            {/* =================================
                                IN-APP NOTIFICATIONS
                            ================================== */}

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


                            {/* =================================
                                AVAILABILITY
                            ================================== */}

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


                            {/* =================================
                                SAVE
                            ================================== */}

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


// =====================================================
// DATA MANAGEMENT
// =====================================================

    if (activeSetting === "data") {

        return (

            <div className="settings-page">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="settings-detail-header">

                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <Trash2 size={21} />

                        </div>


                        <div>

                            <h1>
                                Data Management
                            </h1>

                            <p>
                                Manage conversations, documents
                                and other stored workspace data.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="settings-detail-content">


                    {/* =====================================
                        ERROR
                    ====================================== */}

                    {dataError && (

                        <div className="notification-error">

                            <Info size={17} />

                            <span>
                                {dataError}
                            </span>

                        </div>

                    )}


                    {/* =====================================
                        SUCCESS
                    ====================================== */}

                    {dataSuccess && (

                        <div className="settings-saved-message">

                            <Check size={17} />

                            {dataSuccess}

                        </div>

                    )}


                    {/* =====================================
                        CONVERSATIONS
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <div className="notification-heading-row">

                                <div className="notification-heading-icon quiet">

                                    <History size={19} />

                                </div>

                                <div>

                                    <h2>
                                        Conversations
                                    </h2>

                                    <p>
                                        Permanently delete your saved
                                        conversation history.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="data-danger-row">

                            <div className="data-danger-content">

                                <h3>
                                    Delete all conversations
                                </h3>

                                <p>
                                    This will permanently remove
                                    all conversations and their
                                    associated messages.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="data-danger-btn"
                                onClick={() =>
                                    setShowDeleteConversationsConfirm(
                                        true
                                    )
                                }
                                disabled={deletingConversations}
                            >

                                {deletingConversations ? (

                                    <>
                                        <Loader2
                                            size={16}
                                            className="notification-spinner"
                                        />

                                        Deleting...

                                    </>

                                ) : (

                                    <>
                                        <Trash2 size={16} />

                                        Delete All

                                    </>

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        DOCUMENTS
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <div className="notification-heading-row">

                                <div className="notification-heading-icon app">

                                    <FileText size={19} />

                                </div>

                                <div>

                                    <h2>
                                        Stored Documents
                                    </h2>

                                    <p>
                                        Manage documents stored in
                                        your workspace.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {dataLoading ? (

                            <div className="notification-loading">

                                <Loader2
                                    size={22}
                                    className="notification-spinner"
                                />

                                <span>
                                    Loading documents...
                                </span>

                            </div>

                        ) : documents.length === 0 ? (

                            <div className="data-empty-state">

                                <FileText size={28} />

                                <h3>
                                    No documents found
                                </h3>

                                <p>
                                    There are no documents currently
                                    stored in this workspace.
                                </p>

                            </div>

                        ) : (

                            <div className="data-document-list">

                                {documents.map((document) => (

                                    <div
                                        key={document.id}
                                        className="data-document-row"
                                    >

                                        <div className="data-document-icon">

                                            <FileText size={19} />

                                        </div>


                                        <div className="data-document-info">

                                            <h3>
                                                {document.filename}
                                            </h3>

                                            <p>

                                                {document.file_type ||
                                                    "Document"}

                                                {" • "}

                                                ID: {document.id}

                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            className="data-document-delete-btn"
                                            onClick={() =>
                                                setShowDeleteDocumentConfirm(
                                                    document.id
                                                )
                                            }
                                            disabled={
                                                deletingDocumentId ===
                                                document.id
                                            }
                                            aria-label={
                                                `Delete ${document.filename}`
                                            }
                                        >

                                            {deletingDocumentId ===
                                            document.id ? (

                                                <Loader2
                                                    size={17}
                                                    className="notification-spinner"
                                                />

                                            ) : (

                                                <Trash2
                                                    size={17}
                                                />

                                            )}

                                        </button>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        STORED DATA INFORMATION
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Stored Data
                            </h2>

                            <p>
                                Understand what is managed by
                                this section.
                            </p>

                        </div>


                        <div className="configuration-card">

                            <div className="configuration-row">

                                <span>
                                    Conversation History
                                </span>

                                <strong>
                                    Stored
                                </strong>

                            </div>


                            <div className="configuration-row">

                                <span>
                                    Uploaded Documents
                                </span>

                                <strong>
                                    {documents.length}
                                </strong>

                            </div>


                            <div className="configuration-row">

                                <span>
                                    Document Embeddings
                                </span>

                                <strong>
                                    Managed by Documents
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    DELETE CONVERSATIONS MODAL
                ========================================= */}

                {showDeleteConversationsConfirm && (

                    <div className="data-confirm-overlay">

                        <div className="data-confirm-modal">

                            <div className="data-confirm-icon">

                                <AlertTriangle size={24} />

                            </div>


                            <h2>
                                Delete all conversations?
                            </h2>


                            <p>
                                This action will permanently delete
                                all your conversations and their
                                associated messages. This cannot
                                be undone.
                            </p>


                            <div className="data-confirm-actions">

                                <button
                                    type="button"
                                    className="settings-secondary-btn"
                                    onClick={() =>
                                        setShowDeleteConversationsConfirm(
                                            false
                                        )
                                    }
                                    disabled={
                                        deletingConversations
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="data-danger-btn"
                                    onClick={
                                        handleDeleteAllConversations
                                    }
                                    disabled={
                                        deletingConversations
                                    }
                                >

                                    {deletingConversations ? (

                                        <>
                                            <Loader2
                                                size={16}
                                                className="notification-spinner"
                                            />

                                            Deleting...

                                        </>

                                    ) : (

                                        <>
                                            <Trash2 size={16} />

                                            Delete All

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =========================================
                    DELETE DOCUMENT MODAL
                ========================================= */}

                {showDeleteDocumentConfirm !== null && (

                    <div className="data-confirm-overlay">

                        <div className="data-confirm-modal">

                            <div className="data-confirm-icon">

                                <AlertTriangle size={24} />

                            </div>


                            <h2>
                                Delete document?
                            </h2>


                            <p>
                                This document and its stored
                                document data will be permanently
                                removed from the workspace.
                            </p>


                            <div className="data-confirm-actions">

                                <button
                                    type="button"
                                    className="settings-secondary-btn"
                                    onClick={() =>
                                        setShowDeleteDocumentConfirm(
                                            null
                                        )
                                    }
                                    disabled={
                                        deletingDocumentId !== null
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="data-danger-btn"
                                    onClick={() =>
                                        handleDeleteDocument(
                                            showDeleteDocumentConfirm
                                        )
                                    }
                                    disabled={
                                        deletingDocumentId !== null
                                    }
                                >

                                    {deletingDocumentId !== null ? (

                                        <>
                                            <Loader2
                                                size={16}
                                                className="notification-spinner"
                                            />

                                            Deleting...

                                        </>

                                    ) : (

                                        <>
                                            <Trash2 size={16} />

                                            Delete Document

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        );

    }

    // =====================================================
    // SECURITY SETTINGS
    // =====================================================

    if (activeSetting === "security") {

        return (

            <div className="settings-page">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="settings-detail-header">
 
                    <button
                        className="settings-back-btn"
                        onClick={handleBack}
                    >

                        <ArrowLeft size={17} />

                        Back to Settings

                    </button>


                    <div className="settings-detail-title">

                        <div className="settings-detail-icon">

                            <Shield size={21} />

                        </div>


                        <div>

                            <h1>
                                Security
                            </h1>

                            <p>
                                Manage authentication and security preferences.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="settings-detail-content">


                    {/* =====================================
                        SECURITY STATUS
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <div className="notification-heading-row">

                                <div className="notification-heading-icon app">

                                    <ShieldCheck size={19} />

                                </div>

                                <div>

                                    <h2>
                                        Account Security
                                    </h2>

                                    <p>
                                        Your account security is protected
                                        with authenticated access and
                                        encrypted password storage.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="security-overview-status">

                            <div className="security-overview-status-icon">

                                <CheckCircle2 size={20} />

                            </div>


                            <div>

                                <strong>
                                    Your account is secure
                                </strong>

                                <p>
                                    Password authentication is enabled
                                    and your account is protected.
                                </p>

                            </div>


                            <span className="security-overview-badge">

                                Protected

                            </span>

                        </div>

                    </div>


                    {/* =====================================
                        PASSWORD SECURITY
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <div className="notification-heading-row">
 
                                <div className="notification-heading-icon quiet">

                                    <LockKeyhole size={19} />

                                </div>

                                <div>

                                    <h2>
                                        Password & Authentication
                                    </h2>

                                    <p>
                                        Manage your password and account
                                        recovery options.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* CHANGE PASSWORD */}

                        <div className="security-settings-row">

                            <div className="security-settings-row-icon">

                                <KeyRound size={19} />

                            </div>


                            <div className="security-settings-row-content">

                                <strong>
                                    Change Password
                                </strong>

                                <span>
                                    Update your password to keep
                                    your account secure.
                                </span>

                            </div>


                            <button
                                type="button"
                                className="settings-secondary-btn"
                                onClick={() =>
                                    router.push("/security")
                                }
                            >

                                Manage

                                <ChevronRight size={17} />

                            </button>

                        </div>


                        {/* PASSWORD RECOVERY */}

                        <div className="security-settings-row">

                            <div className="security-settings-row-icon">

                                <Mail size={19} />

                            </div>


                            <div className="security-settings-row-content">

                                <strong>
                                    Password Recovery
                                </strong>

                                <span>
                                    Recover your account if you
                                    forget your password.
                                </span>

                            </div>


                            <button
                                type="button"
                                className="settings-secondary-btn"
                                onClick={() =>
                                    router.push("/forgot-password")
                                }
                            >

                                Recover

                                <ChevronRight size={17} />

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        SECURITY CHECKLIST
                        ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <h2>
                                Security Status
                            </h2>

                            <p>
                                Current security protections for your account.
                            </p>

                        </div>


                        <div className="security-checklist">


                            {/* PASSWORD */}

                            <div className="security-settings-check">

                                <div className="security-settings-check-icon active">

                                    <CheckCircle2 size={18} />

                                </div>


                                <div>

                                    <strong>
                                        Password Protected
                                    </strong>

                                    <span>
                                        Your password is securely protected.
                                    </span>

                                </div>


                                <strong className="security-status-active">
                                    Active
                                </strong>

                            </div>


                            {/* AUTHENTICATED ACCESS */}

                            <div className="security-settings-check">

                                <div className="security-settings-check-icon active">

                                    <ShieldCheck size={18} />

                                </div>


                                <div>

                                    <strong>
                                        Authenticated Access
                                    </strong>

                                    <span>
                                        Your account requires authenticated access.
                                    </span>

                                </div>


                                <strong className="security-status-active">
                                    Active
                                </strong>

                            </div>


                            {/* 2FA */}

                            <div className="security-settings-check">

                                <div className="security-settings-check-icon">

                                    <Smartphone size={18} />

                                </div>


                                <div>

                                    <strong>
                                        Two-Factor Authentication
                                    </strong>

                                    <span>
                                        Additional authentication protection
                                        can be added later.
                                    </span>

                                </div>


                                <strong className="security-status-pending">
                                    Not Enabled
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        ACTIVE SESSION
                    ====================================== */}

                    <div className="settings-form-card">

                        <div className="settings-form-heading">

                            <div className="notification-heading-row">

                                <div className="notification-heading-icon app">

                                    <Monitor size={19} />

                                </div>

                                <div>

                                    <h2>
                                        Active Session
                                    </h2>

                                    <p>
                                        Information about your current
                                        authenticated session.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="security-session-row">

                            <div className="security-session-icon">

                                <Monitor size={20} />

                            </div>


                            <div className="security-session-content">

                                <strong>
                                    Current Browser
                                </strong>

                                <span>
                                    Active session
                                </span>

                                <small>
                                    This device
                                </small>

                            </div>


                            <span className="security-session-active">

                                Active

                            </span>

                        </div>


                        <div className="security-session-note">

                            <Info size={15} />

                            <span>
                                Advanced session management can be
                                added when device tracking is enabled.
                            </span>

                        </div>

                    </div>


                    {/* =====================================
                        SECURITY TIP
                    ====================================== */}

                    <div className="security-settings-tip">

                        <ShieldCheck size={21} />

                        <div>

                            <strong>
                                Security Tip
                            </strong>

                            <p>
                                Never share your password with anyone.
                                Use a unique password that you don't
                                use elsewhere.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        );
    }         


    // =====================================================
    // OTHER SETTINGS — TEMPORARY
    // =====================================================

    if (activeSetting) {

        const selected =
            settingsItems.find(
                (item) =>
                    item.id === activeSetting
            );


        if (selected) {

            const Icon = selected.icon;


            return (

                <div className="settings-page">

                    <div className="settings-detail-header">

                        <button
                            className="settings-back-btn"
                            onClick={handleBack}
                        >

                            <ArrowLeft size={17} />

                            Back to Settings

                        </button>


                        <div className="settings-detail-title">

                            <div className="settings-detail-icon">

                                <Icon size={21} />

                            </div>


                            <div>

                                <h1>
                                    {selected.title}
                                </h1>

                                <p>
                                    {selected.description}
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="settings-coming-soon">

                        <Icon size={32} />

                        <h2>
                            {selected.title}
                        </h2>

                        <p>
                            This settings section will
                            be implemented next.
                        </p>

                        <button
                            onClick={handleBack}
                            className="settings-secondary-btn"
                        >

                            Back to Settings

                        </button>

                    </div>

                </div>

            );

        }

    }


    // =====================================================
    // MAIN SETTINGS PAGE
    // =====================================================

    return (

        <div className="settings-page">


            {/* =================================
                HEADER
            ================================== */}

            <div className="settings-header">

                <div className="settings-header-icon">

                    <SettingsIcon size={24} />

                </div>


                <div>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your AI Workspace Assistant
                        preferences and configuration.
                    </p>

                </div>

            </div>


            {/* =================================
                SETTINGS CONTENT
            ================================== */}

            <div className="settings-content">


                <div className="settings-section">

                    <div className="settings-section-title">

                        <h2>
                            Workspace Settings
                        </h2>

                        <p>
                            Configure how your AI workspace
                            behaves.
                        </p>

                    </div>


                    <div className="settings-list">

                        {settingsItems.map((item) => {

                            const Icon =
                                item.icon;


                            return (

                                <button
                                    key={item.id}
                                    className="settings-item"
                                    onClick={() =>
                                        handleOpenSetting(
                                            item.id
                                        )
                                    }
                                >

                                    <div className="settings-item-icon">

                                        <Icon size={19} />

                                    </div>


                                    <div className="settings-item-content">

                                        <h3>
                                            {item.title}
                                        </h3>

                                        <p>
                                            {item.description}
                                        </p>

                                    </div>


                                    <ChevronRight
                                        size={18}
                                        className="settings-item-arrow"
                                    />

                                </button>

                            );

                        })}

                    </div>

                </div>


                {/* =================================
                    CURRENT CONFIGURATION
                ================================== */}

                <div className="settings-section">

                    <div className="settings-section-title">

                        <h2>
                            Current Configuration
                        </h2>

                        <p>
                            Current AI workspace
                            configuration.
                        </p>

                    </div>


                    <div className="configuration-card">

                        <div className="configuration-row">

                            <span>
                                AI Model
                            </span>

                            <strong>
                                gemini-flash-latest
                            </strong>

                        </div>


                        <div className="configuration-row">

                            <span>
                                Workspace
                            </span>

                            <strong>
                                Workspace 1
                            </strong>

                        </div>


                        <div className="configuration-row">

                            <span>
                                RAG Pipeline
                            </span>

                            <strong className="config-active">

                                Active

                            </strong>

                        </div>


                        <div className="configuration-row">

                            <span>
                                Retrieval
                            </span>

                            <strong>
                                Vector + BM25 + RRF
                            </strong>

                        </div>


                        <div className="configuration-row">

                            <span>
                                Reranker
                            </span>

                            <strong>
                                Cross Encoder
                            </strong>

                        </div>

                    </div>

                </div>


            </div>

        </div>

    );
}


// =========================================================
// NOTIFICATION TOGGLE COMPONENT
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
                        value
                            ? "active"
                            : ""
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