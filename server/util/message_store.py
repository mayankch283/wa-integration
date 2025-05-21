import json
from util.config import Settings
from supabase import create_client, Client


class MessageStore:
    def __init__(self, settings: Settings):
        self.supabase: Client = create_client(
            settings.supabase_url, settings.supabase_key
        )

    def add_message(self, message_data):
        try:
            timestamp = message_data.get("timestamp")
            if timestamp:
                timestamp = int(timestamp) if isinstance(timestamp, str) else timestamp
                from datetime import datetime

                formatted_timestamp = datetime.fromtimestamp(timestamp).isoformat()
            else:
                formatted_timestamp = datetime.utcnow().isoformat()

            structured_data = {
                "message_id": message_data.get("id"),
                "from_number": message_data.get("from"),
                "timestamp": formatted_timestamp,
                "message_type": message_data.get("type"),
                "message_content": json.dumps(message_data),
                "contact_info": json.dumps(message_data.get("contact_info", {})),
            }

            print(f"Inserting message with timestamp: {formatted_timestamp}")
            return self.supabase.table("messages").insert(structured_data).execute()

        except Exception as e:
            print(f"Error adding message: {e}")
            raise

    def get_all_messages(self):
        return self.supabase.table("messages").select("*").execute().data
