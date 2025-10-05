from flask import Blueprint, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import requests
import os
import json

# Load environment variables
load_dotenv()

# Create Blueprint and enable CORS on this scope
voiceflow = Blueprint('voiceflow', __name__)


# Endpoint to send messages to and recieve responses from voiceflow chatbot
@voiceflow.route('/interact', methods=['POST'])
def voiceflow_interact():
    # Parse runtime credentials at the start
    VOICEFLOW_API_KEY = os.environ.get("VOICEFLOW_API_KEY")
    VOICEFLOW_VERSION_ID = os.environ.get("VOICEFLOW_VERSION_ID") 
    if not VOICEFLOW_API_KEY or not VOICEFLOW_VERSION_ID:
        return jsonify({
            "success": False,
            "message": "VOICEFLOW_API_KEY or VOICEFLOW_VERSION_ID not configured"
        }), 500

    # Save all the data from request body
    data = request.get_json() or {}
    user_id = data.get("user_email")

    # If user has logged out and logs back in or the browser refreshes need to restart the flow in voiceflow
    request_type = "launch" if data.get("launch") else "text"
    if request_type == "text":
        message = data.get("message")
        # Require a user message to send the request
        if not message:
            return jsonify({
                "success": False, 
                "message": "message (text) is required"
                }), 400
        # Request format for a text input
        payload = {"request": {"type": "text", "payload": message}}
    else:
        payload = {"request": {"type": "launch"}}


    # Voiceflow endpoint for a specific version and user
    url = f"https://general-runtime.voiceflow.com/state/{VOICEFLOW_VERSION_ID}/user/{user_id}/interact"

    # Authorization header expects the runtime API key
    headers = {
        "Authorization": VOICEFLOW_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        # Send request to voiceflow
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        if resp.status_code >= 400:
            return jsonify({
                "success": False,
                "message": f"Voiceflow error {resp.status_code}",
                "detail": resp.text
            }), 400

        # Parse voiceflow traces and extract response(s) to the messages array
        traces = resp.json()
        messages = []
        for t in traces if isinstance(traces, list) else []:
            t_type = t.get("type")
            payload = t.get("payload") or {}

            if t_type in ("speak", "text"):
                msg = payload.get("message") or payload.get("text")
                if msg:
                    messages.append(msg)

        # Return messages array plus traces for debugging
        return jsonify({
            "success": True,
            "messages": messages,
            "raw": traces
        }), 200

    except requests.RequestException as e:
        # Network error reaching voiceflow
        return jsonify({"success": False, "message": f"Network error: {str(e)}"}), 500


# Endpoint to reset the vocieflow flow for user
@voiceflow.route('/reset', methods=["POST"])
def reset():
    # Parse runtime credentials at the start
    VOICEFLOW_API_KEY = os.environ.get("VOICEFLOW_API_KEY")
    VOICEFLOW_VERSION_ID = os.environ.get("VOICEFLOW_VERSION_ID") 
    if not VOICEFLOW_API_KEY or not VOICEFLOW_VERSION_ID:
        return jsonify({
            "success": False,
            "message": "VOICEFLOW_API_KEY or VOICEFLOW_VERSION_ID not configured"
        }), 500

    # Save all the data from request body
    data = request.get_json() or {}
    user_id = data.get("user_email")

    # Voiceflow endpoint for a specific version and user
    url = f"https://general-runtime.voiceflow.com/state/{VOICEFLOW_VERSION_ID}/user/{user_id}"

    # Authorization header expects the runtime API key
    headers = {
        "Authorization": VOICEFLOW_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        resp = requests.delete(url, headers=headers, timeout=15)
        if resp.status_code >= 400:
            return jsonify({
                "success": False,
                "message": f"Voiceflow error {resp.status_code}",
                "detail": resp.text
            }), 400

        # Voiceflow has been reset successfully
        return jsonify({
            "success": True
        }), 200
    
    except requests.RequestException as e:
        # Network error reaching voiceflow
        return jsonify({"success": False, "message": f"Network error: {str(e)}"}), 500
