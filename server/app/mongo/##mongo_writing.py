from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import random

# Import all required variables and functions to construct the API calls for the users
from mongo.mongo_users import find_user
from mongo.mongo_users import users_collection

# Create flask Blueprint for MongoDB routes
mongo_writing = Blueprint('mongo_writing', __name__)

# Load environment variables
load_dotenv()

# Connections to the MongoDB database needed
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
writing_database = client.writing


#######################
# API Endpoints Below #
#######################


# Get the demo module
@mongo_writing.route("/get_demo_module", methods=["GET"])
def get_demo_module():
    try:
        # Get the demo module from the Mongo DB
        demo_module = writing_database.writing_demo_module.find_one({"title": "Demo Module"})

        # Need to convert ObjectIds to string first before returning
        demo_module["_id"] = str(demo_module["_id"])

        # If the demo module var is empty returning the following
        if not demo_module:
            return jsonify({
                "success": False,
                "message": "Error in retreiving demo module."
                }), 200


        # If the demo module exists return it in the response body
        return jsonify({
            "success": True,
            "module": demo_module, 
            }), 200

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in getting writing demo module: {e}")
        return jsonify({"success": False, "message": f"Error getting writing demo module: {str(e)}"}), 500


# Get a random uncompleted writing module and if all are completed reset the array
@mongo_writing.route("/get_uncompleted_module", methods=["POST"])
def get_uncompleted_module():
    try:
        # Parse data from request body
        data = request.get_json()
        user_email = data["user_email"]

        # Find the user in the DB
        doc = find_user(user_email)

        # Find out how many writing modules user has left
        # Need to convert all ObjectIds to strings in order to compare them
        completed_modules = set(str(x) for x in doc.get("writing", {}).get("modules_completed", []))
        modules = list(writing_database.writing_modules.find())
        uncompleted_modules = [a for a in modules if str(a["_id"]) not in completed_modules]

        # If user has no writing modules left then reset the array and return the response
        if not uncompleted_modules:
            # Reset the modules_completed array to be able to start working on writing modules from the start
            users_collection.update_one(
                {"user.email": user_email},
                {"$set": {"writing.modules_completed": []}}
            )
            return jsonify({
                "success": False, 
                "message": "You completed all writing modules so in order to continue your progress was reset."
                }), 200

        # Select a random remaining writing module and return it
        chosen = random.choice(uncompleted_modules)

        # Need to convert ObjectIds to string first before returning
        chosen["_id"] = str(chosen["_id"])

        if chosen:
            return jsonify({
                "success": True,
                "module": chosen, 
                }), 200
       
    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in getting an uncompleted writing module: {e}")
        return jsonify({"success": False, "message": f"Error getting uncompleted writing module: {str(e)}"}), 500


# Update intro_completed from False to True and add completed modules to modules_completed
@mongo_writing.route("/updates", methods=["PATCH"])
def updates():
    try:
        # Get the data from the request body
        data = request.get_json()
        user_email = data["user_email"]


        # If intro_completed is set in the request body then save to the set_updates array
        set_updates = {}
        if "intro_completed" in data: 
            set_updates["writing.intro_completed"] = data["intro_completed"]

        # If module_completed is set in the request body then save it to the push_updates array
        push_updates = {}
        if "modules_completed" in data:
            push_updates["writing.modules_completed"] = data["modules_completed"]

        # If no values are set then return "No data provided"
        if set_updates or push_updates:
            # Push any changes to the user provided in user_email
            doc = users_collection.find_one_and_update(
                    {"user.email": user_email},
                    {
                        "$set": set_updates,
                        "$addToSet": push_updates
                    })

            # If user doesn't exist return user not found
            if not doc:
                return jsonify({
                    "success": False,
                    "message": "User not found"
                }), 400
                    
            # If user does exist and changes have been pushed successfully then return the following
            return jsonify({
                "success": True,
                "message": "Updates have been pushed."
            }), 200

        else:
            return jsonify({
                "success": False,
                "message": "No data provided for changes."
            }), 400

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in updates: {e}")
        return jsonify({"success": False, "message": f"Error updating user writing: {str(e)}"}), 500