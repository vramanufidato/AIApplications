import customtkinter as ctk
from PIL import Image, ImageTk
import os
import threading
from styles import *
from logic import AstroLogic

class AstroSageApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window Settings
        self.title("AstroSage AI - Vedic Astrology")
        self.geometry("900x600")
        ctk.set_appearance_mode(THEME_MODE)
        self.configure(fg_color=BG_COLOR)

        # Logic Instance
        self.logic = AstroLogic()

        # Layout
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar (API & Settings)
        self.sidebar_frame = ctk.CTkFrame(self, width=240, fg_color=SIDEBAR_COLOR, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew", padx=(0,1))
        
        # Sidebar Content
        self.sidebar_title = ctk.CTkLabel(self.sidebar_frame, text="AstroSage AI", font=FONT_TITLE, text_color=GOLD_PRIMARY)
        self.sidebar_title.pack(pady=40, padx=20)

        # API Key Input
        self.api_label = ctk.CTkLabel(self.sidebar_frame, text="Gemini API Key", font=FONT_SUBTITLE, text_color=TEXT_GOLD)
        self.api_label.pack(pady=(20, 5), padx=20, anchor="w")
        
        self.api_entry = ctk.CTkEntry(self.sidebar_frame, placeholder_text="Enter API Key...", show="*", 
                                      fg_color=CHAT_BG_COLOR, border_color=BORDER_COLOR, text_color=TEXT_PRIMARY)
        self.api_entry.pack(pady=5, padx=20, fill="x")

        # Model Selection
        self.model_label = ctk.CTkLabel(self.sidebar_frame, text="Select Model", font=FONT_SUBTITLE, text_color=TEXT_GOLD)
        self.model_label.pack(pady=(15, 5), padx=20, anchor="w")
        
        self.model_choice = ctk.CTkOptionMenu(self.sidebar_frame, values=AVAILABLE_MODELS, 
                                             fg_color=CHAT_BG_COLOR, button_color=GOLD_PRIMARY, 
                                             button_hover_color=GOLD_MUTED, dropdown_fg_color=CHAT_BG_COLOR,
                                             text_color=TEXT_PRIMARY)
        self.model_choice.pack(pady=5, padx=20, fill="x")
        self.model_choice.set("gemini-3.1-flash-lite-preview") # Default
        
        self.save_btn = ctk.CTkButton(self.sidebar_frame, text="Connect to Stars", fg_color=GOLD_PRIMARY, 
                                      hover_color=GOLD_MUTED, text_color=BG_COLOR, font=FONT_SUBTITLE, 
                                      command=self._setup_api)
        self.save_btn.pack(pady=20, padx=20, fill="x")

        # Instructions / About
        self.about_text = ("Welcome to AstroSage AI.\n\n"
                           "To begin your spiritual reading, "
                           "please enter your Gemini API key. "
                           "Our guidance is rooted in Vedic "
                           "traditions and empathetic care.")
        self.about_label = ctk.CTkLabel(self.sidebar_frame, text=self.about_text, font=FONT_REGULAR, 
                                        text_color=TEXT_SECONDARY, wraplength=200, justify="left")
        self.about_label.pack(pady=40, padx=20, anchor="w")

        # Main Chat Area
        self.chat_frame = ctk.CTkFrame(self, fg_color=BG_COLOR, corner_radius=0)
        self.chat_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.chat_frame.grid_columnconfigure(0, weight=1)
        self.chat_frame.grid_rowconfigure(0, weight=1)

        # Chat Bubble Area (Scrollable Text)
        self.chat_display = ctk.CTkTextbox(self.chat_frame, fg_color=CHAT_BG_COLOR, text_color=TEXT_PRIMARY, 
                                           font=FONT_CHAT, border_color=BORDER_COLOR, border_width=1, state="disabled")
        self.chat_display.grid(row=0, column=0, sticky="nsew", pady=(0, 20))
        
        # User Input Bar
        self.input_frame = ctk.CTkFrame(self.chat_frame, fg_color=BG_COLOR)
        self.input_frame.grid(row=1, column=0, sticky="ew")
        self.input_frame.grid_columnconfigure(0, weight=1)

        self.user_entry = ctk.CTkEntry(self.input_frame, placeholder_text="Ask your cosmic guide...", 
                                       fg_color=CHAT_BG_COLOR, border_color=BORDER_COLOR, text_color=TEXT_PRIMARY, 
                                       height=50, font=FONT_REGULAR)
        self.user_entry.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        self.user_entry.bind("<Return>", lambda event: self._send_message())

        self.send_btn = ctk.CTkButton(self.input_frame, text="Ask", width=100, height=50, 
                                      fg_color=GOLD_PRIMARY, hover_color=GOLD_MUTED, text_color=BG_COLOR, 
                                      font=FONT_SUBTITLE, command=self._send_message)
        self.send_btn.grid(row=0, column=1)

        # Initial Welcome
        self._add_chat_bubble("AstroSage AI", "Namaste! I am your cosmic guide. Please enter your Gemini API Key in the sidebar to begin our celestial conversation. Then, share your Date, Time, and Place of birth for a personalized reading.")

    def _setup_api(self):
        api_key = self.api_entry.get().strip()
        model_name = self.model_choice.get()
        if not api_key:
            self._add_chat_bubble("System", "Please enter a valid API Key.")
            return
        
        try:
            self.logic.configure_api(api_key, model_name=model_name, available_models=AVAILABLE_MODELS)
            self._add_chat_bubble("System", f"Celestial connection established using {model_name}! You may now ask your questions.")
            self.save_btn.configure(text="Connected", state="disabled")
        except Exception as e:
            self._add_chat_bubble("System", f"API Connection failed: {str(e)}")

    def _send_message(self):
        msg = self.user_entry.get().strip()
        if not msg:
            return
        
        api_key = self.api_entry.get().strip()
        if not api_key:
            self._add_chat_bubble("System", "Please enter your API Key first.")
            return

        self._add_chat_bubble("You", msg)
        self.user_entry.delete(0, 'end')
        
        # Run API call in a thread to keep GUI responsive
        threading.Thread(target=self._get_ai_response, args=(msg,)).start()

    def _get_ai_response(self, user_msg):
        response = self.logic.get_response(
            user_msg, 
            on_model_fallback=lambda next_model: self.after(0, lambda: self._add_chat_bubble("System", f"Celestial shift! Primary quota reached. Moving to {next_model}..."))
        )
        self.after(0, lambda: self._add_chat_bubble("AstroSage AI", response))

    def _add_chat_bubble(self, sender, message):
        self.chat_display.configure(state="normal")
        tag = f"{sender.lower()}_tag"
        self.chat_display.insert("end", f"\n{sender}:\n", tag)
        self.chat_display.insert("end", f"{message}\n\n")
        
        # Styling for sender names
        self.chat_display.tag_add(tag, f"end - {len(message) + len(sender) + 5}c", f"end - {len(message) + 3}c")
        if sender == "You":
            self.chat_display.tag_config(tag, foreground=GOLD_SECONDARY)
        else:
            self.chat_display.tag_config(tag, foreground=GOLD_PRIMARY)

        self.chat_display.see("end")
        self.chat_display.configure(state="disabled")

if __name__ == "__main__":
    app = AstroSageApp()
    app.mainloop()
