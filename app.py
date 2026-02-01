from flask import Flask, jsonify, request, render_template
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ---------------- MONGODB CONNECTION ----------------
client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)

db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Webhook server with MongoDB is running!"

# ---------------- TEST DB ----------------
@app.route("/test-db")
def test_db():
    try:
        test_event = {
            "author": "TestUser",
            "action": "TEST",
            "from_branch": None,
            "to_branch": None,
            "timestamp": "2026-01-31"
        }
        result = collection.insert_one(test_event)
        return jsonify({
            "message": "Test data inserted successfully!",
            "inserted_id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- GITHUB WEBHOOK ----------------
@app.route("/webhook", methods=["POST"])
def github_webhook():
    try:
        payload = request.json
        event_type = request.headers.get("X-GitHub-Event")

        # ---------- PUSH EVENT ----------
        if event_type == "push":
            author = payload["pusher"]["name"]
            to_branch = payload["ref"].split("/")[-1]
            timestamp = payload["head_commit"]["timestamp"]

            event_data = {
                "author": author,
                "action": "PUSH",
                "from_branch": None,
                "to_branch": to_branch,
                "timestamp": timestamp
            }
            collection.insert_one(event_data)
            return jsonify({"status": "Push event stored"}), 200

        # ---------- PULL REQUEST & MERGE ----------
        if event_type == "pull_request":
            action = payload.get("action")

            author = payload["pull_request"]["user"]["login"]
            from_branch = payload["pull_request"]["head"]["ref"]
            to_branch = payload["pull_request"]["base"]["ref"]
            timestamp = payload["pull_request"]["updated_at"]

            # PR OPENED
            if action == "opened":
                event_data = {
                    "author": author,
                    "action": "PULL_REQUEST",
                    "from_branch": from_branch,
                    "to_branch": to_branch,
                    "timestamp": timestamp
                }
                collection.insert_one(event_data)
                return jsonify({"status": "Pull request stored"}), 200

            # PR MERGED (BONUS)
            if action == "closed" and payload["pull_request"]["merged"] is True:
                event_data = {
                    "author": author,
                    "action": "MERGE",
                    "from_branch": from_branch,
                    "to_branch": to_branch,
                    "timestamp": timestamp
                }
                collection.insert_one(event_data)
                return jsonify({"status": "Merge event stored"}), 200

        return jsonify({"message": "Event ignored"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- FETCH EVENTS FOR UI ----------------
@app.route("/events", methods=["GET"])
def get_events():
    events = collection.find().sort("timestamp", -1).limit(10)

    result = []
    for event in events:
        result.append({
            "author": event.get("author"),
            "action": event.get("action"),
            "from_branch": event.get("from_branch"),
            "to_branch": event.get("to_branch"),
            "timestamp": event.get("timestamp")
        })

    return jsonify(result)

# ---------------- UI PAGE ----------------
@app.route("/ui")
def ui():
    return render_template("index.html")

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
