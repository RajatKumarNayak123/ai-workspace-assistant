"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    LogIn,
    Mail,
    Lock,
    Loader2,
    UserPlus,
    Eye,
    EyeOff,
} from "lucide-react";

export default function LoginForm() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =========================================
    // LOGIN
    // =========================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {

            setError(
                "Please enter your email and password."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://127.0.0.1:8000/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
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


            // =====================================
            // SAVE AUTH DATA
            // =====================================

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


            console.log(
                "Login successful:",
                data.user
            );


            // =====================================
            // GO TO WORKSPACE
            // =====================================

            router.push("/");


        } catch (error) {

            console.error(
                "Login failed:",
                error
            );

            setError(
                error.message ||
                "Unable to sign in."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* ================================
                    HEADER
                ================================= */}

                <div className="login-header">

                    <div className="login-icon">

                        <LogIn size={24} />

                    </div>


                    <h1>
                        Welcome back
                    </h1>


                    <p>
                        Sign in to your AI Workspace Assistant
                    </p>

                </div>


                {/* ================================
                    FORM
                ================================= */}

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >


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

                        <div className="password-label-row">

                            <label>
                                Password
                            </label>

                            <button
                                type="button"
                                className="forgot-password-button"
                                onClick={() => router.push("/forgot-password")}
                            >
                                Forgot password?
                            </button>

                        </div>

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
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (previous) => !previous
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

                    {/* ERROR */}

                    {error && (

                        <div className="login-error">

                            {error}

                        </div>

                    )}


                    {/* LOGIN BUTTON */}

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

                                Signing in...
                            </>

                        ) : (

                            <>
                                <LogIn size={18} />

                                Sign in
                            </>

                        )}

                    </button>

                </form>


                {/* ================================
                    REGISTER
                ================================= */}

                <div className="register-link">

                    <span>
                        New user?
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            router.push("/register")
                        }
                    >

                        <UserPlus size={16} />

                        Create an account

                    </button>

                </div>


            </div>

        </div>

    );

}