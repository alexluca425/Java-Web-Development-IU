from flask import Flask
from flask_cors import CORS

# Import all API endpoints
from mongo.mongo_users import mongo_user
from mongo.mongo_grammar import mongo_grammar
from voiceflow.voiceflow import voiceflow

# Need to create a new instance of the Flask class
app = Flask(__name__)

# Enable CORS with specific methods
CORS(app, methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])



# Register all the imported endpoints
app.register_blueprint(mongo_user, url_prefix="/mongo_user")
app.register_blueprint(mongo_grammar, url_prefix="/mongo_grammar")
app.register_blueprint(voiceflow, url_prefix="/voiceflow")


# Railway deployment configuration
# In order to run locally comment out the last three lines and uncomment the app.run line
if __name__ == '__main__':
    # app.run(debug=True)
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)