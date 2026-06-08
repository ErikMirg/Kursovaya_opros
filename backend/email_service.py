import smtplib
import time

from email.mime.text import MIMEText
from email.header import Header


EMAIL = "bobikrisha@gmail.com"
PASSWORD = "fpkhbmsluoeumcsq"


def send_email(
        to_email,
        subject,
        text
):

    print("EMAIL START")

    start = time.time()

    try:

        msg = MIMEText(
            text,
            "plain",
            "utf-8"
        )

        msg["Subject"] = Header(
            subject,
            "utf-8"
        )

        msg["From"] = EMAIL
        msg["To"] = to_email

        print("CONNECTING...")

        with smtplib.SMTP_SSL(
            "smtp.gmail.com",
            465,
            timeout=5
        ) as server:

            print("LOGIN...")

            server.login(
                EMAIL,
                PASSWORD
            )

            print("SENDING...")

            server.send_message(
                msg
            )

            print("SENT")

        print(
            f"EMAIL FINISHED IN "
            f"{round(time.time() - start, 2)} SEC"
        )

        return True

    except Exception as e:

        print(
            "EMAIL ERROR:",
            e
        )

        return False