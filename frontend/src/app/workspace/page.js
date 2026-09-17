"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    LogIn,
    Mail,
    Lock,
    Loader2,
    ShieldCheck,
} from "lucide-react";

import "./login.css";

export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Invalid email or password."
                );
            }

            // =================================
            // SAVE AUTH DATA
            // =================================

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

            // =================================
            // GO TO WORKSPACE
            // =================================

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

        <main className="login-page">

            <div className="login-card">

                {/* HEADER */}

                <div className="login-brand">

                    <div className="login-brand-icon">
                        <LogIn size={24} />
                    </div>

                    <div>
                        <h1>
                            AI Workspace Assistant
                        </h1>

                        <p>
                            Your intelligent workspace
                        </p>
                    </div>

                </div>


                {/* TITLE */}

                <div className="login-title">

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Sign in to continue to your workspace.
                    </p>

                </div>


                {/* FORM */}

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >

                    {/* EMAIL */}

                    <div className="login-field">

                        <label>
                            Email address
                        </label>

                        <div className="login-input">

                            <Mail size={18} />

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                        </div>

                    </div>


                    {/* PASSWORD */}

                    <div className="login-field">

                        <div className="login-label-row">

                            <label>
                                Password
                            </label>

                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() =>
                                    router.push(
                                        "/forgot-password"
                                    )
                                }
                            >
                                Forgot password?
                            </button>

                        </div>


                        <div className="login-input">

                            <Lock size={18} />

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* SUBMIT */}

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


                {/* REGISTER */}

                <div className="register-link">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/register")
                        }
                    >
                        Create an account
                    </button>

                </div>


                {/* SECURITY */}

                <div className="login-security">

                    <ShieldCheck size={16} />

                    <span>
                        Secure authentication protects
                        your workspace.
                    </span>

                </div>

            </div>

        </main>

    );

}