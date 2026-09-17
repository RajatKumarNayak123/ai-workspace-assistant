"use client";

import {
    useState,
    useEffect,
    useRef,
    useMemo,
    memo,
} from "react";

import {
    Copy,
    Edit3,
    Share2,
    MoreHorizontal,
    Check,
    Download,
} from "lucide-react";

import "./ChatWindow.css";
import api from "../services/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

import CodeBlock from "./CodeBlock";


// ==========================================================
// ATTACHMENT CARD
// ==========================================================

const AttachmentCard = memo(function AttachmentCard({
    file,
    index,
    onRemove,
}) {

    const [previewUrl, setPreviewUrl] = useState(null);

    const isImage =
        file?.type?.startsWith("image/");


    // ======================================================
    // IMAGE PREVIEW
    // ======================================================

    useEffect(() => {

        if (!isImage || !file) {
            return;
        }

        const url =
            URL.createObjectURL(file);

        setPreviewUrl(url);

        return () => {

            URL.revokeObjectURL(url);

        };

    }, [file, isImage]);


    // ======================================================
    // FILE SIZE
    // ======================================================

    const formatFileSize = (bytes) => {

        if (!bytes) {
            return "0 KB";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {

            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;

        }

        if (bytes < 1024 * 1024 * 1024) {

            return `${(
                bytes /
                (1024 * 1024)
            ).toFixed(1)} MB`;

        }

        return `${(
            bytes /
            (1024 * 1024 * 1024)
        ).toFixed(1)} GB`;

    };


    // ======================================================
    // FILE ICON
    // ======================================================

    const getFileIcon = () => {

        if (isImage) {
            return "🖼️";
        }

        if (
            file?.type ===
            "application/pdf"
        ) {
            return "📕";
        }

        if (
            file?.name
                ?.toLowerCase()
                .endsWith(".doc") ||
            file?.name
                ?.toLowerCase()
                .endsWith(".docx")
        ) {
            return "📘";
        }

        if (
            file?.name
                ?.toLowerCase()
                .endsWith(".xls") ||
            file?.name
                ?.toLowerCase()
                .endsWith(".xlsx")
        ) {
            return "📗";
        }

        if (
            file?.name
                ?.toLowerCase()
                .endsWith(".ppt") ||
            file?.name
                ?.toLowerCase()
                .endsWith(".pptx")
        ) {
            return "📙";
        }

        if (
            file?.type?.startsWith("text/")
        ) {
            return "📄";
        }

        return "📎";

    };


    return (

        <div className="attachment-card">

            {/* ==================================================
                IMAGE PREVIEW
            ================================================== */}

            {isImage && previewUrl ? (

                <div className="attachment-image-preview">

                    <img
                        src={previewUrl}
                        alt={file?.name || "Attachment"}
                    />

                </div>

            ) : (

                <div className="attachment-file-icon">

                    {getFileIcon()}

                </div>

            )}


            {/* ==================================================
                FILE INFO
            ================================================== */}

            <div className="attachment-info">

                <div
                    className="attachment-name"
                    title={file?.name || ""}
                >
                    {file?.name || "Unknown file"}
                </div>

                <div className="attachment-size">

                    {formatFileSize(file?.size)}

                </div>

            </div>


            {/* ==================================================
                REMOVE
            ================================================== */}

            <button
                type="button"
                className="remove-attachment-button"
                onClick={() =>
                    onRemove(index)
                }
                title="Remove attachment"
            >
                ×
            </button>

        </div>

    );

});


const createClientMessageId = () => {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `local-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
};


// ==========================================================
// CHAT MESSAGE
// ==========================================================

const ChatMessage = memo(function ChatMessage({
    message,
    targetMessageId,
    messageRef,
    onCopy,
    onEdit,
    onShare,
    openMenuMessageId,
    onToggleMenu,
    copiedMessageId,
}) {

    const downloadGeneratedImage = async (
        imageUrl,
        imagePrompt
    ) => {
        try {
            const fullUrl =
                imageUrl?.startsWith("http")
                    ? imageUrl
                    : `${api.defaults.baseURL}${imageUrl}`;

            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(
                    "Failed to download image."
                );
            }

            const blob = await response.blob();

            const blobUrl =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = blobUrl;

            link.download =
                imagePrompt
                    ? `generated-image-${Date.now()}.png`
                    : `generated-image.png`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error(
                "Image download failed:",
                error
            );
        }
    };

    const isUser =
        message.role === "user";

    const isTarget =
        String(message.id) ===
        String(targetMessageId);

    const isMenuOpen =
        String(openMenuMessageId) ===
        String(message.id);


    return (

        <div
            ref={messageRef}
            className={
                isUser
                    ? `user-message ${
                        isTarget
                            ? "search-target-message"
                            : ""
                    }`
                    : `assistant-message ${
                        isTarget
                            ? "search-target-message"
                            : ""
                    }`
            }
        >

            {/* ==================================================
                ASSISTANT AVATAR
            ================================================== */}

            {!isUser && (

                <div className="avatar">
                    AI
                </div>

            )}


            {/* ==================================================
                MESSAGE AREA
            ================================================== */}

            <div
                className={
                    isUser
                        ? "user-message-content"
                        : "assistant-message-content"
                }
            >

                {/* ==================================================
                    MESSAGE CARD
                ================================================== */}

                <div
                    className={
                        isUser
                            ? "user-card"
                            : "message-card"
                    }
                >

                    {!isUser && (

                        <h3>
                            AI Workspace Assistant
                        </h3>

                    )}


                    {/* ==================================================
                        MARKDOWN
                    ================================================== */}

                    <div className="markdown-body">

                        {message.message_type === "image" &&
                        message.image_url ? (

                            <div className="generated-image-container">

                                <img
                                    src={
                                        message.image_url?.startsWith("http")
                                            ? message.image_url
                                            : `${api.defaults.baseURL}${message.image_url}`
                                    }
                                    alt={
                                        message.image_prompt ||
                                        "Generated image"
                                    }
                                    className="generated-chat-image"
                                />
                                <div className="generated-image-actions">
                                    <button
                                        type="button"
                                        className="generated-image-download"
                                        onClick={() =>
                                            downloadGeneratedImage(
                                                message.image_url,
                                                message.image_prompt
                                            )
                                        }
                                        title="Download image"
                                        aria-label="Download image"
                                    >
                                        <Download size={18} />
                                        <span>Download</span>
                                    </button>
                                </div>    

                            </div>

                        ) : (

                            <ReactMarkdown
                                remarkPlugins={[
                                    remarkGfm,
                                ]}
                                rehypePlugins={[
                                    rehypeHighlight,
                                ]}
                                components={{

                                    code({
                                        className,
                                        children,
                                        ...props
                                    }) {

                                        return (

                                            <code
                                                className={
                                                    className
                                                }
                                                {...props}
                                            >
                                                {children}
                                            </code>

                                        );

                                    },

                                    pre({
                                        children,
                                    }) {

                                        const codeElement =
                                            children?.props;

                                        const className =
                                            codeElement?.className ||
                                            "";

                                        return (

                                            <CodeBlock
                                                className={
                                                    className
                                                }
                                            >
                                                {
                                                    codeElement?.children
                                                }
                                            </CodeBlock>

                                        );

                                    },

                                }}
                            >

                                {message.answer}

                            </ReactMarkdown>

                        )}

                    </div>


                    {/* ==================================================
                        CITATIONS
                    ================================================== */}

                    {Array.isArray(message.citations) &&
                        message.citations.length > 0 && (

                            <div className="citation-container">

                                {message.citations.map(
                                    (
                                        citation,
                                        index
                                    ) => (

                                        <span
                                            key={
                                                citation?.chunk_id ||
                                                `${citation?.filename || "file"}-${index}`
                                            }
                                            className="citation-chip"
                                            title={
                                                citation?.chunk_id
                                                    ? `Chunk: ${citation.chunk_id}`
                                                    : citation?.filename || ""
                                            }
                                        >

                                            📄{" "}

                                            {
                                                citation?.filename ||
                                                "Document"
                                            }

                                        </span>

                                    )
                                )}

                            </div>

                        )}

                </div>


                {/* ==================================================
                    USER MESSAGE ACTIONS
                ================================================== */}

                {isUser && (

                    <div className="message-actions-wrapper">

                        {/* ==========================================
                            THREE DOT BUTTON
                        ========================================== */}

                        <button
                            type="button"
                            className={
                                `message-menu-trigger ${
                                    isMenuOpen
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={(event) => {

                                event.stopPropagation();

                                onToggleMenu(
                                    message.id
                                );

                            }}
                            title="Message options"
                            aria-label="Message options"
                            aria-expanded={
                                isMenuOpen
                            }
                        >

                            <MoreHorizontal
                                size={17}
                            />

                        </button>


                        {/* ==========================================
                            ACTION MENU
                        ========================================== */}

                        {isMenuOpen && (

                            <div
                                className="message-action-menu"
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >

                                {/* COPY */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        onCopy(
                                            message.answer,
                                            message.id
                                        )
                                    }
                                >

                                    {String(copiedMessageId) ===
                                    String(message.id) ? (
                                        <Check size={15} />
                                    ) : (
                                        <Copy size={15} />
                                    )}

                                    <span>
                                        {String(copiedMessageId) ===
                                        String(message.id)
                                            ? "Copied"
                                            : "Copy"}
                                    </span>

                                </button>


                                {/* EDIT */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        onEdit(
                                            message.answer,
                                            message.id
                                        )
                                    }
                                >

                                    <Edit3
                                        size={15}
                                    />

                                    <span>
                                        Edit
                                    </span>

                                </button>


                                {/* SHARE */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        onShare(
                                            message.answer,
                                            message.id
                                        )
                                    }
                                >

                                    <Share2
                                        size={15}
                                    />

                                    <span>
                                        Share
                                    </span>

                                </button>

                            </div>

                        )}

                    </div>

                )}

            </div>

        </div>

    );

});


// ==========================================================
// MAIN CHAT WINDOW
// ==========================================================

export default function ChatWindow({
    sessionId,
    selectedModel,
    onConversationCreated,
    targetMessageId,
    workspaceId,
}) {

    // ======================================================
    // QUESTION
    // ======================================================

    const [question, setQuestion] =
        useState("");


    // ======================================================
    // LOADING
    // ======================================================

    const [loading, setLoading] =
        useState(false);



    // ======================================================
    // MESSAGE ACTION MENU
    // ======================================================

    const [openMessageMenuId, setOpenMessageMenuId] =
        useState(null);


    // ======================================================
    // COPIED MESSAGE
    // ======================================================

    const [copiedMessageId, setCopiedMessageId] =
        useState(null);    
    // ======================================================
    // ATTACHMENTS
    // ======================================================

    const [attachments, setAttachments] =
        useState([]);


    const [attachmentMenuOpen, setAttachmentMenuOpen] =
        useState(false);

    const [imageMode, setImageMode] = useState(false); 
    // ======================================================
    // INPUT REFS
    // ======================================================

    const documentInputRef =
        useRef(null);

    const fileInputRef =
        useRef(null);

    const imageInputRef =
        useRef(null);

    const attachmentMenuRef =
        useRef(null);

    const textareaRef =
    useRef(null);
    // ======================================================
    // MESSAGES
    // ======================================================

    const storedUser = localStorage.getItem("current_user");

    let firstName = "there";

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);

            firstName =
                user?.full_name?.trim()?.split(" ")[0] ||
                user?.name?.trim()?.split(" ")[0] ||
                "there";

        } catch (error) {
            console.error(
                "Failed to parse current user:",
                error
            );
        }
    }

    const [messages, setMessages] =

    
        useState([
            {
                role: "assistant",

                answer:
                    `👋 Welcome ${firstName}!\n\nUpload one or more documents and ask questions in natural language.`,

                citations: [],
            },
        ]);


    // ======================================================
    // MESSAGE REFS
    // ======================================================

    const bottomRef =
        useRef(null);


    const historyLoadedRef =
        useRef(null);


    const messageRefs =
        useRef({});


    // ==========================================================
    // LOAD EXISTING CONVERSATION
    // ==========================================================

    useEffect(() => {

        if (!sessionId) {
            return;
        }


        if (
            historyLoadedRef.current ===
            sessionId
        ) {
            return;
        }


        historyLoadedRef.current =
            sessionId;


        const loadHistory = async () => {

            try {

                const response =
                    await api.get(
                        `/chat/history/${sessionId}`
                    );


                const history =
                    response.data?.messages ||
                    [];


                if (!history.length) {
                    return;
                }


                const formattedMessages =
                    history.map(
                        (message) => {

                            let content =
                                message.content ||
                                "";


                            // ==================================================
                            // OLD JSON ASSISTANT RESPONSE SUPPORT
                            // ==================================================

                            if (
                                message.role ===
                                    "assistant" &&
                                typeof content ===
                                    "string"
                            ) {

                                try {

                                    const parsed =
                                        JSON.parse(
                                            content
                                        );


                                    if (
                                        parsed &&
                                        typeof parsed ===
                                            "object" &&
                                        parsed.answer
                                    ) {

                                        return {

                                            id:
                                                message.id,

                                            role:
                                                "assistant",

                                            answer:
                                                parsed.answer,

                                            citations:
                                                Array.isArray(
                                                    parsed.citations
                                                )
                                                    ? parsed.citations
                                                    : [],
                                            message_type:
                                                message.message_type || "text",

                                            image_url:
                                                message.image_url || null,

                                            image_prompt:
                                                message.image_prompt || null,

                                            image_model:
                                                message.image_model || null,
                                        };

                                    }

                                } catch {

                                    // Normal text response.

                                }

                            }


                            return {

                                id:
                                    message.id,

                                role:
                                    message.role,

                                answer:
                                    content,

                                citations:
                                    Array.isArray(
                                        message.citations
                                    )
                                        ? message.citations
                                        : [],

                                message_type:
                                    message.message_type || "text",

                                image_url:
                                    message.image_url || null,

                                image_prompt:
                                    message.image_prompt || null,

                                image_model:
                                    message.image_model || null,        

                            };

                        }
                    );


                setMessages(
                    formattedMessages
                );

            } catch (error) {

                console.error(
                    "Failed to load chat history:",
                    error
                );


                // Allow retry
                historyLoadedRef.current =
                    null;

            }

        };


        loadHistory();

    }, [sessionId]);


    // ==========================================================
    // CLOSE ATTACHMENT MENU
    // ==========================================================

    useEffect(() => {

        const handleOutsideClick = (
            event
        ) => {

            if (
                attachmentMenuRef.current &&
                !attachmentMenuRef.current.contains(
                    event.target
                )
            ) {

                setAttachmentMenuOpen(
                    false
                );

            }

        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);

    // ==========================================================  
    // CLOSE MESSAGE MENU ON OUTSIDE CLICK
    // ==========================================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            // Keep the menu open while clicking its trigger/actions.
            if (
                event.target?.closest?.(
                    ".message-actions-wrapper"
                )
            ) {
                return;
            }

            setOpenMessageMenuId(null);

        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, []);
    // ==========================================================
    // FILE SELECTION
    // ==========================================================

    const handleFilesSelected = (
        event
    ) => {

        const selectedFiles =
            Array.from(
                event.target.files || []
            );


        if (!selectedFiles.length) {
            return;
        }


        setAttachments(
            (previousFiles) => {

                const existingKeys =
                    new Set(
                        previousFiles.map(
                            (file) =>
                                `${file.name}-${file.size}-${file.lastModified}`
                        )
                    );


                const newFiles =
                    selectedFiles.filter(
                        (file) => {

                            const key =
                                `${file.name}-${file.size}-${file.lastModified}`;


                            return !existingKeys.has(
                                key
                            );

                        }
                    );


                return [
                    ...previousFiles,
                    ...newFiles,
                ];

            }
        );


        // ==================================================
        // ALLOW SAME FILE TO BE SELECTED AGAIN
        // ==================================================

        event.target.value = "";


        setAttachmentMenuOpen(
            false
        );

    };


    // ==========================================================
    // REMOVE ATTACHMENT
    // ==========================================================

    const removeAttachment = (
        indexToRemove
    ) => {

        setAttachments(
            (previousFiles) =>
                previousFiles.filter(
                    (_, index) =>
                        index !==
                        indexToRemove
                )
        );

    };


    // ==========================================================
    // MESSAGE ACTIONS
    // ==========================================================

    // ==========================================================
    // TOGGLE MESSAGE MENU
    // ==========================================================

    const toggleMessageMenu = (
        messageId
    ) => {

        setOpenMessageMenuId(
            (previous) =>
                String(previous) ===
                String(messageId)
                    ? null
                    : messageId
        );

    };


    // ==========================================================
    // COPY MESSAGE
    // ==========================================================

    const handleCopyMessage = async (
        text,
        messageId
    ) => {
        const value = text || "";

        try {
            // Modern Clipboard API.
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(value);
            } else {
                // Fallback for browsers/environments where
                // navigator.clipboard is unavailable.
                const textarea = document.createElement("textarea");
                textarea.value = value;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                textarea.style.top = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();

                const copied = document.execCommand("copy");
                document.body.removeChild(textarea);

                if (!copied) {
                    throw new Error("Clipboard copy failed.");
                }
            }

            setCopiedMessageId(messageId);

            window.setTimeout(() => {
                setCopiedMessageId((current) =>
                    current === messageId ? null : current
                );
            }, 1500);
        } catch (error) {
            console.error("Failed to copy message:", error);
        } finally {
            setOpenMessageMenuId(null);
        }
    };


    // ==========================================================
    // EDIT MESSAGE
    // ==========================================================

    const handleEditMessage = (
        text,
        messageId
    ) => {

        setQuestion(
            text || ""
        );


        setOpenMessageMenuId(
            null
        );


        // Wait until React updates textarea value.
        setTimeout(() => {

            textareaRef.current?.focus();

            textareaRef.current?.setSelectionRange(
                (text || "").length,
                (text || "").length
            );

        }, 50);

    };


    // ==========================================================
    // SHARE MESSAGE
    // ==========================================================

    const handleShareMessage = async (
        text,
        messageId
    ) => {
        const value = text || "";

        try {
            // Use the native Share Sheet when supported.
            if (
                typeof navigator.share === "function"
            ) {
                await navigator.share({
                    title: "AI Workspace Assistant",
                    text: value,
                });
            } else {
                // Desktop browsers such as Firefox may not support
                // navigator.share, so fall back to copying the text.
                if (
                    navigator.clipboard &&
                    typeof navigator.clipboard.writeText === "function"
                ) {
                    await navigator.clipboard.writeText(value);
                } else {
                    const textarea = document.createElement("textarea");
                    textarea.value = value;
                    textarea.setAttribute("readonly", "");
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    textarea.style.top = "0";
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();

                    const copied = document.execCommand("copy");
                    document.body.removeChild(textarea);

                    if (!copied) {
                        throw new Error("Share fallback failed.");
                    }
                }

                setCopiedMessageId(messageId);

                window.setTimeout(() => {
                    setCopiedMessageId((current) =>
                        current === messageId ? null : current
                    );
                }, 1500);
            }
        } catch (error) {
            // User cancelled the native share sheet.
            if (error?.name !== "AbortError") {
                console.error("Failed to share message:", error);
            }
        } finally {
            setOpenMessageMenuId(null);
        }
    };


    // ==========================================================
    // UPLOAD DOCUMENT ATTACHMENTS
    // ==========================================================

    const uploadAttachments = async (
        selectedFiles = []
    ) => {

        // ==================================================
        // SAFETY
        //
        // Prevent:
        // "selectedFiles is undefined"
        // ==================================================

        if (
            !Array.isArray(selectedFiles) ||
            selectedFiles.length === 0
        ) {

            console.log(
                "No attachment files to upload."
            );

            return [];

        }


        const uploadedDocuments = [];


        for (const file of selectedFiles) {

            if (!file) {
                continue;
            }


            // ==================================================
            // IMPORTANT
            //
            // Images are preview-only.
            // Do not send images to document parser.
            // ==================================================

            if (
                file.type?.startsWith(
                    "image/"
                )
            ) {

                console.log(
                    "Skipping image attachment:",
                    file.name
                );

                continue;

            }


            console.log(
                "========================================"
            );

            console.log(
                "ATTACHMENT UPLOAD START"
            );

            console.log(
                "Filename:",
                file.name
            );

            console.log(
                "Size:",
                file.size
            );

            console.log(
                "Type:",
                file.type
            );

            console.log(
                "Workspace:",
                workspaceId
            );


            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            try {

                const response =
                    await api.post(
                        `/workspaces/${workspaceId}/documents/upload`,
                        formData
                    );


                console.log(
                    "ATTACHMENT UPLOAD SUCCESS"
                );

                console.log(
                    "Server Response:",
                    response.data
                );


                // ==================================================
                // SAVE UPLOAD RESPONSE
                // ==================================================

                if (
                    response.data
                ) {

                    uploadedDocuments.push(
                        response.data
                    );

                }

            } catch (error) {

                console.error(
                    "ATTACHMENT UPLOAD FAILED"
                );

                console.error(
                    "Filename:",
                    file.name
                );

                console.error(
                    "Status:",
                    error?.response?.status
                );

                console.error(
                    "Response:",
                    error?.response?.data
                );

                throw error;

            }

        }


        console.log(
            "ALL ATTACHMENTS UPLOADED:",
            uploadedDocuments
        );


        return uploadedDocuments;

    };

    
    
    const sendImage = async () => {
        const userQuestion = question.trim();

        if (!userQuestion || loading) {
            return;
        }

        if (!hasValidWorkspace()) {
            return;
        }

        const selectedImage = attachments.find(
            (file) => file.type?.startsWith("image/")
        );

        try {
            setLoading(true);

            if (onConversationCreated) {
                onConversationCreated(sessionId);
            }

            // Show user's prompt immediately in chat
            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    answer: userQuestion,
                },
            ]);

            setQuestion("");

            const formData = new FormData();

            formData.append(
                "session_id",
                sessionId
            );

            formData.append(
                "workspace_id",
                String(workspaceId)
            );

            formData.append(
                "prompt",
                userQuestion
            );

            // If an image is attached,
            // this becomes an edit request.
            if (selectedImage) {
                formData.append(
                    "image",
                    selectedImage
                );
            }

            const response = await api.post(
                "/chat/image",
                formData
            );

            const result = response.data;

            setMessages((prev) => [
                ...prev,
                {
                    id: result.message_id,
                    role: "assistant",
                    answer: result.answer,
                    citations: [],
                    message_type: result.message_type,
                    image_url: result.image_url,
                    image_prompt: result.image_prompt,
                    image_model: result.image_model,
                },
            ]);

            // Remove attachments after successful image request
            setAttachments([]);
            setImageMode(false);

        } catch (error) {

            console.error(
                "Image generation/editing failed:",
                error
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    answer:
                        error?.response?.data?.detail ||
                        "Sorry, I couldn't generate the image.",
                    citations: [],
                },
            ]);

        } finally {
            setLoading(false);
        }
    };



    const hasValidWorkspace = () => {
        if (!workspaceId) {
            console.error(
                "Cannot send request: workspace ID is missing."
            );
            return false;
        }

        return true;
    };


    // ==========================================================
    // SEND QUESTION
    // ==========================================================

    const sendQuestion = async () => {

        if (
            loading ||
            !question.trim()
        ) {
            return;
        }

        if (!hasValidWorkspace()) {
            return;
        }


        // ==================================================
        // SAVE QUESTION
        // ==================================================

        const userQuestion =
            question.trim();


        // ==================================================
        // SAVE SELECTED ATTACHMENTS
        //
        // IMPORTANT:
        // Copy the current attachment state before async work.
        // ==================================================

        const selectedAttachments =
            Array.isArray(attachments)
                ? [...attachments]
                : [];


        // ==================================================
        // CREATE CONVERSATION TITLE
        // ==================================================

        if (
            onConversationCreated
        ) {

            onConversationCreated(
                sessionId,

                userQuestion.length > 45
                    ? userQuestion.substring(
                        0,
                        45
                    ) + "..."
                    : userQuestion
            );

        }


        // ==================================================
        // SHOW USER MESSAGE IMMEDIATELY
        // ==================================================

        const userMessageId =
            createClientMessageId();

        setMessages(
            (previous) => [

                ...previous,

                {
                    id: userMessageId,

                    role: "user",

                    answer:
                        userQuestion,

                    citations: [],
                },

            ]
        );


        // ==================================================
        // CLEAR QUESTION
        // ==================================================

        setQuestion("");


        // ==================================================
        // START LOADING
        // ==================================================

        setLoading(true);


        try {

            // ==================================================
            // STEP 1 — UPLOAD ATTACHMENTS
            //
            // IMPORTANT FIX:
            //
            // BEFORE:
            // uploadAttachments()
            //
            // NOW:
            // uploadAttachments(selectedAttachments)
            // ==================================================

            let uploadedDocuments = [];


            if (
                selectedAttachments.length > 0
            ) {

                uploadedDocuments =
                    await uploadAttachments(
                        selectedAttachments
                    );

            }


            // ==================================================
            // STEP 2 — EXTRACT DOCUMENT IDS
            // ==================================================

            const attachmentDocumentIds =
                uploadedDocuments
                    .map(
                        (document) => {

                            // Normal response:
                            // { id: 123 }

                            if (
                                document?.id !==
                                undefined &&
                                document?.id !==
                                null
                            ) {

                                return document.id;

                            }


                            // Defensive support if backend
                            // returns nested document object.

                            if (
                                document?.document?.id !==
                                undefined &&
                                document?.document?.id !==
                                null
                            ) {

                                return document.document.id;

                            }


                            if (
                                document?.data?.id !==
                                undefined &&
                                document?.data?.id !==
                                null
                            ) {

                                return document.data.id;

                            }


                            return null;

                        }
                    )
                    .filter(
                        (id) =>
                            id !== null &&
                            id !== undefined
                    );


            console.log(
                "ATTACHMENT DOCUMENT IDS:",
                attachmentDocumentIds
            );


            // ==================================================
            // STEP 3 — RAG QUESTION
            // ==================================================

            const response =
                await api.post(
                    "/chat/rag",
                    {
                        session_id:
                            sessionId,

                        workspace_id:
                            workspaceId,

                        question:
                            userQuestion,

                        model:
                            selectedModel,

                        has_attachments:
                            attachmentDocumentIds.length >
                            0,

                        attachment_document_ids:
                            attachmentDocumentIds,
                    }
                );


            // ==================================================
            // STEP 4 — RESPONSE
            // ==================================================

            const result =
                response.data?.data;


            console.log(
                "RAG RESPONSE:",
                result
            );


            // ==================================================
            // STEP 5 — ASSISTANT MESSAGE
            // ==================================================

            setMessages(
                (previous) => [

                    ...previous,

                    {
                        id: createClientMessageId(),

                        role:
                            "assistant",

                        answer:
                            result?.answer ||
                            "No response received.",

                        citations:
                            Array.isArray(
                                result?.citations
                            )
                                ? result.citations
                                : [],

                    },

                ]
            );


            // ==================================================
            // STEP 6 — CLEAR ATTACHMENTS
            // ==================================================

            setAttachments([]);

        } catch (error) {

            console.error(
                "Chat request failed:",
                error
            );


            let errorMessage =
                "❌ Unable to process your request.";


            if (
                error?.response?.data?.detail
            ) {

                errorMessage =
                    `❌ ${error.response.data.detail}`;

            }


            setMessages(
                (previous) => [

                    ...previous,

                    {
                        role:
                            "assistant",

                        answer:
                            errorMessage,

                        citations: [],

                    },

                ]
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // ENTER / SHIFT + ENTER
    // ==========================================================

    const handleTextareaKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();


            if (
                !loading &&
                question.trim()
            ) {

                if (imageMode) {
                    sendImage();
                } else {
                    sendQuestion();
                }

            }

        }

    };


    // ==========================================================
    // AUTO SCROLL
    // ==========================================================

    useEffect(() => {

        bottomRef.current?.scrollIntoView(
            {
                behavior: "smooth",
            }
        );

    }, [messages]);


    // ==========================================================
    // SCROLL TO SEARCH TARGET
    // ==========================================================

    useEffect(() => {

        if (!targetMessageId) {
            return;
        }


        const targetElement =
            messageRefs.current[
                targetMessageId
            ];


        if (!targetElement) {
            return;
        }


        setTimeout(() => {

            targetElement.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "center",
                }
            );

        }, 150);

    }, [
        targetMessageId,
        messages,
    ]);


    // ==========================================================
    // MEMOIZED MESSAGE LIST
    // ==========================================================

    const renderedMessages = useMemo(
        () =>
            messages.map(
                (message, index) => (
                    <ChatMessage
                        key={
                            message.id ||
                            `local-${index}`
                        }
                        message={message}
                        targetMessageId={targetMessageId}
                        openMenuMessageId={openMessageMenuId}
                        onToggleMenu={toggleMessageMenu}
                        onCopy={handleCopyMessage}
                        onEdit={handleEditMessage}
                        onShare={handleShareMessage}
                        copiedMessageId={copiedMessageId}
                        messageRef={(element) => {
                            if (message.id && element) {
                                messageRefs.current[message.id] = element;
                            }
                        }}
                    />
                )
            ),
        [
            messages,
            targetMessageId,
            openMessageMenuId,
            copiedMessageId,
        ]
    );


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <div className="chat-window">

            {/* ==================================================
                MESSAGE AREA
            ================================================== */}

            <div className="chat-messages">

                <div className="chat-content">

                    {renderedMessages}


                    {/* ==========================================
                        TYPING INDICATOR
                    ========================================== */}

                    {loading && (

                        <div className="assistant-message">

                            <div className="avatar">
                                AI
                            </div>

                            <div className="typing-card">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                        </div>

                    )}


                    <div
                        ref={bottomRef}
                        className="chat-bottom-spacer"
                    />

                </div>

            </div>


            {/* ==================================================
                COMPOSER
            ================================================== */}

            <div className="chat-composer-wrapper">

                <div className="chat-composer">
                      
                    {imageMode && (
                        <div className="image-mode-indicator">
                            <span>🎨 Image mode</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setImageMode(false);
                                    setAttachments([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {/* ==================================================
                        ATTACHMENT PREVIEW
                    ================================================== */}

                    {attachments.length > 0 && (

                        <div className="attachment-preview-container">

                            {attachments.map(
                                (
                                    file,
                                    index
                                ) => (

                                    <AttachmentCard
                                        key={
                                            `${file.name}-${file.size}-${file.lastModified}`
                                        }
                                        file={
                                            file
                                        }
                                        index={
                                            index
                                        }
                                        onRemove={
                                            removeAttachment
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}


                    {/* ==================================================
                        TEXTAREA
                    ================================================== */}

                    <textarea
                        ref={textareaRef}
                        value={
                            question
                        }
                        onChange={(
                            event
                        ) =>
                            setQuestion(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleTextareaKeyDown
                        }
                        placeholder="Ask anything..."
                        disabled={
                            loading
                        }
                    />


                    {/* ==================================================
                        COMPOSER FOOTER
                    ================================================== */}

                    <div className="composer-footer">

                        {/* ==================================================
                            ATTACHMENT BUTTON
                        ================================================== */}

                        <div
                            className="attachment-wrapper"
                            ref={
                                attachmentMenuRef
                            }
                        >

                            <button
                                type="button"
                                className="composer-icon-button"
                                onClick={() =>
                                    setAttachmentMenuOpen(
                                        (
                                            previous
                                        ) =>
                                            !previous
                                    )
                                }
                                disabled={
                                    loading
                                }
                                title="Add files"
                            >
                                +
                            </button>


                            {/* ==================================================
                                ATTACHMENT MENU
                            ================================================== */}

                            {attachmentMenuOpen && (

                                <div className="attachment-menu">

                                    {/* ==========================================
                                        DOCUMENT
                                    ========================================== */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            documentInputRef.current?.click()
                                        }
                                    >

                                        <span className="menu-icon">
                                            📄
                                        </span>

                                        <span>

                                            <strong>
                                                Add Document
                                            </strong>

                                            <small>
                                                PDF, DOCX, TXT
                                            </small>

                                        </span>

                                    </button>


                                    {/* ==========================================
                                        FILES
                                    ========================================== */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >

                                        <span className="menu-icon">
                                            📁
                                        </span>

                                        <span>

                                            <strong>
                                                Add Files
                                            </strong>

                                            <small>
                                                Supported documents
                                            </small>

                                        </span>

                                    </button>

                                    {/* Generate Image */}
                                    <button
                                        type="button"
                                        className="attachment-menu-item"
                                        onClick={() => {
                                            setImageMode(true);
                                            setAttachmentMenuOpen(false);
                                        }}
                                    >
                                        <span>🎨</span>

                                        <div>
                                            <strong>Generate Image</strong>
                                            <small>Create an image from your prompt</small>
                                        </div>
                                    </button>


                                    {/* ==========================================
                                        IMAGES
                                    ========================================== */}

                                    <button
                                        type="button"
                                        onClick={() =>{
                                            setImageMode(true);
                                            setAttachmentMenuOpen(false);
                                            imageInputRef.current?.click()
                                        }}
                                    >

                                        <span className="menu-icon">
                                            🖼️
                                        </span>

                                        <span>

                                            <strong>
                                                Add Images
                                            </strong>

                                            <small>
                                                Generate / Edit
                                            </small>

                                        </span>

                                    </button>
                                    

                                </div>

                            )}

                        </div>


                        {/* ==================================================
                            DOCUMENT INPUT
                        ================================================== */}

                        <input
                            ref={
                                documentInputRef
                            }
                            type="file"
                            hidden
                            multiple
                            accept="
                                .pdf,
                                .doc,
                                .docx,
                                .txt
                            "
                            onChange={
                                handleFilesSelected
                            }
                        />


                        {/* ==================================================
                            FILE INPUT
                        ================================================== */}

                        <input
                            ref={
                                fileInputRef
                            }
                            type="file"
                            hidden
                            multiple
                            accept="
                                .pdf,
                                .doc,
                                .docx,
                                .txt
                            "
                            onChange={
                                handleFilesSelected
                            }
                        />


                        {/* ==================================================
                            IMAGE INPUT
                        ================================================== */}

                        <input
                            ref={
                                imageInputRef
                            }
                            type="file"
                            hidden
                            multiple
                            accept="
                                image/png,
                                image/jpeg,
                                image/webp,
                                image/gif
                            "
                            onChange={
                                handleFilesSelected
                            }
                        />


                        {/* ==================================================
                            HINT
                        ================================================== */}

                        <div className="composer-hint">

                            Enter to send · Shift + Enter for new line

                        </div>


                        {/* ==================================================
                            SEND BUTTON
                        ================================================== */}

                        <button
                            type="button"
                            className="send-button"
                            onClick={
                                imageMode ? sendImage : sendQuestion
                            }
                            disabled={
                                loading ||
                                !question.trim()
                            }
                            title={
                                loading
                                    ? "Thinking..."
                                    : "Send message"
                            }
                        >

                            {loading ? (

                                <span className="send-loading">
                                    •••
                                </span>

                            ) : (

                                "↑"

                            )}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}