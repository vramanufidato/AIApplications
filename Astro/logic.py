import google.generativeai as genai
import os

class AstroLogic:
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.model = None
        self.chat_session = None
        self.system_instruction = (
            "You are AstroSage AI, a highly empathetic and knowledgeable Vedic Astrologer, "
            "inspired by the compassionate approach of HiAstro. Your goal is to provide "
            "clarity, comfort, and practical spiritual guidance to users.\n\n"
            "Rules of Engagement:\n"
            "1. ALWAYS GREET: Start with a warm, spiritual greeting like 'Namaste! I am your cosmic guide.' or 'Welcome to your celestial journey.'\n"
            "2. BIRTH DETAILS: If birth details (Date, Time, Place of birth) are NOT provided, politely "
            "explain that you need these to create a Kundli (Birth Chart) for an accurate reading. "
            "Continue to ask for them in an empathetic way until provided.\n"
            "3. HI-ASTRO TONE: Be supportive, avoid hard-to-understand Sanskrit jargon, and focus on practical "
            "remedies (Mantras, simple daily actions, charity) rather than fear-based predictions.\n"
            "4. RESPONSE STYLE: Use short, readable paragraphs. Use cosmic metaphors where appropriate.\n"
            "5. NO MEDICAL/LEGAL ADVICE: If asked for medical or legal help, gently guide them to professionals "
            "while providing spiritual support for their emotional state.\n\n"
            "Data Collection Protocol:\n"
            "- If any of (Date of birth, Time of birth, Place of birth) is missing, say: "
            "'To see your stars clearly, I need your birth journey: Date (DD-MM-YYYY), "
            "Time (HH:MM AM/PM), and Place (City/Country).'"
        )

    def configure_api(self, api_key, model_name="gemini-3.1-flash-lite-preview", available_models=None):
        self.api_key = api_key
        self.current_model_name = model_name
        self.available_models = available_models or [model_name]
        genai.configure(api_key=self.api_key)
        self._initialize_model(self.current_model_name)

    def _initialize_model(self, model_name, history=[]):
        self.model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=self.system_instruction
        )
        self.chat_session = self.model.start_chat(history=history)

    def get_response(self, user_input, on_model_fallback=None):
        if not self.chat_session:
            return "Please enter a valid API Key first."
        
        try:
            response = self.chat_session.send_message(user_input)
            return response.text
        except Exception as e:
            err_msg = str(e)
            # Detect 429 Quota Exceeded
            if "429" in err_msg or "quota" in err_msg.lower():
                # Attempt fallback
                return self._handle_fallback(user_input, on_model_fallback)
            return f"Cosmic error: {err_msg}"

    def _handle_fallback(self, user_input, on_model_fallback):
        # Find next model in the list
        try:
            current_idx = self.available_models.index(self.current_model_name)
            next_idx = current_idx + 1
            if next_idx < len(self.available_models):
                next_model = self.available_models[next_idx]
                self.current_model_name = next_model
                
                # Get current history to preserve context
                history = self.chat_session.history
                self._initialize_model(self.current_model_name, history=history)
                
                if on_model_fallback:
                    on_model_fallback(self.current_model_name)
                
                # Retry with new model
                return self.get_response(user_input, on_model_fallback=on_model_fallback)
            else:
                return "Celestial limit reached: All available models have exhausted their free-tier quota. Please wait a few moments."
        except Exception as fallback_err:
            return f"Cosmic error during fallback: {str(fallback_err)}"
