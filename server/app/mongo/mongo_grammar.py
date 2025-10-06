from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os
import random


# Import all required variables and functions to construct the API calls for the users
from mongo.mongo_users import find_user
from mongo.mongo_users import users_collection


# Create flask Blueprint for MongoDB routes
mongo_grammar = Blueprint('mongo_grammar', __name__)

# Load environment variables
load_dotenv()

# Connections to the MongoDB database needed
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
grammar_database = client.grammar


#######################
# API Endpoints Below #
#######################


# Get a random grammar day that hasn't been completed yet
@mongo_grammar.route("/get_uncompleted_grammar_day", methods=["POST"])
def get_uncompleted_grammar_day():
    try:
        # Parse data from request body
        data = request.get_json()
        user_email = data["user_email"]

        # Find the user in the DB
        doc = find_user(user_email)

        # Find out how many grammar days user has left
        days_completed = doc["grammar"]["days_completed"]
        day_collections = [a for a in grammar_database.list_collection_names()]
        remaining = [a for a in day_collections if a not in days_completed]

        # If user has no grammar days left then reset the array and return the response
        if not remaining:
            # Reset the completed days array to be able to start working on grammar questions from the start
            users_collection.update_one(
                {"user.email": user_email},
                {"$set": {"grammar.days_completed": []}}
            )
            return jsonify({
                "success": False, 
                "message": "You completed all grammar days so in order to continue your streak your progress was reset. Your streak remains unaffected."
                }), 200

        # Select a random remaining grammar day and return it
        chosen = random.choice(remaining)

        if chosen:
            return jsonify({
                "success": True,
                "day": chosen, 
                "remaining_count": len(remaining)
                }), 200
       
    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in getting an uncompleted grammar day: {e}")
        return jsonify({"success": False, "message": f"Error getting uncompleted grammar day: {str(e)}"}), 500


# Get a random question from the grammar day collection that hasn't been answered correctly
@mongo_grammar.route("/get_random_question", methods=["POST"])
def get_random_question():
    try:
        # Parse data from request body 
        data = request.get_json()
        user_email = data["user_email"]
        chosen_day = data["chosen_day"]

        # Find the user in the DB
        doc = find_user(user_email)

        # Save all questions that haven't been answered to a list
        # Convert all ObjectIds to strings for valid comparison
        correctly_answered = set(str(x) for x in doc.get("grammar", {}).get("correctly_answered", []))
        grammar_questions = list(grammar_database[chosen_day].find())
        unanswered_questions = [a for a in grammar_questions if str(a["_id"]) not in correctly_answered]

        # If there are any unanswered questions chose a random one and return it
        if unanswered_questions:
            chosen_question = random.choice(unanswered_questions)
            # Need to convert ObjectIds to string first before returning
            chosen_question["_id"] = str(chosen_question["_id"])
            return jsonify({
                "success": True,
                "question": chosen_question 
                }), 200

        # There are no unanswered questions remaining
        else:
            print("All questions have been answered.")
            return jsonify({
                "success": True,
                "message": "All questions have been answered correctly for the given day."
                }), 200

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error getting grammar question: {e}")
        return jsonify({"success": False, "message": f"Error getting grammar question: {str(e)}"}), 500


# Update completed_intro, correctly_answered, incorrectly_answered, and days_completed
@mongo_grammar.route("/updates", methods=["POST"])
def updates():
    try:
        # Parse data from request body
        data = request.get_json()
        user_email = data.get("user_email")

        # Find user in the DB
        doc = find_user(user_email)

        # Create a list of all the IDs of the incorrctly answered questions
        incorrectly_answered = doc.get("grammar", {}).get("incorrectly_answered", [])
        print(f"Incorrectly answered: {incorrectly_answered}")

        # Save correctly answered to its own var
        correctly_answered = data.get("correctly_answered")
        print(f"Correctly answered: {correctly_answered}")

        # If there exists a correctly_answered question ID from data in the incorrectly_answered array, then remove it
        if correctly_answered is not None: 
            if data["correctly_answered"] in incorrectly_answered:
                users_collection.update_one(
                    {"user.email": user_email},
                    {"$pull": {"grammar.incorrectly_answered": data.get("correctly_answered")}}
                )
                print("hello")
            

        # If the value of intro_completed or layout_value exists in data then prepare to update the user's DB
        set_updates = {}
        if "intro_completed" in data: 
            set_updates["grammar.intro_completed"] = data.get("intro_completed")

        # If either days_completed, or corrcetly_completed, or incorrectly_completed exist in data then prepare to push the update(s) to each respective list
        push_updates = {}
        if "days_completed" in data: 
            push_updates["grammar.days_completed"] = data.get("days_completed")

        if "correctly_answered" in data: 
            push_updates["grammar.correctly_answered"] = data.get("correctly_answered")

        if "incorrectly_answered" in data: 
            push_updates["grammar.incorrectly_answered"] = data["incorrectly_answered"]      

        # If any either set_updates or push_updates have prepared changes then commit them
        if set_updates or push_updates:
            # Push any changes to the user provided in user_email
            users_collection.find_one_and_update(
                    {"user.email": user_email},
                    {
                        "$set": set_updates,
                        "$addToSet": push_updates
                    })

            # Return success
            return jsonify({
                "success": True,
                "message": "Updated user succesfully"
            }), 200
        
        # If set_updates or push_updates don't exist there are no updates to be made
        else:
            return jsonify({
                "success": False,
                "message": "No updates to be made."
            }), 200

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in grammar updates: {e}")
        return jsonify({"success": False, "message": f"Error updating user: {str(e)}"}), 500


# Grammar day complete, increment streak +1, remove all correctly_answered questions from array, set grammar_completed to True
@mongo_grammar.route("/grammar_success", methods=["POST"])
def grammar_success():
    try:
        # Parse data from request body
        data = request.get_json()
        user_email = data.get("user_email")

        # Find user in the DB
        doc = find_user(user_email)

        # Prepare success updates to the user's document
        update = {
            "$inc": {"grammar.streak": 1},
            "$set": {
                "grammar.grammar_completed": "TRUE",
                "grammar.correctly_answered": []
                }
        }
        
        # Push updates to the DB
        users_collection.update_one({"user.email": user_email}, update)

        # Return success if no errors
        return jsonify({
            "success": True,
            "message": "Streak incremented, correctly_answered array cleared, and grammar_completed set to true."
        }), 200

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in grammar_success: {e}")
        return jsonify({"success": False, "message": f"Error updating user: {str(e)}"}), 500


# Grammar daily reset
# If grammar_completed is False set streak to 0
# If grammar_completed is True set to False
@mongo_grammar.route("/grammar_reset", methods=["POST"])
def grammar_reset():
    try:
        # Get all users in the database
        users = list(users_collection.find({}))
        reset_count = 0

        # Run through all the users that exist in the DB
        for user in users:
            user_email = user.get('user', {}).get('email')

            doc = find_user(user_email)

            # Parse users grammar_completed value in order to determine the next action
            grammar_completed = doc["grammar"]["grammar_completed"]

            # If grammar completed is false then streak will be reset to 0
            # If it's true then just grammar_completed will be changed to false
            if grammar_completed == "FALSE":
                update = {
                    "$set": {
                        "grammar.streak": 0,
                        "grammar.correctly_answered": [],
                        "grammar.incorrectly_answered": []
                    }
                }
                users_collection.update_one({"user.email": user_email}, update)
                reset_count += 1
                print(f"Reset streak to 0 for user: {user_email}")
            else:
                update = {
                    "$set": {
                        "grammar.grammar_completed": "FALSE"
                    }
                }
                users_collection.update_one({"user.email": user_email}, update)
                reset_count += 1
                print(f"Set grammar completed to false for user: {user_email}")

        # Print how many users were updated
        print(f"Grammar reset complete. {reset_count} user's reset.")

        return jsonify ({
            "success": True,
            "message": f"{reset_count} users updated"
        }), 200

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in grammar_reset: {e}")
        return jsonify({"success": False, "message": f"Error reseting users: {str(e)}"}), 500