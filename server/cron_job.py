import app.mongo.mongo_grammar import users_collection
from app.mongo.mongo_users import find_user
import os
import sys
from datetime import datetime


# Need to create a new instance of the Flask class
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))


# Grammar daily reset
# If grammar_completed is False set streak to 0
# If grammar_completed is True set to False
def grammar_reset():
    try:
        # Get all users in the database
        users = list(users_collection.find({}))
        reset_count = 0
        error_count = 0

        # Run through all the users that exist in the DB
        for user in users:
        user_email = user.get('user', []).get('email')

        doc = find_user(user_email)

        # Parse users grammar_completed value in order to determine the next action
        grammar_completed = doc["grammar"]["grammar_completed"]

        # If grammar completed is false then streak will be reset to 0
        # If it's true then just grammar_completed will be changed to false
        if grammar_completed == False:
            update = {
                "$set": {
                    "grammar.streak": 0,
                    "grammar_correctly_answered": [],
                    "grammar_incorrectly_answered": []
                }
            }
            users_collection.update_one({"user.email": user_email}, update)
            reset_count += 1
            print(f"Reset streak to 0 for user: {user_email}")
        else:
            update = {
                "$set": {
                    "grammar.grammar_completed": False
                }
            }
            users_collection.update_one({"user.email": user_email}, update)
            reset_count += 1
            print(f"Set grammar completed to false for user: {user_email}")

        # Print how many users were updated
        print(f"Grammar reset complete. {reset_count} user's reset.")

    # Take care of any exceptions that may come up with working with the DB
    except Exception as e:
        print(f"Error in grammar_reset: {e}")
        return jsonify({"success": False, "message": f"Error reseting users: {str(e)}"}), 500


if __name__ == '__main__':
    run_grammar_reset()   