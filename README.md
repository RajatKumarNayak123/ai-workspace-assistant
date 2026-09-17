# AI Workspace Assistant

> A full-stack AI-powered workspace for intelligent conversations, document understanding, Retrieval-Augmented Generation (RAG), workspace-based data isolation, and AI-assisted productivity.

AI Workspace Assistant is a full-stack web application that combines conversational AI with document intelligence. Users can create workspaces, upload documents, ask questions about their files, maintain persistent conversations, search workspace content, and interact with AI through a modern web interface.

The application is designed with a separated frontend/backend architecture and supports authentication, workspace-level data isolation, document processing, vector search, hybrid retrieval, reranking, conversation persistence, notifications, password recovery, and AI-generated images.

---

## ✨ Key Features

### 🤖 AI Chat

* Conversational AI interface
* Gemini-powered responses
* Persistent conversation history
* Session-based conversations
* Markdown rendering
* Code block rendering and syntax highlighting
* Copy, edit, and share message actions
* Configurable AI model selection

### 📚 Document Intelligence & RAG

* Upload documents to a workspace
* Supports common document formats such as:

  * PDF
  * DOCX
  * TXT
* Automatic document parsing and text extraction
* Text chunking for retrieval
* Vector embeddings
* Semantic vector search
* BM25 keyword retrieval
* Reciprocal Rank Fusion (RRF)
* Cross-encoder reranking
* Context compression
* Query classification and rewriting
* Document-aware question answering
* Source citations in AI responses

### 🧠 Hybrid Retrieval Pipeline

The application combines multiple retrieval strategies instead of relying only on semantic similarity.

```text
User Question
      │
      ▼
Query Classification
      │
      ├──────────────► General Query
      │
      ▼
Query Rewriting
      │
      ▼
Vector Search ─────────┐
                       │
BM25 Search ───────────┤
                       ▼
                Reciprocal Rank
                    Fusion
                       │
                       ▼
              Cross-Encoder
                 Reranking
                       │
                       ▼
              Context Compression
                       │
                       ▼
                Gemini / LLM
                       │
                       ▼
              Answer + Citations
```

This pipeline helps the application retrieve relevant information from uploaded workspace documents before generating a response.

### 🏢 Multi-User Workspaces

* User authentication
* Workspace-based organization
* User-specific workspace access
* Workspace-specific documents
* User-specific conversations
* Per-user frontend session persistence
* Separation of data between authenticated users

### 🔐 Authentication & Security

* User registration
* Login authentication
* JWT-based authentication
* Password hashing
* Role-based authorization
* Protected API routes
* Password reset workflow
* OTP-based verification
* Security settings
* Connected-device/session management

### 🖼️ AI Image Features

* AI-assisted image generation
* Image editing workflow
* Image effects
* Image messages inside conversations
* Image-related conversation persistence

### 🔎 Global Search

* Search workspace documents from the application header
* Search document information without navigating away from the current workspace
* Document preview support
* Search result interaction from the top navigation

### 🔔 Notifications

* In-app notifications
* Notification preferences
* Email notification preferences
* Security alerts
* Account activity notifications
* Workspace activity notifications
* Document processing notifications
* Product/update preferences
* Quiet-hours / Do Not Disturb settings

### 📊 Retrieval Metrics

The application includes retrieval and RAG-related metrics to help inspect and evaluate the document retrieval pipeline.

Metrics-related functionality includes:

* Retrieval measurements
* RAG pipeline response tracking
* User/workspace-aware metric storage
* Retrieval pipeline analysis

---

## 🏗️ Architecture

The project follows a separated frontend/backend architecture.

```text
                    ┌──────────────────────┐
                    │      Next.js UI       │
                    │      React App        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        MySQL Database     RAG Pipeline      AI / LLM
             │                 │                 │
             │                 │                 ▼
             │                 │             Gemini
             │                 │
             │                 ├── Embeddings
             │                 ├── Vector Search
             │                 ├── BM25
             │                 ├── RRF
             │                 ├── Reranking
             │                 └── Context Compression
             │
             ▼
      Users / Workspaces /
      Documents / Chats /
      Notifications / Settings
```

---

## 🛠️ Technology Stack

### Frontend

* Next.js
* React
* JavaScript
* Axios
* React Markdown
* Remark GFM
* Rehype Highlight
* Lucide Icons
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Alembic
* JWT Authentication

### Database

* MySQL

### AI / Machine Learning

* Google Gemini
* LangChain-based LLM integration
* Text embeddings
* Vector search
* BM25 retrieval
* Reciprocal Rank Fusion
* Cross-encoder reranking
* Context compression

### Development Tools

* VS Code
* Postman
* Git
* GitHub

---

## 📁 Project Structure

```text
AI-Workspace-Assistant/
│
├── backend/
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── config/
│   │   ├── core/
│   │   ├── database/
│   │   ├── exceptions/
│   │   ├── memory/
│   │   ├── models/
│   │   ├── prompts/
│   │   ├── rag/
│   │   ├── repositories/
│   │   ├── retrieval/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── security/
│   │   ├── services/
│   │   ├── utils/
│   │   └── vectorstore/
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── public/
│   ├── scripts/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── package.json
│   └── package-lock.json
│
└── .gitignore
```

---

## 🔄 RAG Workflow

When a user asks a question related to an uploaded document, the application follows a retrieval pipeline.

### 1. Document Upload

The user uploads a document to a workspace.

```text
Document
   │
   ▼
Document Parser
   │
   ▼
Text Extraction
   │
   ▼
Text Chunking
   │
   ▼
Embeddings
   │
   ▼
Vector Store
```

### 2. User Question

```text
User Question
      │
      ▼
Query Classification
      │
      ▼
Query Rewriting
      │
      ▼
Hybrid Retrieval
```

### 3. Retrieval

The system combines:

* Semantic vector retrieval
* BM25 keyword retrieval
* Reciprocal Rank Fusion
* Cross-encoder reranking

### 4. Context Preparation

Relevant results are compressed and prepared as context.

### 5. AI Response

The retrieved context is provided to the selected LLM.

```text
Question + Retrieved Context
             │
             ▼
           LLM
             │
             ▼
     Generated Response
             │
             ▼
       Source Citations
```

---

## 🔐 Multi-User Data Isolation

The application is designed around authenticated users and workspace ownership.

The frontend maintains user-specific workspace and conversation state, while the backend uses authenticated user information to scope workspace-related operations.

Conceptually:

```text
User A
 ├── Workspace A
 │    ├── Documents
 │    └── Conversations
 │
 └── Workspace B
      ├── Documents
      └── Conversations


User B
 └── Workspace C
      ├── Documents
      └── Conversations
```

This prevents one authenticated user's workspace data from being treated as another user's data.

---

## 💬 Conversation Persistence

Conversation history is stored through the backend rather than depending only on browser state.

This allows conversations to remain available when the user:

* Logs out
* Logs back in
* Changes application sections
* Starts another session
* Returns to an existing conversation

Conversation-related data is associated with authenticated users and sessions.

---

## 🗄️ Database

MySQL is used as the primary relational database.

The backend uses SQLAlchemy for database interaction and Alembic for schema migrations.

Major application entities include:

* Users
* Workspaces
* Documents
* Conversations
* Conversation messages
* User sessions
* Workspace AI settings
* Workspace chat settings
* Workspace RAG settings
* Notifications
* Notification preferences
* Password reset requests
* Retrieval metrics

---

## ⚙️ Environment Variables

The application uses environment variables for configuration and secrets.

Create your own local environment file:

```text
backend/.env
```

Do **not** commit this file to GitHub.

Example configuration structure:

```env
DATABASE_URL=your_database_connection_string

SECRET_KEY=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

# Add other application-specific credentials
# required by your local configuration.
```

> Never publish real API keys, database passwords, JWT secrets, email credentials, or other private credentials in the repository.

---

## 🚀 Local Setup

### Prerequisites

Install:

* Python 3.x
* Node.js
* npm
* MySQL
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/RajatKumarNayak123/ai-workspace-assistant.git
```

```bash
cd ai-workspace-assistant
```

---

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create:

```text
backend/.env
```

and configure the required environment variables.

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://localhost:8000
```

---

### 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

## 🔌 Backend API

The FastAPI backend provides endpoints for application functionality including:

* Authentication
* User profile
* Workspaces
* Documents
* RAG chat
* Conversation history
* Notifications
* Notification preferences
* Password recovery
* Workspace AI settings
* Workspace chat settings
* Workspace RAG settings
* Retrieval metrics
* Image generation/editing workflows

FastAPI also provides interactive API documentation during local development.

```text
http://localhost:8000/docs
```

---

## 🧪 Testing & Development

The backend contains development and testing utilities for areas such as:

* Authentication
* Password handling
* JWT functionality
* Document parsing
* Text chunking
* Vector database functionality
* Gemini integration
* Database models

Before making production changes, test the affected backend and frontend workflows locally.

---

## 🎯 Engineering Highlights

This project was built to demonstrate practical full-stack engineering combined with modern AI application development.

### Full-Stack Development

* REST API architecture
* React/Next.js frontend
* FastAPI backend
* MySQL persistence
* SQLAlchemy ORM
* Database migrations

### AI Engineering

* LLM integration
* RAG architecture
* Embeddings
* Vector retrieval
* Hybrid retrieval
* Reranking
* Context compression
* Query classification
* Query rewriting

### Application Engineering

* Authentication
* Authorization
* Multi-user workspaces
* Persistent conversations
* File processing
* Notifications
* Settings management
* Error handling
* API integration
* Retrieval observability

---

## 📈 Future Improvements

Potential future improvements include:

* Production deployment
* Cloud object storage for uploaded files
* Background document processing
* Streaming AI responses
* Expanded model provider support
* More advanced RAG evaluation
* Automated testing and CI/CD
* Advanced workspace collaboration
* Improved observability and monitoring
* Production-grade vector database infrastructure

---

## 🖥️ Screenshots

Screenshots can be added here after the final UI polish.

Suggested screenshots:

1. Login / Registration
2. Main AI workspace
3. RAG document chat
4. Document upload
5. Conversation history
6. Global search
7. Workspace settings
8. AI image generation
9. Notifications
10. Retrieval metrics

Example:

```text
docs/
└── screenshots/
    ├── login.png
    ├── workspace.png
    ├── rag-chat.png
    ├── documents.png
    ├── search.png
    └── settings.png
```

---

## 👨‍💻 Project

**AI Workspace Assistant**

A portfolio project demonstrating full-stack development, AI integration, RAG architecture, authentication, persistent data management, and workspace-based application design.

### Repository

[GitHub Repository](https://github.com/RajatKumarNayak123/ai-workspace-assistant)

---

## 📄 License

This project is currently intended as a personal portfolio and learning project.
