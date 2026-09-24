"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";


export default function ForgotPasswordPage() {

    const router = useRouter();


    // =========================================
    // STEP
    // =========================================

    const [step, setStep] = useState(1);


    // =========================================
    // FORM DATA
    // =========================================

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [resetToken, setResetToken] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =========================================
    // UI STATE
    // =========================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    // =========================================
    // REQUEST OTP
    // =========================================

    const handleRequestOTP = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://52.66.236.4:8000/forgot-password/request",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Unable to send OTP."
                );

            }


            setMessage(
                data.message ||
                "OTP has been sent to your email."
            );


            setStep(2);


        } catch (error) {

            console.error(
                "OTP request failed:",
                error
            );

            setError(
                error.message ||
                "Unable to send OTP."
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // VERIFY OTP
    // =========================================

    const handleVerifyOTP = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        if (!otp.trim()) {

            setError(
                "Please enter the OTP."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://52.66.236.4:8000/forgot-password/verify-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        otp: otp.trim(),
                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Invalid OTP."
                );

            }


            // Backend may return token directly
            // or inside data.

            const token =
                data.reset_token ||
                data.data?.reset_token;


            if (!token) {

                throw new Error(
                    "OTP verified, but reset token was not received."
                );

            }


            setResetToken(token);

            setMessage(
                data.message ||
                "OTP verified successfully."
            );


            setStep(3);


        } catch (error) {

            console.error(
                "OTP verification failed:",
                error
            );

            setError(
                error.message ||
                "OTP verification failed."
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // RESEND OTP
    // =========================================

    const handleResendOTP = async () => {

        setError("");
        setMessage("");


        try {

            setLoading(true);


            const response = await fetch(
                "http://52.66.236.4:8000/forgot-password/resend-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Unable to resend OTP."
                );

            }


            setMessage(
                data.message ||
                "A new OTP has been sent."
            );


        } catch (error) {

            setError(
                error.message ||
                "Unable to resend OTP."
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // RESET PASSWORD
    // =========================================

    const handleResetPassword = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        if (!password || !confirmPassword) {

            setError(
                "Please enter both password fields."
            );

            return;
        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://52.66.236.4:8000/forgot-password/reset",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        reset_token: resetToken,
                        new_password: password,
                        confirm_password: confirmPassword,
                    }),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Password reset failed."
                );

            }


            setMessage(
                "Password reset successful. Redirecting to login..."
            );


            setTimeout(() => {

                router.push("/login");

            }, 1200);


        } catch (error) {

            console.error(
                "Password reset failed:",
                error
            );

            setError(
                error.message ||
                "Password reset failed."
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // BACK TO LOGIN
    // =========================================

    const backToLogin = () => {

        router.push("/login");

    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* BACK */}

                <button
                    type="button"
                    className="forgot-back-button"
                    onClick={backToLogin}
                >

                    <ArrowLeft size={16} />

                    Back to login

                </button>


                {/* HEADER */}

                <div className="login-header">

                    <div className="login-icon">

                        {step === 1 && (
                            <Mail size={24} />
                        )}

                        {step === 2 && (
                            <ShieldCheck size={24} />
                        )}

                        {step === 3 && (
                            <Lock size={24} />
                        )}

                    </div>


                    <h1>

                        {step === 1 &&
                            "Forgot password?"}

                        {step === 2 &&
                            "Verify OTP"}

                        {step === 3 &&
                            "Create new password"}

                    </h1>


                    <p>

                        {step === 1 &&
                            "Enter your email and we'll send you an OTP."}

                        {step === 2 &&
                            `Enter the OTP sent to ${email}.`}

                        {step === 3 &&
                            "Choose a new password for your account."}

                    </p>

                </div>


                {/* ============================
                    STEP 1
                ============================ */}

                {step === 1 && (

                    <form
                        className="login-form"
                        onSubmit={handleRequestOTP}
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


                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {message && (
                            <div className="login-success">
                                {message}
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
                                        size={18}
                                        className="login-spinner"
                                    />

                                    Sending OTP...
                                </>

                            ) : (

                                <>
                                    <Mail size={18} />

                                    Send OTP
                                </>

                            )}

                        </button>

                    </form>

                )}


                {/* ============================
                    STEP 2
                ============================ */}

                {step === 2 && (

                    <form
                        className="login-form"
                        onSubmit={handleVerifyOTP}
                    >

                        <div className="login-field">

                            <label>
                                One-Time Password
                            </label>


                            <div className="login-input-wrapper">

                                <ShieldCheck size={17} />

                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(event) =>
                                        setOtp(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter OTP"
                                    inputMode="numeric"
                                    maxLength={6}
                                />

                            </div>

                        </div>


                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {message && (
                            <div className="login-success">
                                {message}
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
                                        size={18}
                                        className="login-spinner"
                                    />

                                    Verifying...
                                </>

                            ) : (

                                <>
                                    <ShieldCheck size={18} />

                                    Verify OTP
                                </>

                            )}

                        </button>


                        <button
                            type="button"
                            className="resend-otp-button"
                            onClick={handleResendOTP}
                            disabled={loading}
                        >
                            Resend OTP
                        </button>

                    </form>

                )}


                {/* ============================
                    STEP 3
                ============================ */}

                {step === 3 && (

                    <form
                        className="login-form"
                        onSubmit={handleResetPassword}
                    >


                        {/* PASSWORD */}

                        <div className="login-field">

                            <label>
                                New password
                            </label>


                            <div className="login-input-wrapper">

                                <Lock size={17} />


                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                >

                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}

                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="login-field">

                            <label>
                                Confirm password
                            </label>


                            <div className="login-input-wrapper">

                                <Lock size={17} />


                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                >

                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}

                                </button>

                            </div>

                        </div>


                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {message && (
                            <div className="login-success">
                                {message}
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
                                        size={18}
                                        className="login-spinner"
                                    />

                                    Resetting password...
                                </>

                            ) : (

                                <>
                                    <Lock size={18} />

                                    Reset Password
                                </>

                            )}

                        </button>

                    </form>

                )}


            </div>

        </div>

    );

}