from abc import ABC, abstractmethod


class BaseLLMService(ABC):

    @abstractmethod
    def generate(
        self,
        session_id: str,
        question: str,
        save_user_message: str | None = None,
    ):
        pass

    @abstractmethod
    def stream(
        self,
        session_id: str,
        question: str,
        save_user_message: str | None = None,
    ):
        pass