"use client";

import { useEffect, useRef, useState } from "react";
import "./ConversationHistory.css";

export default function ConversationHistory({ sessionId }) {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messagesContainerRef = useRef(null);


    // ==========================================
    // FETCH HISTORY
    // ==========================================

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const token = localStorage.getItem("access_token");

                console.log("TOKEN BEFORE HISTORY REQUEST:", token);

                const response = await fetch(
                    `http://127.0.0.1:8000/chat/history/${sessionId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log(
                    "HISTORY STATUS:",
                    response.status
                );

                const data = await response.json();

                console.log(
                    "HISTORY RESPONSE:",
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data.detail ||
                        "Failed to load conversation history"
                    );
                }

                setMessages(
                    data.messages || []
                );

            } catch (error) {

                console.error(
                    "Failed to load conversation history:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        if (sessionId) {
            fetchHistory();
        }

    }, [sessionId]);


    // ==========================================
    // CHECK SCROLL POSITION
    // ==========================================

    const handleScroll = () => {

        const container =
            messagesContainerRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        setShowScrollButton(
            distanceFromBottom > 150
        );

    };


    // ==========================================
    // SCROLL TO BOTTOM
    // ==========================================

    const scrollToBottom = () => {

        const container =
            messagesContainerRef.current;

        if (!container) {
            return;
        }

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
        });

    };


    // ==========================================
    // ARROW DOWN KEY
    // ==========================================

    useEffect(() => {

        const handleKeyDown = (event) => {

            if (event.key !== "ArrowDown") {
                return;
            }

            const container =
                messagesContainerRef.current;

            if (!container) {
                return;
            }

            event.preventDefault();

            container.scrollBy({
                top: 500,
                behavior: "smooth",
            });

        };


        window.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, []);


    // ==========================================
    // AUTO SCROLL AFTER HISTORY LOADS
    // ==========================================

    useEffect(() => {

        if (!messages.length) {
            return;
        }

        const container =
            messagesContainerRef.current;

        if (!container) {
            return;
        }

        setTimeout(() => {

            container.scrollTop =
                container.scrollHeight;

        }, 100);

    }, [messages]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="conversation-history-status">
                Loading conversation history...
            </div>
        );

    }


    // ==========================================
    // EMPTY
    // ==========================================

    if (messages.length === 0) {

        return (
            <div className="conversation-history-status">
                No conversation history yet.
            </div>
        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="conversation-history">

            <h2>
                Conversation History
            </h2>


            <div
                ref={messagesContainerRef}
                className="history-messages"
                onScroll={handleScroll}
            >

                {messages.map((message, index) => (

                    <div
                        key={index}
                        className={
                            message.role === "user"
                                ? "history-user-message"
                                : "history-assistant-message"
                        }
                    >

                        {message.role === "assistant" && (

                            <div className="history-avatar">
                                AI
                            </div>

                        )}


                        <div
                            className={
                                message.role === "user"
                                    ? "history-user-card"
                                    : "history-assistant-card"
                            }
                        >

                            <div className="history-role">

                                {message.role === "user"
                                    ? "You"
                                    : "AI Workspace Assistant"}

                            </div>


                            <div className="history-content">

                                {message.content}

                            </div>

                        </div>

                    </div>

                ))}

            </div>


            {/* =====================================
                SCROLL TO BOTTOM BUTTON
            ===================================== */}

            {showScrollButton && (

                <button
                    type="button"
                    className="history-scroll-bottom"
                    onClick={scrollToBottom}
                    aria-label="Scroll to latest message"
                    title="Go to latest message"
                >

                    ↓

                </button>

            )}

        </div>

    );

}