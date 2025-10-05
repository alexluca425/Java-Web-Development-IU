from flask import Blueprint, jsonify, Response, request
from bson import json_util
from pymongo import ReturnDocument, MongoClient
from dotenv import load_dotenv
from datetime import datetime
import os

# Import all required variables and functions to construct the API calls for the users
from auth.auth import generate_OTP
from auth.auth import send_OTP_email


# Create flask Blueprint for MongoDB routes
mongo_user = Blueprint('mongo_user', __name__)

# Load environment variables
load_dotenv()

# Connections to all the MongoDB collections needed
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)

users_collection = client.web_app.users
pending_users_collection = client.web_app.pending_users

# Index to auto delete any unverified users
pending_users_collection.create_index("created_at", expireAfterSeconds=900)



#####################
# All Methods Below #
#####################


# Find a pending document by email
def find_pending_user(user_email):
    # Search MongoDB for a user with the email provided
    user = pending_users_collection.find_one({"user.email": user_email})
    if user:
        return user
    else:
        # If no user document exists with the email then return None
        return None

# Find a user document by email
def find_user(user_email):
    # Search MongoDB for a user with the email provided
    user = users_collection.find_one({"user.email": user_email})
    if user:
        return user
    else:
        # If no user document exists with the email then return None
        return None

# Create a new user document
def create_new_user(user_name, user_email, user_password, otp):
    user_document = {
        "user": {
            "name": user_name,
            "email": user_email,
            "password": user_password,
            "intro_completed": "FALSE",
            "OTP": otp,
            "verified": True
        },
        "grammar": {
            "intro_completed": "FALSE",
            "streak": 0,
            "incorrectly_answered": [],
            "correctly_answered": [],
            "days_completed": [],
            "grammar_completed": "FALSE"
        }
    }
    # Get the new user ID and return it as a success of the method
    new_user = users_collection.insert_one(user_document).inserted_id
    return f"Successfully created new user with ID {new_user}"
    
# Create a new pending user document that expires after a set amount of time if not verified
def create_pending_user(user_email, otp):
    doc1 = find_user(user_email)
    doc2 = find_pending_user(user_email)

    if doc1:
        return "Email already exists"

    elif doc2:
        return "Pending verification already exists"

    else:
        user_document = {
            "user": {
                "email": user_email,
                "OTP": otp
            },
            "created_at": datetime.utcnow() 
        }
        # Get the new user ID and return it as a success of the method
        pending_user = pending_users_collection.insert_one(user_document).inserted_id
        return f"User is pending verification with ID {pending_user}"

# Delete pending user doc
def delete_pending_user(user_email):
    pending_users_collection.delete_one({"user.email": user_email})

# Update any verified user fields
def update_user_fields(user_email: str, updates: dict):
    return users_collection.find_one_and_update(
        {"user.email": user_email},
        {"$set": updates},
        return_document=ReturnDocument.AFTER
)

# Update any pending user fields
def update_pending_user_fields(user_email: str, updates: dict):
    return pending_users_collection.find_one_and_update(
        {"user.email": user_email},
        {"$set": updates},
        return_document=ReturnDocument.AFTER
)

# Athenticate user when they log in
def authenticate(user_email, user_password):
    user = users_collection.find_one({
        "user.email": user_email,
        "user.password": user_password
    })

    if user:
        # If user with the user_email and user_password exists then return success
        return "Authentication successful!"
    else:
        # try to find user by the email provided
        user = users_collection.find_one({
            "user.email": user_email
        })

        if user:
            # If the email is found in the DB output incorrect password provided
            return "Incorrect password."
        else:
            # If email is not found in the DB output that email doesn't exist
            return "The email provided does not exist."



#######################
# API Endpoints Below #
#######################


# GET request to retrieve a users document from MongoDB
@mongo_user.route("/get_user_info", methods=["POST"])
def get_user_info():
    try:
        data = request.get_json()
        user_email = data["user_email"]    
        
        # Try to find a user that has been verified
        user = find_user(user_email)
        if user:
            # If the user's email exists, then return the entire JSON object
            return Response(json_util.dumps({
                                "status": "verified",
                                "user": user
                            }), mimetype="application/json"), 200
        else:
            # Look for the email in the pending state
            user = find_pending_user(user_email)
            if user:
                 # If the pending user's email exists, then return the entire JSON object
                return Response(json_util.dumps({
                                    "status": "pending",
                                    "user": user
                                }), mimetype="application/json"), 200
                                
            # If the user's email doesn't exist, return Not Found
            return jsonify({
                             "success": False, 
                            "message": "User not found"
                        }), 400

    except Exception as e:
        print(f"Error in get_user_info: {e}")
        return jsonify({
                        "success": False, 
                        "message": f"Error getting user: {str(e)}"
                    }), 500


# PATCH request to update user password, intro_completed, and  verification
@mongo_user.route("/updates", methods=["POST"])
def update_user():
    try:
        # Get the data from the request body
        data = request.get_json()
        user_email = data["user_email"]

        # If password and verified status are set in the request body then save them to the updates array
        updates = {}
        if "password" in data: 
            updates["user.password"] = data["password"]
        if "verified" in data: 
            updates["user.verified"] = data["verified"]
        if "intro_completed" in data: 
            updates["user.intro_completed"] = data["intro_completed"]

        # If no values are set then return "No data provided"
        if not updates:
            return jsonify({
                "success": False,
                "message": "No data provided for changes."
            }), 400
        
        # Push any changes to the user provided in user_email
        doc = update_user_fields(user_email, updates)

        # If verified user doesn't exist return user not found
        if not doc:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 400

        # If user does exist and changes have been pushed successfully then return the following
        return jsonify({
            "success": True,
            "message": "User updated successfully"
        }), 200

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in user updates: {e}")
        return jsonify({"success": False, "message": f"Error updating user: {str(e)}"}), 500


# API endpiont that generates pending state for user with OTP and sends email with OTP
@mongo_user.route("/signup", methods=["POST"])
def signup():
    try:
        # Get the user email from the json body
        data = request.get_json()
        user_email = data["user_email"]

        # Generate random OTP
        otp = generate_OTP()

        # Verify that email doesn't already exist
        user = find_user(user_email)
        if user:
            return jsonify({
                "success": False,
                "message": "Email already exists."
            }), 400
        user = find_pending_user(user_email)
        # If user already exists in the pending state, resend otp code
        if user:
            updates = {}
            updates["user.OTP"] = otp
            update_pending_user_fields(user_email, updates)
            send_OTP_email(user_email, otp)
            return jsonify({
                "success": True,
                "message": "Email already exists. Resending the OTP code for sign up."
            }), 200

        # If email didn't already exist, then create a new pending user and send an email with OTP code
        create_pending_user(user_email, otp)
        send_OTP_email(user_email, otp)

        return jsonify({
            "success": True,
            "message": "Sent OTP code to email."
        }), 200

    # Capture any exceptions
    except Exception as e:
        return jsonify({"success": False, "message": f"Error in signup: {str(e)}"}), 500 


# To verify OTP codes for both pending and verified users
@mongo_user.route("/verification", methods=["POST"])
def verification():
    try:
        # Get user data from the json body
        data = request.get_json()
        print("payload: ", data)
        user_email = data["user_email"]
        input_otp = data["input_otp"]

        # Find user by email
        user = find_user(user_email)

        # If user exists, then compare the OTP code saved in their json document to the one they provide to verify them
        # This will be used for password resets
        if user:
            generated_otp = user["user"]["OTP"]
            if generated_otp == input_otp:

                # Create a new OTP code and push it to the database so user can't use the same one again
                set_updates = {}
                new_OTP = generate_OTP()
                set_updates["user.OTP"] = new_OTP

                doc = users_collection.find_one_and_update(
                    {"user.email": user_email},
                    {"$set": set_updates,})

                return jsonify({
                "success": True,
                "message": "OTP codes from verified user match."
            }), 200
            # If OTPs don't match, then return the following
            else:
                return jsonify({
                "success": False,
                "message": "OTP codes from verified user don't match."
            }), 400

        # If user email wasn't found in the verified users doc, then check the pending users doc
        else:
            # Parse the additional data from the json body needed to create a new user
            user_name = data["user_name"]
            user_password = data["user_password"]

            pending_user = find_pending_user(user_email)
            generated_otp = pending_user["user"]["OTP"]

            # If email doesn't exist in pending users doc, then the email doesn't exist in the DB
            if not pending_user:
                return jsonify({
                    "success": False,
                    "message": "No email found, please restart the signup process."
                }), 400

            # Compare to see if the OTP code from the user doc matches the OTP code provided by the user
            # If they match then create a new verified user in the verified user doc and delete the doc from the pending user doc
            if generated_otp == input_otp:
                create_new_user(user_name, user_email, user_password, input_otp)
                delete_pending_user(user_email)

                # Create a new OTP code and push it to the database so user can't use the same one again
                set_updates = {}
                new_OTP = generate_OTP()
                set_updates["user.OTP"] = new_OTP

                doc = users_collection.find_one_and_update(
                    {"user.email": user_email},
                    {"$set": set_updates,})

                return jsonify({
                    "success": True,
                    "message": "Account created successfully. Please log in now."
                }), 200

            # If OTP codes provided by pending user don't match
            else:
                return jsonify({
                    "success": False,
                    "message": "OTP codes from pending user don't match."
                }), 400
        
    # Handle any exceptions
    except Exception as e:
        return jsonify({"success": False, "message": f"Error in verifying user: {str(e)}"}), 500


# Resend OTP code to both pending and verified users
@mongo_user.route("/resend_otp", methods=["PATCH"])
def resend_otp():
    try:
        data = request.get_json()
        user_email = data.get("user_email")

        updates = {}
        new_otp = generate_OTP()
        updates["user.OTP"] = new_otp

        verified_doc = update_user_fields(user_email, updates)

        if not verified_doc:
            pending_doc = update_pending_user_fields(user_email, updates)
            if not pending_doc:
                return jsonify({
                        "success": False,
                        "message": "Email doesn't exist, please sign up."
                    }), 400
        
        send_OTP_email(user_email, new_otp)

        return jsonify({
                    "success": True,
                    "message": "User OTP has been updated. Please watch for an email with the new OTP code."
                }), 200

    except Exception as e:
        print(f"Error resending OTP: {e}")
        return jsonify({"success": False, "message": f"Error resending OTP: {str(e)}"}), 500


# Verify that user provides valid email and password for login
@mongo_user.route("/authentication", methods=["POST"])
def authentication():
    try:
        data = request.get_json()
        input_email = data.get("user_email")
        input_password = data.get("user_password")

        user = find_user(input_email)

        if not user:
            return jsonify({
                "success": False,
                "message": "Email does not exist."
            }), 400

        actual_password = user["user"]["password"]

        if actual_password == input_password:
            return jsonify({
                "success": True,
                "message": "Successful login!"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Incorrect password provided."
            }), 400

    except Exception as e:
        print(f"Error authenticating user: {e}")
        return jsonify({"success": False, "message": f"Error authenticating user: {str(e)}"}), 500