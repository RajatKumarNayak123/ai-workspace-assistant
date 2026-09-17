"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "../services/api";
import RetrievalMetrics from "../components/RetrievalMetrics";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ChatWindow from "../components/ChatWindow";
import MetricsPanel from "../components/MetricsPanel";
import UploadDocuments from "../components/UploadDocuments";
import MyWorkspaces from "../components/MyWorkspaces";
import ConversationHistory from "../components/ConversationHistory";
import Settings from "../components/Settings";


export default function Home() {

    // ==========================================
    // ACTIVE SECTION
    // ==========================================
    const searchParams = useSearchParams();
    // ==========================================
    // SELECTED GEMINI MODEL
    // ==========================================

    const [selectedModel, setSelectedModel] =
        useState("gemini-3.5-flash");
    
    const [activeSection, setActiveSection] =
        useState("chat");

    useEffect(() => {

        const section =
            searchParams.get("section");

        if (section === "settings") {

            setActiveSection("settings");

        }

    }, [searchParams]);    


    // ==========================================
    // CURRENT SESSION
    // ==========================================

    const [sessionId, setSessionId] =
        useState(null);
    const [targetMessageId, setTargetMessageId] =
        useState(null);
    const [selectedWorkspaceId, setSelectedWorkspaceId] =
        useState(null);

    const [workspaces, setWorkspaces] =
        useState([]);

    const [workspacesLoading, setWorkspacesLoading] =
        useState(true);    
    // ==========================================
    // CONVERSATION LIST
    // ==========================================

    const [conversations, setConversations] =
        useState([]);


    // ==========================================
    // RESTORE USER SESSION + CONVERSATIONS
    // ==========================================
    useEffect(() => {

    // ==========================================
    // GET CURRENT LOGGED-IN USER
    // ==========================================

        const currentUserRaw =
            localStorage.getItem("current_user");


        if (!currentUserRaw) {

            console.warn(
                "No logged-in user found."
            );

            return;

        }


        let currentUser;


        try {

            currentUser =
                JSON.parse(currentUserRaw);

        } catch (error) {

            console.error(
                "Failed to parse current user:",
                error
            );

            return;

        }


    // ==========================================
    // GET USER ID
    // ==========================================

        const userId =
            currentUser.id;


        if (!userId) {

            console.error(
                "Current user ID is missing."
            );

            return;

        }


        console.log(
            "Logged-in user ID:",
            userId
        );


    // ==========================================
    // USER-SPECIFIC SESSION STORAGE KEY
    // ==========================================

        const sessionStorageKey =
            `ai_workspace_session_id_${userId}`;


    // ==========================================
    // LOAD CONVERSATIONS FROM BACKEND
    // ==========================================

        const loadConversations = async () => {

            try {

                console.log(
                    "Loading conversations from backend..."
                );


                const response =
                    await api.get(
                        "/chat/conversations"
                    );


                const backendConversations =
                    response.data.conversations || [];


                console.log(
                    "Backend conversations:",
                    backendConversations
                );


                setConversations(
                    backendConversations
                );


            } catch (error) {

                console.error(
                    "Failed to load conversations:",
                    error
                );

            }

        };


        loadConversations();


        // ==========================================
        // LOAD USER WORKSPACES
        // ==========================================

        const loadWorkspaces = async () => {

            try {

                console.log(
                    "Loading user workspaces..."
                );

                const response =
                    await api.get(
                        "/workspaces"
                    );

                const userWorkspaces = Array.isArray(response.data)
                    
                    ? response.data
                    : Array.isArray(response.data?.workspaces)
                        ? response.data.workspaces
                        : [];

                console.log("Workspace API response:", response.data);
                console.log("Parsed workspaces:", userWorkspaces);

                console.log(
                    "User workspaces:",
                    userWorkspaces
                );

                setWorkspaces(
                    userWorkspaces
                );

        // ----------------------------------
        // SELECT FIRST WORKSPACE
        // ----------------------------------

                const workspaceStorageKey =
                    `ai_workspace_selected_workspace_${userId}`;

                const savedWorkspaceId =
                    localStorage.getItem(workspaceStorageKey);

                const savedWorkspace =
                    userWorkspaces.find(
                        (workspace) =>
                            String(workspace.id) ===
                            String(savedWorkspaceId)
                    );

                if (savedWorkspace) {

                    setSelectedWorkspaceId(
                        savedWorkspace.id
                    );

                } else if (userWorkspaces.length > 0) {

                    const firstWorkspace =
                        userWorkspaces[0];

                    setSelectedWorkspaceId(
                        firstWorkspace.id
                    );

                    localStorage.setItem(
                        workspaceStorageKey,
                        String(firstWorkspace.id)
                    );

                } else {

                    setSelectedWorkspaceId(null);

                }

            } catch (error) {

                console.error(
                    "Failed to load workspaces:",
                    error
                );

                setSelectedWorkspaceId(
                    null
                );

            } finally {

                setWorkspacesLoading(
                    false
                );

            }

        };

        loadWorkspaces();


    // ==========================================
    // RESTORE SAVED SESSION
    // ==========================================

        const savedSessionId =
            localStorage.getItem(
                sessionStorageKey
            );


    // ==========================================
    // RESTORE OR CREATE SESSION
    // ==========================================

        if (savedSessionId) {

            console.log(
                "Restored user session:",
                savedSessionId
            );


            setSessionId(
                savedSessionId
            );


        } else {

            const newSessionId =
                `session-${userId}-${Date.now()}`;


            localStorage.setItem(
                sessionStorageKey,
                newSessionId
            );


            console.log(
                "Created new user session:",
                newSessionId
            );


            setSessionId(
                newSessionId
            );

        }

    }, []);
    // ==========================================
    // SAVE USER-SPECIFIC CONVERSATIONS
    // ==========================================
    
    useEffect(() => {

        if (!selectedWorkspaceId) {
            return;
        }

        const currentUserRaw =
            localStorage.getItem("current_user");

        if (!currentUserRaw) {
            return;
        }

        try {

            const currentUser =
                JSON.parse(currentUserRaw);

            if (!currentUser.id) {
                return;
            }

            const workspaceStorageKey =
                `ai_workspace_selected_workspace_${currentUser.id}`;

            localStorage.setItem(
                workspaceStorageKey,
                String(selectedWorkspaceId)
            );

        } catch (error) {

            console.error(
                "Failed to save selected workspace:",
                error
            );

        }

    }, [selectedWorkspaceId]);


    // ==========================================
    // ADD NEW CONVERSATION
    // ==========================================

    const addConversation = (
        newSessionId,
        title
    ) => {

        setConversations((prev) => {

            // ----------------------------------
            // PREVENT DUPLICATES
            // ----------------------------------

            const alreadyExists =
                prev.some(
                    (conversation) =>
                        conversation.sessionId ===
                        newSessionId
                );


            if (alreadyExists) {

                return prev;

            }


            // ----------------------------------
            // CREATE CONVERSATION
            // ----------------------------------

            const newConversation = {

                sessionId:
                    newSessionId,

                title:
                    title ||
                    "New conversation",

                createdAt:
                    Date.now(),

            };


            // ----------------------------------
            // ADD TO TOP
            // ----------------------------------

            return [
                newConversation,
                ...prev,
            ];

        });

    };


    // ==========================================================
    // RENAME CONVERSATION
    // ==========================================================

    const handleRenameConversation = async (
        conversation
    ) => {

        if (!conversation) {
            return;
        }


        const currentTitle =
            conversation.title || "New conversation";


        const newTitle =
            window.prompt(
                "Rename conversation",
                currentTitle
            );


        // User pressed Cancel

        if (newTitle === null) {
            return;
        }


        const trimmedTitle =
            newTitle.trim();


        // Empty title

        if (!trimmedTitle) {

            window.alert(
                "Conversation title cannot be empty."
            );

            return;
        }


        // Same title

        if (
            trimmedTitle ===
            currentTitle
        ) {

            return;
        }


        try {

            console.log(
                "Renaming conversation:",
                conversation.sessionId
            );


            const response =
                await api.put(
                    `/chat/conversations/${encodeURIComponent(
                        conversation.sessionId
                    )}`,
                    {
                        title: trimmedTitle,
                    }
                );


            const updatedConversation =
                response.data.conversation;


            // ----------------------------------------------
            // UPDATE SIDEBAR IMMEDIATELY
            // ----------------------------------------------

            setConversations((prev) =>

                prev.map((item) => {
 
                    if (
                        item.sessionId ===
                        conversation.sessionId
                    ) {

                        return {
                            ...item,

                            title:
                                updatedConversation?.title ||
                                trimmedTitle,
                        };

                    }


                    return item;

                })

            );


            console.log(
                "Conversation renamed successfully."
            );


        } catch (error) {

            console.error(
                "Failed to rename conversation:",
                error
            );


            window.alert(
                error.response?.data?.detail ||
                "Failed to rename conversation."
            );

        }

    };



    // ==========================================================
    // DELETE CONVERSATION
    // ==========================================================

    const handleDeleteConversation = async (
        conversation
    ) => {

        if (!conversation) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${conversation.title}"?\n\nThis will permanently delete this conversation and its messages.`
            );


        if (!confirmed) {
            return;
        }


        try {

            console.log(
                "Deleting conversation:",
                conversation.sessionId
            );


            await api.delete(
                `/chat/conversations/${encodeURIComponent(
                    conversation.sessionId
                )}`
            );


            // ----------------------------------------------
            // REMOVE FROM SIDEBAR
            // ----------------------------------------------

            setConversations((prev) =>
                prev.filter(
                    (item) =>
                        item.sessionId !==
                        conversation.sessionId
                )
            );


            // ----------------------------------------------
            // IF DELETED CHAT IS CURRENT CHAT
            // ----------------------------------------------

            if (
                sessionId ===
                conversation.sessionId
            ) {

                const remainingConversations =
                    conversations.filter(
                        (item) =>
                            item.sessionId !==
                            conversation.sessionId
                    );


                if (
                    remainingConversations.length > 0
                ) {

                    const nextConversation =
                        remainingConversations[0];


                    handleSelectConversation(
                        nextConversation.sessionId
                    );

                } else {

                    // --------------------------------------
                    // NO CONVERSATIONS LEFT
                    // CREATE A FRESH SESSION
                    // --------------------------------------

                    handleNewChat();

                }

            }


            console.log(
                "Conversation deleted successfully."
            );


        } catch (error) {

            console.error(
                "Failed to delete conversation:",
                error
            );


            window.alert(
                error.response?.data?.detail ||
                "Failed to delete conversation."
            );

        }

    };


    // ==========================================================
    // SHARE CONVERSATION
    // ==========================================================

    const handleShareConversation = async (
        conversation
    ) => {

        if (!conversation) {
            return;
        }


        const shareUrl =
            `${window.location.origin}/?session=${encodeURIComponent(
                conversation.sessionId
            )}`;


        const shareData = {

            title:
                conversation.title ||
                "AI Workspace Conversation",

            text:
                `AI Workspace conversation: ${
                    conversation.title ||
                    "Conversation"
                }`,

            url:
                shareUrl,

        };


        try {

            // ----------------------------------------------
            // NATIVE SHARE
            // ----------------------------------------------

            if (
                navigator.share
            ) {

                await navigator.share(
                    shareData
                );

                return;

            }


            // ----------------------------------------------
            // CLIPBOARD FALLBACK
            // ----------------------------------------------

            await navigator.clipboard.writeText(
                shareUrl
            );


            window.alert(
                "Conversation link copied to clipboard."
            );


        } catch (error) {

            /*
            * User cancelling the native share dialog
            * is not an error that needs to be shown.
            */

            if (
                error?.name ===
                "AbortError"
            ) {

                return;
 
            }


            console.error(
                "Failed to share conversation:",
                error
            );


            window.alert(
                "Unable to share conversation."
            );

        }

    };

    // ==========================================
    // NEW CHAT
    // ==========================================

    const handleNewChat = () => {

        // --------------------------------------
        // GET CURRENT USER
        // --------------------------------------

        const currentUserRaw =
            localStorage.getItem(
                "current_user"
            );


        let userId = null;


        if (currentUserRaw) {

            try {

                const currentUser =
                    JSON.parse(
                        currentUserRaw
                    );


                userId =
                    currentUser.id;

            } catch (error) {

                console.error(
                    "Failed to read current user:",
                    error
                );

            }

        }


        // --------------------------------------
        // SAFETY CHECK
        // --------------------------------------

        if (!userId) {

            console.error(
                "Cannot create chat: user ID missing."
            );

            return;

        }


        // --------------------------------------
        // CREATE USER-SPECIFIC SESSION
        // --------------------------------------

        const newSessionId =
            `session-${userId}-${Date.now()}`;


        console.log(
            "Creating new user session:",
            newSessionId
        );


        // --------------------------------------
        // USER-SPECIFIC SESSION STORAGE
        // --------------------------------------

        const sessionStorageKey =
            `ai_workspace_session_id_${userId}`;


        localStorage.setItem(
            sessionStorageKey,
            newSessionId
        );


        // --------------------------------------
        // CHANGE CURRENT SESSION
        // --------------------------------------

        setSessionId(
            newSessionId
        );


        // --------------------------------------
        // GO TO CHAT
        // --------------------------------------

        setActiveSection(
            "chat"
        );

    };


    // ==========================================
    // OPEN EXISTING CONVERSATION
    // ==========================================

    const handleSelectConversation = (
        selectedSessionId,
        messageId = null
    ) => {

        console.log(
            "Opening conversation:",
            selectedSessionId
        );

        console.log(
            "Target message:",
            messageId
        );


        // --------------------------------------
        // GET CURRENT USER
        // --------------------------------------

        const currentUserRaw =
            localStorage.getItem(
                "current_user"
            );


        if (!currentUserRaw) {

            console.error(
                "No logged-in user found."
            );

            return;

        }


        try {

            const currentUser =
                JSON.parse(
                    currentUserRaw
                );


            const userId =
                currentUser.id;


            if (!userId) {

                console.error(
                    "Current user ID is missing."
                );

                return;

            }


            // ----------------------------------
            // USER-SPECIFIC SESSION KEY
            // ----------------------------------

            const sessionStorageKey =
                `ai_workspace_session_id_${userId}`;


            // ----------------------------------
            // SAVE SELECTED SESSION
            // ----------------------------------

            localStorage.setItem(
                sessionStorageKey,
                selectedSessionId
            );

            setTargetMessageId(
                messageId
            );


            // ----------------------------------
            // LOAD SELECTED SESSION
            // ----------------------------------

            setSessionId(
                selectedSessionId
            );


            // ----------------------------------
            // GO TO CHAT
            // ----------------------------------

            setActiveSection(
                "chat"
            );


        } catch (error) {

            console.error(
                "Failed to select conversation:",
                error
            );

        }

    };

// ==========================================
// OPEN WORKSPACE FROM GLOBAL SEARCH
// ==========================================

    const handleSelectWorkspace = (workspaceId) => {

        console.log(
            "Opening workspace:",
            workspaceId
        );

        const numericWorkspaceId =
            Number(workspaceId);

        if (!numericWorkspaceId) {

            console.error(
                "Invalid workspace ID:",
                workspaceId
            );

            return;
        }

        // Clear any previously selected message
        setTargetMessageId(null);

        setSelectedWorkspaceId(
            numericWorkspaceId
        );

        setActiveSection(
            "workspaces"
        );

    };


    // ==========================================
    // WAIT FOR SESSION
    // ==========================================

    if (!sessionId || workspacesLoading) {

        return (

            <div className="app-loading">

                Loading AI Workspace Assistant...

            </div>

        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (


        <div className="app-layout">


            {/* ==================================
                SIDEBAR
            ================================== */}

            <Sidebar

                activeSection={
                    activeSection
                }

                setActiveSection={
                    setActiveSection
                }

                onNewChat={
                    handleNewChat
                }

                conversations={
                    conversations
                }

                activeSessionId={
                    sessionId
                }

                onSelectConversation={
                    handleSelectConversation
                }

                onRenameConversation={
                    handleRenameConversation
                }

                onShareConversation={
                    handleShareConversation
                }

                onDeleteConversation={
                    handleDeleteConversation
                }

            />


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main className="main-content">


                {/* =================================
                    TOPBAR
                ================================= */}

                <Topbar 
                    onOpenSettings={() => setActiveSection("settings")}
                    selectedModel={ selectedModel}
                    setSelectedModel={setSelectedModel}
                    onSelectConversation={handleSelectConversation}
                    onSelectWorkspace={handleSelectWorkspace}
                />


                <div className="content-wrapper">


                    <div className="main-workspace">


                        {/* ==========================
                            UPLOAD
                        ========================== */}

                        {activeSection ===
                            "upload" && (

                            <UploadDocuments
                                workspaceId={selectedWorkspaceId}
                            />

                        )}


                        {/* ==========================
                            AI CHAT
                        ========================== */}

                        {activeSection ===
                            "chat" && (

                            <ChatWindow

                                key={
                                    sessionId
                                }

                                sessionId={
                                    sessionId
                                }

                                workspaceId={
                                    selectedWorkspaceId
                                }
                                
                                selectedModel={
                                    selectedModel
                                }

                                targetMessageId={
                                    targetMessageId
                                }

                                onConversationCreated={
                                    addConversation
                                }

                            />

                        )}


                        {/* ==========================
                            WORKSPACES
                        ========================== */}

                        {activeSection ===
                            "workspaces" && (

                            <MyWorkspaces
                                workspaceId={selectedWorkspaceId}
                            />

                        )}


                        {/* ==========================
                            HISTORY
                        ========================== */}

                        {activeSection ===
                            "history" && (

                            <ConversationHistory
                                sessionId={
                                    sessionId
                                }
                            />

                        )}


                        {/* ==========================
                            METRICS
                        ========================== */}

                        {activeSection ===
                            "metrics" && (

                            <RetrievalMetrics workspaceId={selectedWorkspaceId}/>

                        )}


                        {/* ==========================
                            SETTINGS
                        ========================== */}

                        {activeSection ===
                            "settings" && (

                            <Settings workspaceId={selectedWorkspaceId} />

                        )}

                    </div>


                    {/* =================================
                        METRICS PANEL
                    ================================= */}

                    <MetricsPanel />


                </div>


            </main>

        </div>

    );

}