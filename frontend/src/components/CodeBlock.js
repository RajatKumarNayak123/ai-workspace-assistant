"use client";

import { useState } from "react";

export default function CodeBlock({ children, className }) {

  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, "");

  const language = className
    ? className.replace("language-", "")
    : "";

  const copyCode = async () => {

    await navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {

      setCopied(false);

    }, 2000);

  };

  return (

    <div className="code-container">

      <div className="code-header">

        <span>{language || "text"}</span>

        <button onClick={copyCode}>

          {copied ? "Copied ✓" : "Copy"}

        </button>

      </div>

      <pre>

        <code className={className}>

          {children}

        </code>

      </pre>

    </div>

  );

}