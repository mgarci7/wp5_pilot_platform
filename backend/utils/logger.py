import json
import csv
from datetime import datetime
from pathlib import Path
from typing import Any


class Logger:
    """Handles logging of all simulation events to JSON files."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        self.log_file = self.log_dir / f"{session_id}.json"
        
    def log_event(self, event_type: str, data: Any) -> None:
        """
        Log an event to the session's log file.
        
        Args:
            event_type: Type of event (e.g., 'session_start', 'message', 'llm_call', 'error')
            data: Event data (will be JSON serialized)
        """
        event = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "session_id": self.session_id,
            "data": data
        }
        
        # Append to log file (JSON Lines format - one JSON object per line)
        with open(self.log_file, "a") as f:
            f.write(json.dumps(event) + "\n")
    
    def log_session_start(self, experimental_config: dict, simulation_config: dict, treatment_group: str) -> None:
        """Log session initialization with config snapshots and assigned treatment group."""
        # session_id is included by the outer envelope in log_event; avoid duplication
        self.log_event("session_start", {
            "treatment_group": treatment_group,
            "experimental_config": experimental_config,
            "simulation_config": simulation_config
        })
    
    def log_session_end(self, reason: str = "completed") -> None:
        """Log session termination and generate an HTML report."""
        # session_id provided in the envelope by log_event, no need to repeat it here
        self.log_event("session_end", {
            "reason": reason
        })
        self._generate_html_report()
        self._generate_annotation_csv()

    def _generate_html_report(self) -> None:
        """Generate an HTML report alongside the JSON log."""
        try:
            from utils.log_viewer import generate_html
            html_path = self.log_file.with_suffix(".html")
            html_path.write_text(generate_html(self.log_file))
            print(f"HTML report written to {html_path}")
        except Exception as e:
            print(f"Warning: failed to generate HTML report: {e}")

    def _generate_annotation_csv(self) -> None:
        """Generate per-session CSV template for manual coding.

        One row per chat message, with empty coding columns for:
        - incivil: yes/no
        - stance: like-minded/not like-minded
        - human_like: yes/no
        """
        try:
            rows = []
            with open(self.log_file, "r") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        event = json.loads(line)
                    except Exception:
                        continue
                    if event.get("event_type") != "message":
                        continue
                    data = event.get("data") or {}
                    rows.append({
                        "session_id": self.session_id,
                        "timestamp": data.get("timestamp", ""),
                        "message_id": data.get("message_id", ""),
                        "sender": data.get("sender", ""),
                        "content": data.get("content", ""),
                        "incivil": "",
                        "stance": "",
                        "human_like": "",
                    })

            csv_path = self.log_file.with_name(f"{self.session_id}_coding.csv")
            fieldnames = [
                "session_id",
                "timestamp",
                "message_id",
                "sender",
                "content",
                "incivil",
                "stance",
                "human_like",
            ]

            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)

            print(f"Coding CSV written to {csv_path}")
        except Exception as e:
            print(f"Warning: failed to generate coding CSV: {e}")
    
    def log_message(self, message: dict) -> None:
        """Log a message (user or agent)."""
        self.log_event("message", message)
    
    def log_llm_call(self, agent_name: str, prompt: str, response: str, error: str = None) -> None:
        """Log an LLM API call."""
        self.log_event("llm_call", {
            "agent_name": agent_name,
            "prompt": prompt,
            "response": response,
            "error": error
        })
    
    def log_error(self, error_type: str, error_message: str, context: dict = None) -> None:
        """Log an error."""
        self.log_event("error", {
            "error_type": error_type,
            "error_message": error_message,
            "context": context or {}
        })
