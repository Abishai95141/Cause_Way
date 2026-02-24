"""Configuration settings using pydantic-settings."""

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
    # Database
    database_url: str = "postgresql+asyncpg://causeway:causeway_dev@localhost:5432/causeway"
    db_pool_size: int = 5
    db_max_overflow: int = 10
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_ttl_seconds: int = 3600  # 1 hour default
    
    # MinIO / S3
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "causeway"
    minio_secret_key: str = "causeway_dev_key"
    minio_bucket: str = "causeway-docs"
    minio_secure: bool = False
    
    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    
    # Google AI (Gemini)
    google_ai_api_key: Optional[str] = None
    
    # PageIndex (optional)
    pageindex_api_key: Optional[str] = None
    pageindex_url: str = "https://chat.pageindex.ai/mcp"
    
    # Application
    debug: bool = True
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


class VerificationConfig(BaseSettings):
    """Configuration for the Agentic Verification Loop.

    Controls the Proposer-Retriever-Judge pipeline that grounds
    every causal edge in retrieved evidence before it enters the DAG.
    """

    model_config = SettingsConfigDict(
        env_prefix="CAUSEWAY_VERIFY_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Judge loop
    max_judge_iterations: int = Field(
        default=2,
        description=(
            "Maximum retrieve→judge cycles per edge before forced failure. "
            "Lowered from 3→2 to reduce worst-case verification latency "
            "(100 judge calls instead of 150 for ~50 edges)."
        ),
    )
    grounding_confidence_threshold: float = Field(
        default=0.4,
        ge=0.0,
        le=1.0,
        description=(
            "Minimum judge confidence to accept an edge as grounded. "
            "Lowered from 0.6→0.4 for initial builds — set "
            "CAUSEWAY_VERIFY_GROUNDING_CONFIDENCE_THRESHOLD=0.6 for strict mode."
        ),
    )
    enable_adversarial_pass: bool = Field(
        default=False,
        description=(
            "Run a devil's-advocate pass on strong edges. "
            "Disabled by default for initial builds to preserve more edges. "
            "Set CAUSEWAY_VERIFY_ENABLE_ADVERSARIAL_PASS=true for refinement runs."
        ),
    )

    # Model selection
    judge_model: str = Field(
        default="gemini-2.5-flash",
        description="LLM model for verification judge (Flash for speed; set to gemini-2.5-pro for strict mode)",
    )

    # Concurrency & rate-limiting
    llm_semaphore_limit: int = Field(
        default=12,
        ge=1,
        description="Max concurrent Gemini API calls (shared semaphore)",
    )
    max_retries: int = Field(
        default=5,
        ge=1,
        description="Max retry attempts per LLM call",
    )
    backoff_base: float = Field(
        default=2.0,
        description="Base for exponential backoff (seconds)",
    )
    backoff_jitter_max: float = Field(
        default=5.0,
        description="Maximum random jitter added to backoff (seconds)",
    )

    # Retrieval
    retrieval_top_k: int = Field(
        default=5,
        ge=1,
        description="Top-K evidence chunks to retrieve per direction",
    )


@lru_cache
def get_verification_config() -> VerificationConfig:
    """Get cached verification config instance."""
    return VerificationConfig()
