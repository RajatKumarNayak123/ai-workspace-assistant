"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    ShieldCheck,
    LockKeyhole,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    KeyRound,
    Mail,
    Smartphone,
    Monitor,
    RefreshCw,
    ChevronRight,
    Info,
    Loader2,
} from "lucide-react";

import api from "../../services/api";

import "./security.css";


export default function SecurityPage() {

    const router = useRouter();


    // =====================================================
    // PASSWORD FORM STATE
    // =====================================================

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    // =====================================================
    // PASSWORD VISIBILITY
    // =====================================================

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =====================================================
    // UI STATE
    // =====================================================

    const [loading, setLoading] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");


    // =====================================================
    // PASSWORD STRENGTH
    // =====================================================

    const getPasswordStrength = () => {

        if (!newPassword) {

            return {
                score: 0,
                label: "",
            };

        }


        let score = 0;


        if (newPassword.length >= 8) {
            score++;
        }

        if (/[A-Z]/.test(newPassword)) {
            score++;
        }

        if (/[a-z]/.test(newPassword)) {
            score++;
        }

        if (/[0-9]/.test(newPassword)) {
            score++;
        }

        if (/[^A-Za-z0-9]/.test(newPassword)) {
            score++;
        }


        if (score <= 2) {

            return {
                score,
                label: "Weak",
            };

        }


        if (score === 3) {

            return {
                score,
                label: "Fair",
            };

        }


        if (score === 4) {

            return {
                score,
                label: "Good",
            };

        }


        return {
            score,
            label: "Strong",
        };

    };


    const passwordStrength =
        getPasswordStrength();


    // =====================================================
    // PASSWORD REQUIREMENTS
    // =====================================================

    const passwordRequirements = {

        length:
            newPassword.length >= 8,

        uppercase:
            /[A-Z]/.test(newPassword),

        lowercase:
            /[a-z]/.test(newPassword),

        number:
            /[0-9]/.test(newPassword),

        special:
            /[^A-Za-z0-9]/.test(newPassword),

    };


    // =====================================================
    // CLEAR MESSAGES
    // =====================================================

    const clearMessages = () => {

        setSuccessMessage("");
        setErrorMessage("");

    };


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async (event) => {

        event.preventDefault();

        clearMessages();


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !currentPassword.trim() ||
            !newPassword.trim() ||
            !confirmPassword.trim()
        ) {

            setErrorMessage(
                "Please fill in all password fields."
            );

            return;

        }


        // -------------------------------------------------
        // PASSWORD LENGTH
        // -------------------------------------------------

        if (newPassword.length < 8) {

            setErrorMessage(
                "New password must contain at least 8 characters."
            );

            return;

        }


        // -------------------------------------------------
        // PASSWORD MATCH
        // -------------------------------------------------

        if (newPassword !== confirmPassword) {

            setErrorMessage(
                "New password and confirmation password do not match."
            );

            return;

        }


        // -------------------------------------------------
        // SAME PASSWORD
        // -------------------------------------------------

        if (currentPassword === newPassword) {

            setErrorMessage(
                "New password must be different from your current password."
            );

            return;

        }


        try {

            setLoading(true);


            // -------------------------------------------------
            // BACKEND REQUEST
            // -------------------------------------------------

            const response = await api.put(
                "/change-password",
                {
                    current_password:
                        currentPassword,

                    new_password:
                        newPassword,
                }
            );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setSuccessMessage(
                response.data?.message ||
                "Password changed successfully."
            );


            // -------------------------------------------------
            // CLEAR FORM
            // -------------------------------------------------

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");


        } catch (error) {

            console.error(
                "Password change failed:",
                error
            );


            // -------------------------------------------------
            // BACKEND ERROR
            // -------------------------------------------------

            const detail =
                error.response?.data?.detail;


            if (detail) {

                setErrorMessage(detail);

            } else {

                setErrorMessage(
                    "Unable to change your password. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // BACK
    // =====================================================

    const handleBack = () => {

        router.back();

    };


    // =====================================================
    // PASSWORD INPUT COMPONENT
    // =====================================================
    

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <main className="security-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="security-page-header">

                <button
                    type="button"
                    className="security-back-button"
                    onClick={handleBack}
                >

                    <ArrowLeft size={17} />

                    <span>
                        Back
                    </span>

                </button>


                <div className="security-header-content">

                    <div className="security-header-icon">

                        <ShieldCheck size={24} />

                    </div>


                    <div>

                        <h1>
                            Security Settings
                        </h1>

                        <p>
                            Protect your account and manage
                            your security preferences.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                SECURITY STATUS
            ================================================= */}

            <section className="security-status-card">

                <div className="security-status-icon">

                    <ShieldCheck size={25} />

                </div>


                <div className="security-status-content">

                    <div className="security-status-title">

                        <h2>
                            Your account is secure
                        </h2>

                        <span className="security-status-badge">

                            <span className="security-status-dot" />

                            Protected

                        </span>

                    </div>


                    <p>
                        Your account is protected with
                        authenticated access and encrypted
                        password storage.
                    </p>

                </div>

            </section>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="security-layout">


                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="security-main-column">


                    {/* =================================================
                        CHANGE PASSWORD
                    ================================================= */}

                    <section className="security-card">

                        <div className="security-card-heading">

                            <div className="security-card-heading-icon purple">

                                <KeyRound size={20} />

                            </div>


                            <div>

                                <h2>
                                    Change Password
                                </h2>

                                <p>
                                    Update your password to keep
                                    your account secure.
                                </p>

                            </div>

                        </div>


                        {/* =========================================
                            SUCCESS
                        ========================================= */}

                        {successMessage && (

                            <div className="security-message success">

                                <CheckCircle2 size={18} />

                                <span>
                                    {successMessage}
                                </span>

                            </div>

                        )}


                        {/* =========================================
                            ERROR
                        ========================================= */}

                        {errorMessage && (

                            <div className="security-message error">

                                <AlertCircle size={18} />

                                <span>
                                    {errorMessage}
                                </span>

                            </div>

                        )}


                        <form
                            className="security-password-form"
                            onSubmit={
                                handleChangePassword
                            }
                        >


                            {/* CURRENT PASSWORD */}

                            <PasswordInput
                                label="Current Password"
                                value={currentPassword}
                                onChange={
                                    setCurrentPassword
                                }
                                placeholder="Enter your current password"
                                visible={
                                    showCurrentPassword
                                }
                                setVisible={
                                    setShowCurrentPassword
                                }
                                autoComplete="current-password"
                            />


                            {/* NEW PASSWORD */}

                            <PasswordInput
                                label="New Password"
                                value={newPassword}
                                onChange={
                                    setNewPassword
                                }
                                placeholder="Enter your new password"
                                visible={
                                    showNewPassword
                                }
                                setVisible={
                                    setShowNewPassword
                                }
                                autoComplete="new-password"
                            />


                            {/* PASSWORD STRENGTH */}

                            {newPassword && (

                                <div className="password-strength">

                                    <div className="password-strength-header">

                                        <span>
                                            Password strength
                                        </span>

                                        <strong
                                            className={`strength-${passwordStrength.label.toLowerCase()}`}
                                        >
                                            {
                                                passwordStrength.label
                                            }
                                        </strong>

                                    </div>


                                    <div className="strength-bars">

                                        {[1, 2, 3, 4, 5].map(
                                            (bar) => (

                                                <span
                                                    key={bar}
                                                    className={
                                                        bar <=
                                                        passwordStrength.score
                                                            ? "filled"
                                                            : ""
                                                    }
                                                />

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* CONFIRM PASSWORD */}

                            <PasswordInput
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={
                                    setConfirmPassword
                                }
                                placeholder="Re-enter your new password"
                                visible={
                                    showConfirmPassword
                                }
                                setVisible={
                                    setShowConfirmPassword
                                }
                                autoComplete="new-password"
                            />


                            {/* PASSWORD REQUIREMENTS */}

                            <div className="password-requirements">

                                <div className="requirements-title">

                                    <Info size={16} />

                                    <span>
                                        Password requirements
                                    </span>

                                </div>


                                <div className="requirements-grid">

                                    <Requirement
                                        valid={
                                            passwordRequirements.length
                                        }
                                        text="At least 8 characters"
                                    />

                                    <Requirement
                                        valid={
                                            passwordRequirements.uppercase
                                        }
                                        text="One uppercase letter"
                                    />

                                    <Requirement
                                        valid={
                                            passwordRequirements.lowercase
                                        }
                                        text="One lowercase letter"
                                    />

                                    <Requirement
                                        valid={
                                            passwordRequirements.number
                                        }
                                        text="One number"
                                    />

                                    <Requirement
                                        valid={
                                            passwordRequirements.special
                                        }
                                        text="One special character"
                                    />

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="security-form-actions">

                                <button
                                    type="button"
                                    className="security-cancel-button"
                                    onClick={() => {

                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");

                                        clearMessages();

                                    }}
                                    disabled={loading}
                                >
                                    Clear
                                </button>


                                <button
                                    type="submit"
                                    className="security-save-button"
                                    disabled={loading}
                                >

                                    {loading ? (

                                        <>

                                            <Loader2
                                                size={17}
                                                className="security-spinner"
                                            />

                                            Updating...

                                        </>

                                    ) : (

                                        <>

                                            <LockKeyhole
                                                size={17}
                                            />

                                            Change Password

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </section>


                    {/* =================================================
                        PASSWORD RESET
                    ================================================= */}

                    <section className="security-card">

                        <div className="security-card-heading">

                            <div className="security-card-heading-icon blue">

                                <RefreshCw size={20} />

                            </div>


                            <div>

                                <h2>
                                    Password Recovery
                                </h2>

                                <p>
                                    Forgot your password? Use the
                                    account recovery process.
                                </p>

                            </div>

                        </div>


                        <div className="security-action-row">

                            <div className="security-action-row-icon">

                                <Mail size={19} />

                            </div>


                            <div className="security-action-row-content">

                                <strong>
                                    Forgot Password
                                </strong>

                                <span>
                                    Recover your account using
                                    your registered email address.
                                </span>

                            </div>


                            <button
                                type="button"
                                className="security-outline-button"
                                onClick={() =>
                                    router.push("/forgot-password")
                                }
                            >

                                Recover Account

                                <ChevronRight
                                    size={17}
                                />

                            </button>

                        </div>

                    </section>


                </div>


                {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

                <aside className="security-sidebar">


                    {/* =================================================
                        SECURITY CHECKLIST
                    ================================================= */}

                    <section className="security-side-card">

                        <div className="security-side-heading">

                            <ShieldCheck size={19} />

                            <h2>
                                Security Checklist
                            </h2>

                        </div>


                        <SecurityCheck
                            icon={<CheckCircle2 size={17} />}
                            title="Password protected"
                            text="Your password is securely hashed."
                            active
                        />


                        <SecurityCheck
                            icon={<Mail size={17} />}
                            title="Email account"
                            text="Your account email is verified."
                            active
                        />


                        <SecurityCheck
                            icon={<Smartphone size={17} />}
                            title="Two-factor authentication"
                            text="Additional protection can be added later."
                        />


                    </section>


                    {/* =================================================
                        ACTIVE SESSIONS
                    ================================================= */}

                    <section className="security-side-card">

                        <div className="security-side-heading">

                            <Monitor size={19} />

                            <h2>
                                Active Sessions
                            </h2>

                        </div>


                        <div className="session-card">

                            <div className="session-icon">

                                <Monitor size={19} />

                            </div>


                            <div className="session-content">

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


                            <span className="session-active-dot" />

                        </div>


                        <div className="session-note">

                            <Info size={15} />

                            <span>
                                Session management will be
                                available here when device
                                tracking is enabled.
                            </span>

                        </div>

                    </section>


                    {/* =================================================
                        SECURITY TIP
                    ================================================= */}

                    <section className="security-tip-card">

                        <div className="security-tip-icon">

                            <ShieldCheck size={22} />

                        </div>


                        <div>

                            <h3>
                                Security Tip
                            </h3>

                            <p>
                                Never share your password with
                                anyone. Use a unique password
                                that you don't use elsewhere.
                            </p>

                        </div>

                    </section>

                </aside>

            </div>

        </main>

    );

}


// =========================================================
// PASSWORD INPUT COMPONENT
// IMPORTANT: Keep this OUTSIDE SecurityPage
// =========================================================

function PasswordInput({
    label,
    value,
    onChange,
    placeholder,
    visible,
    setVisible,
    autoComplete,
}) {

    return (
        <div className="security-field">

            <label>
                {label}
            </label>

            <div className="security-input-wrapper">

                <LockKeyhole
                    size={18}
                    className="security-input-icon"
                />

                <input
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                />

                <button
                    type="button"
                    className="password-visibility-button"
                    onClick={() =>
                        setVisible((previous) => !previous)
                    }
                    aria-label={
                        visible
                            ? "Hide password"
                            : "Show password"
                    }
                >

                    {visible ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}

                </button>

            </div>

        </div>
    );
}



// =========================================================
// REQUIREMENT COMPONENT
// =========================================================


function Requirement({
    valid,
    text,
}) {

    return (

        <div
            className={
                valid
                    ? "requirement valid"
                    : "requirement"
            }
        >

            {valid ? (
                <CheckCircle2 size={15} />
            ) : (
                <span className="requirement-circle" />
            )}

            <span>
                {text}
            </span>

        </div>

    );

}


// =========================================================
// SECURITY CHECK COMPONENT
// =========================================================


function SecurityCheck({
    icon,
    title,
    text,
    active = false,
}) {

    return (

        <div
            className={
                active
                    ? "security-check active"
                    : "security-check"
            }
        >

            <div className="security-check-icon">

                {icon}

            </div>


            <div className="security-check-content">

                <strong>
                    {title}
                </strong>

                <span>
                    {text}
                </span>

            </div>

        </div>

    );

}