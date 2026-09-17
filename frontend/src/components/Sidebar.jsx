"use client";

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { createPortal } from "react-dom";

import "./Sidebar.css";

import {
    Upload,
    MessageSquare,
    FolderOpen,
    History,
    BarChart3,
    Settings,
    Plus,
    MoreVertical,
    Pencil,
    Share2,
    Trash2,
} from "lucide-react";


const storedUser =
    typeof window !== "undefined"
        ? localStorage.getItem("current_user")
        : null;

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

const menuItems = [
    {
        id: "upload",
        icon: Upload,
        label: "Upload Documents",
    },
    {
        id: "chat",
        icon: MessageSquare,
        label: "AI Chat",
    },
    {
        id: "workspaces",
        icon: FolderOpen,
        label: "My Workspaces",
    },
    {
        id: "history",
        icon: History,
        label: "Conversation History",
    },
    {
        id: "metrics",
        icon: BarChart3,
        label: "Retrieval Metrics",
    },
    {
        id: "settings",
        icon: Settings,
        label: "Settings",
    },
];


export default function Sidebar({

    activeSection,

    setActiveSection,

    onNewChat,

    conversations = [],

    activeSessionId,

    onSelectConversation,

    onRenameConversation,

    onShareConversation,

    onDeleteConversation,

}) {

    // ==========================================================
    // OPEN MENU
    // ==========================================================

    const [openMenuSessionId, setOpenMenuSessionId] =
        useState(null);


    // ==========================================================
    // MENU POSITION
    // ==========================================================

    const [menuPosition, setMenuPosition] =
        useState(null);


    // ==========================================================
    // MENU BUTTON REFERENCE
    // ==========================================================

    const menuButtonRef = useRef(null);


    // ==========================================================
    // RECENT CHAT CONTAINER
    // ==========================================================

    const conversationListRef = useRef(null);


    // ==========================================================
    // MENU ELEMENT
    // ==========================================================

    const menuRef = useRef(null);


    // ==========================================================
    // OPEN MENU
    // ==========================================================

    const handleMenuToggle = (
        event,
        sessionId
    ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
            openMenuSessionId ===
            sessionId
        ) {

            setOpenMenuSessionId(null);

            setMenuPosition(null);

            return;

        }


        /*
         * Store the clicked button.
         */

        menuButtonRef.current =
            event.currentTarget;


        setOpenMenuSessionId(
            sessionId
        );

    };


    // ==========================================================
    // POSITION DROP-UP
    // ==========================================================

    const updateMenuPosition = () => {

        if (
            !openMenuSessionId ||
            !menuButtonRef.current ||
            !conversationListRef.current
        ) {

            return;

        }


        const buttonRect =
            menuButtonRef.current.getBoundingClientRect();


        const listRect =
            conversationListRef.current.getBoundingClientRect();


        /*
         * Approximate menu height.
         * Actual position is corrected after rendering.
         */

        const estimatedMenuHeight = 132;


        const menuWidth = 165;


        const gap = 7;


        /*
         * Normal position:
         *
         * menu ABOVE the three-dot button.
         */

        let top =
            buttonRect.top -
            estimatedMenuHeight -
            gap;


        /*
         * Keep the menu inside
         * Recent Chats' vertical area.
         *
         * It can overlap other recent chats,
         * but NEVER Settings / navigation.
         */

        const minimumTop =
            listRect.top + 4;


        if (top < minimumTop) {

            top = minimumTop;

        }


        /*
         * Horizontal position.
         */

        let left =
            buttonRect.right -
            menuWidth;


        /*
         * Keep menu inside sidebar viewport.
         */

        const sidebar =
            document.querySelector(".sidebar");


        if (sidebar) {

            const sidebarRect =
                sidebar.getBoundingClientRect();


            const minimumLeft =
                sidebarRect.left + 8;


            const maximumLeft =
                sidebarRect.right -
                menuWidth -
                8;


            left =
                Math.max(
                    minimumLeft,
                    Math.min(
                        left,
                        maximumLeft
                    )
                );

        }


        setMenuPosition({

            top,

            left,

        });

    };


    // ==========================================================
    // POSITION AFTER MENU RENDER
    // ==========================================================

    useLayoutEffect(() => {

        if (!openMenuSessionId) {

            return;

        }


        updateMenuPosition();


        requestAnimationFrame(() => {

            if (
                !menuRef.current ||
                !menuButtonRef.current
            ) {

                return;

            }


            const buttonRect =
                menuButtonRef.current.getBoundingClientRect();


            const menuRect =
                menuRef.current.getBoundingClientRect();


            const listRect =
                conversationListRef.current
                    ?.getBoundingClientRect();


            if (!listRect) {

                return;

            }


            let top =
                buttonRect.top -
                menuRect.height -
                7;


            /*
             * Never cross the top boundary
             * of Recent Chats.
             */

            top =
                Math.max(
                    top,
                    listRect.top + 4
                );


            let left =
                buttonRect.right -
                menuRect.width;


            const sidebar =
                document.querySelector(".sidebar");


            if (sidebar) {

                const sidebarRect =
                    sidebar.getBoundingClientRect();


                left =
                    Math.max(
                        sidebarRect.left + 8,
                        Math.min(
                            left,
                            sidebarRect.right -
                                menuRect.width -
                                8
                        )
                    );

            }


            setMenuPosition({

                top,

                left,

            });

        });

    }, [openMenuSessionId]);


    // ==========================================================
    // UPDATE POSITION ON SCROLL / RESIZE
    // ==========================================================

    useEffect(() => {

        if (!openMenuSessionId) {

            return;

        }


        const handlePositionUpdate = () => {

            updateMenuPosition();

        };


        window.addEventListener(
            "resize",
            handlePositionUpdate
        );


        window.addEventListener(
            "scroll",
            handlePositionUpdate,
            true
        );


        return () => {

            window.removeEventListener(
                "resize",
                handlePositionUpdate
            );


            window.removeEventListener(
                "scroll",
                handlePositionUpdate,
                true
            );

        };

    }, [openMenuSessionId]);


    // ==========================================================
    // CLOSE ON OUTSIDE CLICK
    // ==========================================================

    useEffect(() => {

        const handleOutsideClick = (
            event
        ) => {

            const clickedMenu =
                menuRef.current?.contains(
                    event.target
                );


            const clickedButton =
                menuButtonRef.current?.contains(
                    event.target
                );


            if (
                !clickedMenu &&
                !clickedButton
            ) {

                setOpenMenuSessionId(null);

                setMenuPosition(null);

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
    // ESCAPE KEY
    // ==========================================================

    useEffect(() => {

        const handleEscape = (event) => {

            if (
                event.key === "Escape"
            ) {

                setOpenMenuSessionId(null);

                setMenuPosition(null);

            }

        };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, []);


    // ==========================================================
    // CLOSE MENU WHEN CONVERSATION CHANGES
    // ==========================================================

    const handleConversationSelect = (
        sessionId
    ) => {

        setOpenMenuSessionId(null);

        setMenuPosition(null);

        onSelectConversation(
            sessionId
        );

    };


    // ==========================================================
    // RENAME
    // ==========================================================

    const handleRename = (
        event,
        conversation
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setOpenMenuSessionId(null);

        setMenuPosition(null);


        if (onRenameConversation) {

            onRenameConversation(
                conversation
            );

        }

    };


    // ==========================================================
    // SHARE
    // ==========================================================

    const handleShare = (
        event,
        conversation
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setOpenMenuSessionId(null);

        setMenuPosition(null);


        if (onShareConversation) {

            onShareConversation(
                conversation
            );

        }

    };


    // ==========================================================
    // DELETE
    // ==========================================================

    const handleDelete = (
        event,
        conversation
    ) => {

        event.preventDefault();

        event.stopPropagation();

        setOpenMenuSessionId(null);

        setMenuPosition(null);


        if (onDeleteConversation) {

            onDeleteConversation(
                conversation
            );

        }

    };


    // ==========================================================
    // DROP-UP MENU
    // ==========================================================

    const renderActionsMenu = (
        conversation
    ) => {

        if (
            openMenuSessionId !==
            conversation.sessionId
        ) {

            return null;

        }


        if (
            typeof document ===
            "undefined"
        ) {

            return null;

        }


        return createPortal(

            <div
                ref={menuRef}
                className="conversation-actions-menu"

                style={{
                    top:
                        menuPosition?.top ??
                        -9999,

                    left:
                        menuPosition?.left ??
                        -9999,
                }}
            >

                {/* RENAME */}

                <button
                    type="button"
                    onClick={(event) =>
                        handleRename(
                            event,
                            conversation
                        )
                    }
                >

                    <Pencil size={15} />

                    <span>
                        Rename
                    </span>

                </button>


                {/* SHARE */}

                <button
                    type="button"
                    onClick={(event) =>
                        handleShare(
                            event,
                            conversation
                        )
                    }
                >

                    <Share2 size={15} />

                    <span>
                        Share
                    </span>

                </button>


                {/* DELETE */}

                <button
                    type="button"
                    className="delete-action"

                    onClick={(event) =>
                        handleDelete(
                            event,
                            conversation
                        )
                    }
                >

                    <Trash2 size={15} />

                    <span>
                        Delete
                    </span>

                </button>

            </div>,

            document.body

        );

    };


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <aside className="sidebar">


            {/* ==================================================
                BRAND
            ================================================== */}

            <div className="sidebar-brand">

                <div className="brand-icon">
                    AI
                </div>

                <div>

                    <h2>
                        Workspace
                    </h2>

                    <p>
                        LLM Assistant
                    </p>

                </div>

            </div>


            {/* ==================================================
                NEW CHAT
            ================================================== */}

            <button
                type="button"
                className="new-chat-btn"
                onClick={onNewChat}
            >

                <Plus size={18} />

                <span>
                    New Chat
                </span>

            </button>


            {/* ==================================================
                MAIN NAVIGATION
            ================================================== */}

            <nav className="sidebar-nav">

                {menuItems.map((item) => {

                    const Icon =
                        item.icon;


                    return (

                        <button
                            key={item.id}
                            type="button"

                            className={
                                `nav-item ${
                                    activeSection ===
                                    item.id
                                        ? "active"
                                        : ""
                                }`
                            }

                            onClick={() =>
                                setActiveSection(
                                    item.id
                                )
                            }
                        >

                            <Icon size={18} />

                            <span>
                                {item.label}
                            </span>

                        </button>

                    );

                })}

            </nav>


            {/* ==================================================
                RECENT CHATS
            ================================================== */}

            <div
                ref={conversationListRef}
                className="conversation-list"
            >

                {conversations.length > 0 && (

                    <div className="conversation-list-title">
                        Recent Chats
                    </div>

                )}


                {conversations.map(
                    (conversation) => {

                        const isActive =
                            activeSessionId ===
                            conversation.sessionId;


                        const isMenuOpen =
                            openMenuSessionId ===
                            conversation.sessionId;


                        return (

                            <div
                                key={
                                    conversation.sessionId
                                }

                                className={
                                    `conversation-item-wrapper ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                {/* CHAT */}

                                <button
                                    type="button"

                                    className={
                                        `conversation-item ${
                                            isActive
                                                ? "active"
                                                : ""
                                        }`
                                    }

                                    onClick={() =>
                                        handleConversationSelect(
                                            conversation.sessionId
                                        )
                                    }
                                >

                                    <MessageSquare
                                        size={15}
                                    />

                                    <span
                                        className="conversation-title"
                                        title={
                                            conversation.title
                                        }
                                    >

                                        {
                                            conversation.title
                                                ?.length > 38
                                                ? `${conversation.title.substring(
                                                    0,
                                                    38
                                                )}...`
                                                : conversation.title
                                        }

                                    </span>

                                </button>


                                {/* THREE DOTS */}

                                <button
                                    ref={
                                        isMenuOpen
                                            ? menuButtonRef
                                            : null
                                    }

                                    type="button"

                                    className={
                                        `conversation-menu-button ${
                                            isMenuOpen
                                                ? "visible"
                                                : ""
                                        }`
                                    }

                                    onClick={(event) =>
                                        handleMenuToggle(
                                            event,
                                            conversation.sessionId
                                        )
                                    }

                                    aria-label="Chat options"

                                    aria-expanded={
                                        isMenuOpen
                                    }

                                    title="Chat options"
                                >

                                    <MoreVertical
                                        size={17}
                                    />

                                </button>

                            </div>

                        );

                    }
                )}

            </div>


            {/* ==================================================
                USER FOOTER
            ================================================== */}

            <div className="sidebar-footer">

                <div className="user-avatar">
                    {firstName.charAt(0).toUpperCase()}
                </div>

                <div>

                    <div className="user-name">
                        {firstName}
                    </div>

                    <div className="user-role">
                        AI Developer
                    </div>

                </div>

            </div>


            {/* ==================================================
                DROP-UP PORTAL
            ================================================== */}

            {openMenuSessionId && (

                renderActionsMenu(
                    conversations.find(
                        (conversation) =>
                            conversation.sessionId ===
                            openMenuSessionId
                    )
                )

            )}

        </aside>

    );

}