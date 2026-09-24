from enum import Enum


class QueryIntent(str, Enum):
    """
    Supported chat query intents.
    """

    GENERAL = "general"
    DOCUMENT = "document"
    MIXED = "mixed"


class QueryClassifier:
    """
    Lightweight deterministic query classifier.

    This classifier does NOT call Gemini or any other LLM.

    Purpose:
        Determine whether a question should use:
            - General LLM knowledge
            - Uploaded document context
            - Document context + general reasoning
    """

    # ======================================================
    # EXPLICIT DOCUMENT SIGNALS
    # ======================================================

    DOCUMENT_PHRASES = (

        # --------------------------------------------------
        # Resume / CV
        # --------------------------------------------------

        "my resume",
        "my cv",
        "uploaded resume",
        "uploaded cv",

        "mere resume",
        "meri resume",
        "mere cv",
        "meri cv",

        "resume mein",
        "resume me",
        "cv mein",
        "cv me",

        "resume ke according",
        "resume ke hisab se",
        "resume according",
        "according to my resume",

        "according to my cv",
        "cv ke according",
        "cv ke hisab se",

        # --------------------------------------------------
        # Documents
        # --------------------------------------------------

        "my document",
        "my documents",
        "uploaded document",
        "uploaded documents",

        "the document",
        "the documents",

        "in my document",
        "in my documents",
        "in the document",
        "in the documents",

        "according to my document",
        "according to the document",

        "from my document",
        "from the document",

        "mere document",
        "mere documents",
        "meri document",
        "meri documents",

        "mere uploaded document",
        "mere uploaded documents",

        "document mein",
        "document me",
        "documents mein",
        "documents me",

        "uploaded document mein",
        "uploaded document me",
        "uploaded documents mein",
        "uploaded documents me",

        "document ke according",
        "document ke hisab se",

        "documents ke according",
        "documents ke hisab se",

        # --------------------------------------------------
        # Uploaded files
        # --------------------------------------------------

        "uploaded file",
        "uploaded files",
        "my uploaded file",
        "my uploaded files",

        "meri uploaded file",
        "meri uploaded files",

        "mere uploaded file",
        "mere uploaded files",

        "in my uploaded",
        "from my uploaded",
        "according to my uploaded",

        # --------------------------------------------------
        # Resume / candidate specific references
        # --------------------------------------------------

        "candidate",
        "candidate's",
        "candidate’s",

        "candidate email",
        "candidate's email",
        "candidate’s email",

        "candidate phone",
        "candidate's phone",
        "candidate’s phone",

        "candidate number",
        "candidate's number",
        "candidate’s number",

        "candidate skills",
        "candidate's skills",
        "candidate’s skills",

        "candidate experience",
        "candidate's experience",
        "candidate’s experience",

        "candidate projects",
        "candidate's projects",
        "candidate’s projects",

        "candidate education",
        "candidate's education",
        "candidate’s education",

        "candidate qualification",
        "candidate's qualification",
        "candidate’s qualification",

        "candidate qualifications",
        "candidate's qualifications",
        "candidate’s qualifications",

        # --------------------------------------------------
        # Personal document information
        # --------------------------------------------------

        "my experience",
        "my skills",
        "my projects",
        "my project",
        "my education",
        "my qualification",
        "my qualifications",
        "my work experience",

        "mere experience",
        "mera experience",
        "meri skills",
        "mere skills",
        "mere projects",
        "mere project",
        "meri education",
        "meri qualification",
        "meri qualifications",

        # --------------------------------------------------
        # Information extraction
        # --------------------------------------------------

        "email id",
        "email address",
        "phone number",
        "mobile number",
        "contact number",

        "linkedin",
        "github",
        "leetcode",

        "technical skills",
        "professional summary",
        "work experience",

        "education details",
        "qualification details",

        "projects worked on",
        "projects worked",

        "technologies used",
        "technology used",
        "technologies were used",
        "technology was used",
        "technologies are used",
        "technology is used",
    )

    # ======================================================
    # GENERAL / DOMAIN SIGNALS
    # ======================================================

    GENERAL_DOMAIN_PHRASES = (

        # Programming concepts
        "what is",
        "what are",
        "how does",
        "how do",
        "difference between",
        "define",
        "explain",

        # Interview preparation
        "interview questions",
        "interview preparation",
        "prepare me",
        "prepare for interview",
        "mock interview",

        # Learning
        "teach me",
        "learn",
        "how can i learn",

        # Coding
        "write code",
        "write a program",
        "code example",
        "example of",

        # General recommendations
        "best way",
        "best practices",
        "best practice",
    )

    # ======================================================
    # MIXED / GENERAL REASONING SIGNALS
    # ======================================================

    MIXED_PHRASES = (

        "compare",
        "comparison",
        "compared with",
        "compared to",
        "compare with",
        "compare to",

        "against",

        "best practices",
        "best practice",

        "improve",
        "improvement",
        "improvements",

        "suggest improvements",
        "recommend improvements",

        "how can i improve",
        "how should i improve",
        "what should i improve",

        "is this good",
        "is this correct",

        "review my",
        "analyze my",
        "analyse my",

        "evaluate my",
        "assess my",

        "optimize my",
        "optimise my",

        # --------------------------------------------------
        # Interview preparation
        # --------------------------------------------------

        "prepare me",
        "prepare me for",
        "prepare me for interview",
        "prepare for interview",
        "prepare for the interview",

        "interview preparation",
        "interview prep",

        "prepare karo",
        "prepare karna",
        "prepare kar do",

        "interview ke liye prepare",
        "interview ke liye taiyar",
        "interview ke liye tayari",

        "mujhe prepare karo",
        "mujhe interview ke liye prepare karo",

        # --------------------------------------------------
        # Hindi / Hinglish
        # --------------------------------------------------

        "compare karo",
        "compare karna",
        "compare kar do",
        "tulana karo",

        "best practice se compare",
        "best practices se compare",

        "improve karo",
        "improve kaise",
        "kaise improve",

        "review karo",
        "analyze karo",
        "analyse karo",

        "check karo",
        "evaluate karo",
    )

    # ======================================================
    # CLASSIFY
    # ======================================================

    @classmethod
    def classify(
        cls,
        question: str,
    ) -> QueryIntent:
        """
        Classify a user question as:

            GENERAL
            DOCUMENT
            MIXED

        No external API or LLM call is performed.
        """

        if not question:
            return QueryIntent.GENERAL

        normalized = " ".join(
            question.strip().lower().split()
        )

        if not normalized:
            return QueryIntent.GENERAL

        # ==================================================
        # SIGNAL DETECTION
        # ==================================================

        has_document_signal = cls._contains_any(
            normalized,
            cls.DOCUMENT_PHRASES,
        )

        has_mixed_signal = cls._contains_any(
            normalized,
            cls.MIXED_PHRASES,
        )

        # ==================================================
        # MIXED
        # ==================================================
        #
        # Example:
        #
        # "Mere resume ke according mujhe Java interview
        #  ke liye prepare karo."
        #
        # "Mere authentication system ko Spring Security
        #  best practices se compare karo."
        #
        # Document context + external reasoning
        # ==================================================

        if (
            has_document_signal
            and has_mixed_signal
        ):
            return QueryIntent.MIXED

        # ==================================================
        # DOCUMENT
        # ==================================================

        if has_document_signal:
            return QueryIntent.DOCUMENT

        # ==================================================
        # GENERAL
        # ==================================================

        return QueryIntent.GENERAL

    # ======================================================
    # PHRASE MATCHING
    # ======================================================

    @staticmethod
    def _contains_any(
        text: str,
        phrases: tuple[str, ...],
    ) -> bool:

        return any(
            phrase in text
            for phrase in phrases
        )
