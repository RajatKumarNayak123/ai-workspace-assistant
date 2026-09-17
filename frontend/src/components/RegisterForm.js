"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    UserPlus,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowLeft,
} from "lucide-react";

export default function RegisterForm() {

    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =========================================
    // REGISTER
    // =========================================

    const handleRegister = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // -----------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------

        if (
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {

            setError(
                "Please fill in all fields."
            );

            return;
        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        if (password.length < 8) {

            setError(
                "Password must be at least 8 characters long."
            );

            return;
        }


        try {

            setLoading(true);


            // -----------------------------------------
            // REGISTER API
            // -----------------------------------------

            const response = await fetch(
                "http://127.0.0.1:8000/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        full_name: fullName.trim(),
                        email: email.trim(),
                        password: password,
                    }),
                }
            );


            const data = await response.json();


            // -----------------------------------------
            // FAILED
            // -----------------------------------------

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Registration failed."
                );

            }


            console.log(
                "Registration successful:",
                data
            );


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );


            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");


            // -----------------------------------------
            // GO TO LOGIN
            // -----------------------------------------

            setTimeout(() => {

                router.push("/login");

            }, 1200);


        } catch (error) {

            console.error(
                "Registration failed:",
                error
            );


            setError(
                error.message ||
                "Unable to create your account."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">

            <div className="login-card register-card">


                {/* =================================
                    BACK TO LOGIN
                ================================== */}

                <button
                    type="button"
                    className="forgot-back-button"
                    onClick={() =>
                        router.push("/login")
                    }
                >

                    <ArrowLeft size={16} />

                    Back to login

                </button>


                {/* =================================
                    HEADER
                ================================== */}

                <div className="login-header">

                    <div className="login-icon">

                        <UserPlus size={24} />

                    </div>


                    <h1>
                        Create an account
                    </h1>


                    <p>
                        Join your AI Workspace Assistant
                    </p>

                </div>


                {/* =================================
                    FORM
                ================================== */}

                <form
                    className="login-form"
                    onSubmit={handleRegister}
                >


                    {/* FULL NAME */}

                    <div className="login-field">

                        <label>
                            Full name
                        </label>


                        <div className="login-input-wrapper">

                            <User size={17} />

                            <input
                                type="text"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />

                        </div>

                    </div>


                    {/* EMAIL */}

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


                    {/* PASSWORD */}

                    <div className="login-field">

                        <label>
                            Password
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
                                placeholder="Create a password"
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
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
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
                                placeholder="Confirm your password"
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
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
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


                    {/* ERROR */}

                    {error && (

                        <div className="login-error">

                            {error}

                        </div>

                    )}


                    {/* SUCCESS */}

                    {success && (

                        <div className="login-success">

                            {success}

                        </div>

                    )}


                    {/* REGISTER BUTTON */}

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

                                Creating account...
                            </>

                        ) : (

                            <>
                                <UserPlus size={18} />

                                Create account
                            </>

                        )}

                    </button>

                </form>


                {/* =================================
                    LOGIN LINK
                ================================== */}

                <div className="register-link">

                    <span>
                        Already have an account?
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            router.push("/login")
                        }
                    >

                        Sign in

                    </button>

                </div>


            </div>

        </div>

    );

}