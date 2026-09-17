from abc import ABC, abstractmethod


class BaseLLMService(ABC):
    """
    Abstract Base Class for all LLM Providers.
    Every LLM implementation (Gemini, OpenRouter, Ollama...)
    must inherit from this class.
    """

    @abstractmethod
    def generate(
        self,
        session_id: str,
        prompt: str,
    ) -> str:
        """
        Generate response from an LLM.
        """
        pass