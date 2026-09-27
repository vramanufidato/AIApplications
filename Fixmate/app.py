import os
import streamlit as st
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables FIRST so clients initialize properly
load_dotenv()

from vision import diagnose
from parts import optimize_queries, search_parts
from safety import safety_review
from camera import capture_photo
from audio import transcribe_audio

st.set_page_config(page_title="FixMate", page_icon="🔧", layout="centered")
st.title("🔧 FixMate")
st.caption("Plumbing & electrical diagnosis for Raspberry Pi")

# --- Input Section ---
col1, col2 = st.columns(2)

with col1:
    st.subheader("1. Capture the problem")
    
    # We add file uploader for windows fallback
    uploaded_photo = st.file_uploader("Upload image (Fallback for non-Pi)", type=["jpg", "jpeg", "png"])
    if uploaded_photo:
        st.session_state["photo"] = uploaded_photo.read()
        
    if st.button("📷 Take photo (Pi Camera)", use_container_width=True):
        try:
            st.session_state["photo"] = capture_photo()
        except Exception as e:
            st.error(f"Camera error: {e}")
            
    if "photo" in st.session_state:
        st.image(st.session_state["photo"], caption="Captured", use_container_width=True)

with col2:
    st.subheader("2. Describe it (optional)")
    audio_file = st.file_uploader("Upload voice note", type=["wav", "mp3", "m4a"])
    text_input = st.text_area("Or type what's wrong", height=100)

# --- Location ---
city = st.text_input("Your city", value=os.getenv("DEFAULT_CITY", "Pune"))

# --- Run ---
if st.button("🔍 Diagnose", type="primary", use_container_width=True):
    if "photo" not in st.session_state and not text_input and not audio_file:
        st.warning("Please capture a photo or describe the problem.")
    else:
        with st.spinner("Analyzing..."):
            transcript = text_input
            if audio_file:
                transcript = transcribe_audio(audio_file.read())

            image_bytes = st.session_state.get("photo")

            # 1. Diagnose
            diagnosis = diagnose(image_bytes, transcript, city)

            # 2. Safety review
            diagnosis = safety_review(diagnosis)

            # 3. Optimize + search parts
            queries = optimize_queries(diagnosis["parts_needed"])
            offers = search_parts(queries, city, os.getenv("SERPAPI_KEY"))

            st.session_state["diagnosis"] = diagnosis
            st.session_state["offers"] = offers

            # Log to DB (optional from blog)
            try:
                from store import log_diagnosis
                log_diagnosis(image_bytes, transcript, diagnosis, offers)
            except Exception as e:
                pass

# --- Results ---
if "diagnosis" in st.session_state:
    d = st.session_state["diagnosis"]

    if d.get("safety_warning"):
        st.error(f"⚠️ **SAFETY WARNING:** {d['safety_warning']}")

    st.subheader("Diagnosis")
    st.write(d["summary"])

    st.subheader("Likely faults")
    for f in d["faults"]:
        badge = {"HIGH": "🟢", "MEDIUM": "🟡", "LOW": "🔴"}[f["confidence"]]
        with st.expander(f"{badge} {f['name']} — {f['confidence']} confidence"):
            st.write(f"**Evidence:** {f['evidence']}")
            st.write(f"**Root cause:** {f['root_cause']}")

    st.subheader("Repair plan")
    for s in d["repair_steps"]:
        icon = "👷" if s["requires_professional"] else "🔧"
        st.write(f"{icon} **Step {s['step']}:** {s['action']}")

    meta1, meta2, meta3 = st.columns(3)
    meta1.metric("Difficulty", d["difficulty"])
    meta2.metric("Time", d["estimated_time"])
    meta3.metric("Parts", len(d["parts_needed"]))

    st.subheader("Tools needed")
    st.write(", ".join(d["tools_needed"]))

    if d.get("reshoot_request"):
        st.info(f"📸 Better photo would help: {d['reshoot_request']}")

    st.subheader("🛒 Where to buy")
    for part in st.session_state["offers"]:
        st.markdown(f"**{part['part_name']}**")
        if not part["offers"]:
            st.caption("No online results. Try a local hardware store.")
        for o in part["offers"]:
            st.write(f"- [{o['title']}]({o['link']}) — {o['price']} · {o['source']}")

    st.caption(f"Diagnosed at {datetime.now().strftime('%Y-%m-%d %H:%M')}")
