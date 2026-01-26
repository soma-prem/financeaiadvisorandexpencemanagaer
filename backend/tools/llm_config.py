import os
from langchain_google_genai import ChatGoogleGenerativeAI

# ⚠️ Best practice: move this to environment variable later
os.environ["GOOGLE_API_KEY"] = "AIzaSyCKKJzcmdRz9Mo9yKhwra8xxjNybarF41A"

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0
    )
