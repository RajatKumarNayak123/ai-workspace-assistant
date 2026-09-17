from .sync_service import GeminiSyncService
from .stream_service import GeminiStreamService


class GeminiFactory:

    @staticmethod
    def sync():

        return GeminiSyncService()

    @staticmethod
    def stream():

        return GeminiStreamService()