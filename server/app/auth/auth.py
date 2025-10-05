from dotenv import load_dotenv
import os
import random
import resend


# Load environment variables
load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Generate a random 6 digit number to use as the OTP number
def generate_OTP():
    return str(random.randint(100000, 999999))


# Send an email to the users email with the OTP code included
def send_OTP_email(user_email, otp_code):
    try:
        # The html code to generate the body of the email
        html = f"""
            <div>
                <h2>Email Verification</h2>
                <p>Hello! Your verification code is:</p>
                <div>{otp_code}</div>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
            """

        # Resend parameters for sending emails
        params: resend.Emails.SendParams = {
            "from": "OSSLT Prep <alex@trystudyagent.com>",
            "to": [user_email],
            "subject": "Email Verification Code",
            "html": html,
        }

        # Resend email sending function
        email = resend.Emails.send(params)

        # Print email queued  and return true if success
        print(f"Email has been queued {email}")
        return True
    
    except Exception as e:
        # Catch the errors that may appear and return false
        print(f"Error sending email: {e}")
        return False



# send_OTP_email("alex.luca425@gmail.com", 123123)