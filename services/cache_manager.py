from typing import Dict, Any, Optional
import time
import logging

class CacheManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(CacheManager, cls).__new__(cls)
            cls._instance._cache = {}
            cls._instance.expiration_time = None  # Sem tempo de expiração
            logging.info(f"[Cache] Inicializado com tempo de expiração de {cls._instance.expiration_time} segundos")
        return cls._instance

    def get(self, key: str) -> Optional[str]:
        if key in self._cache:
            cache_data = self._cache[key]
            current_time = time.time()
            age = current_time - cache_data['timestamp']
            
            if self.expiration_time is None or age < self.expiration_time:
                logging.info(f"[Cache] Item encontrado, idade: {age:.2f} segundos")
                return cache_data['value']
            else:
                logging.info(f"[Cache] Item expirado, idade: {age:.2f} segundos")
                del self._cache[key]
        return None

    def set(self, key: str, value: str):
        self._cache[key] = {
            'value': value,
            'timestamp': time.time()
        }
        logging.info(f"[Cache] Item armazenado com chave: {key}")

    def clear(self):
        self._cache.clear()
        logging.info("[Cache] Cache limpo")

    def remove_expired(self):
        if self.expiration_time is not None:
            current_time = time.time()
            expired_keys = [
                key for key, data in self._cache.items()
                if current_time - data['timestamp'] >= self.expiration_time
            ]
            for key in expired_keys:
                del self._cache[key]
            if expired_keys:
                logging.info(f"[Cache] {len(expired_keys)} itens expirados removidos")
