from collections import defaultdict


# ==================================================
# USER + SESSION BASED CONVERSATION MEMORY
# ==================================================

memory_store = defaultdict(list)


def _conversation_key(
    user_id: int,
    session_id: str
):
    return f"user:{user_id}:session:{session_id}"


# ==================================================
# ADD MESSAGE
# ==================================================

def add_message(
    user_id: int,
    session_id: str,
    role: str,
    content: str
):

    key = _conversation_key(
        user_id,
        session_id
    )

    memory_store[key].append(
        {
            "role": role,
            "content": content
        }
    )


# ==================================================
# GET HISTORY
# ==================================================

def get_history(
    user_id: int,
    session_id: str
):

    key = _conversation_key(
        user_id,
        session_id
    )

    return memory_store.get(
        key,
        []
    )


# ==================================================
# CLEAR HISTORY
# ==================================================

def clear_history(
    user_id: int,
    session_id: str
):

    key = _conversation_key(
        user_id,
        session_id
    )

    memory_store.pop(
        key,
        None
    )