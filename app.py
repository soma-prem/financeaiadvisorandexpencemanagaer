import streamlit as st
import os
import sys
import json
from PIL import Image

# Import the advisor function AND the calculated variables
try:
    from backend.tools.advisor import (
        chat_with_advisor, 
        savings_rate, 
        top_categories, 
        selected_guru, 
        spending_summary,
        process_receipt_tool,
        process_statement_tool
    )
except ImportError:
    from advisor import chat_with_advisor, savings_rate, top_categories, selected_guru, spending_summary, process_receipt_tool, process_statement_tool

# ===============================================================
# 1. PATH CONFIGURATION
# ===============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(BASE_DIR, "data", "reports")
bar_chart = os.path.join(REPORTS_DIR, "total_spending_by_category_bar_chart.png")
line_chart = os.path.join(REPORTS_DIR, "monthly_spending_trend_line_chart.png")

# ===============================================================
# 2. PAGE SETUP
# ===============================================================
st.set_page_config(
    page_title="Personal Finance AI Agent",
    layout="wide"
)

st.title("🤖 Personal Finance AI Agent")
st.caption("Upload receipts, bank statements, or ask questions — your wealth, automated.")

# ===============================================================
# 3. SIDEBAR STATUS
# ===============================================================
st.sidebar.header("System Status")
if os.path.exists(bar_chart) and os.path.exists(line_chart):
    st.sidebar.success("✅ Analytics Ready")
else:
    st.sidebar.warning("⚠️ Run analysis to generate charts")

# ===============================================================
# 4. TABS: Chat Advisor & Analytics
# ===============================================================
tab_chat, tab_charts = st.tabs(["💬 Chat Advisor", "📊 Visual Analytics"])

# --------------------- CHAT ADVISOR TAB -----------------------
with tab_chat:
    # Session state initialization
    if "last_processed_filename" not in st.session_state:
        st.session_state.last_processed_filename = None

    # Track B Update: Unified uploader for Images and PDFs
    uploaded_file = st.file_uploader(
        "📎 Upload receipt (Image) or Bank Statement (PDF)",
        type=["jpg", "jpeg", "png", "pdf"],
        key="main_file_uploader"
    )

    if uploaded_file and st.session_state.last_processed_filename != uploaded_file.name:
        # Save temp file
        temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, uploaded_file.name)
        
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        # --- ROUTING LOGIC ---
        if uploaded_file.type == "application/pdf":
            st.info(f"📄 PDF Detected: **{uploaded_file.name}**")
            pdf_password = st.text_input("Enter PDF Password (if required)", type="password")
            
            if st.button("🚀 Process Bank Statement"):
                with st.spinner("Decrypting and parsing bank statement..."):
                    result = "" 
                    try:
                        # Call tool
                        result = process_statement_tool.invoke({"pdf_path": temp_path, "password": pdf_password})
                        
                        if result and isinstance(result, str) and "✅" in result:
                            st.success(result)
                            st.session_state.last_processed_filename = uploaded_file.name
                        else:
                            st.error(result if result else "❌ Failed to extract data.")
                    except Exception as e:
                        st.error(f"❌ System Error: {str(e)}")
                    finally:
                        # Track B Best Practice: Cleanup temp files
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
        
        else:
            # Traditional Image OCR logic
            st.image(temp_path, caption="Processing Receipt...", width=300)
            if st.button("🔍 Extract Receipt Data"):
                with st.spinner("Running OCR & Preprocessing..."):
                    result = process_receipt_tool(temp_path)
                    st.success(result)
                    st.session_state.last_processed_filename = uploaded_file.name

# --- CHAT INTERFACE ---
user_input = st.chat_input("Ask about your budget, spending, or Guru advice...")

if user_input:
    st.chat_message("user").write(user_input)
    
    with st.spinner("Thinking..."):
        response = chat_with_advisor(user_input)
        
        if response.strip().startswith("{") and response.strip().endswith("}"):
            try:
                clean_response = response.strip().replace("```json", "").replace("```", "")
                advice_data = json.loads(clean_response)
                
                with st.chat_message("assistant"):
                    st.markdown(f"### 🛡️ {selected_guru}’s Wealth Analysis")
                    
                    m1, m2 = st.columns(2)
                    m1.metric("Savings Rate", f"{savings_rate}%", delta=None if savings_rate > 0 else "DEFICIT", delta_color="inverse")
                    m2.metric("Top Leak", top_categories[0] if top_categories else "N/A", delta="Highest Spend")

                    st.divider()
                    st.markdown("#### 🔍 Spending Insight")
                    st.write(advice_data['spending_insight'])
                    
                    st.markdown(f"#### ⚠️ Critical Concern")
                    st.write(advice_data['financial_concern'])

                    st.markdown("#### 🎯 Recommended Actions")
                    for action in advice_data['recommended_actions']:
                        st.markdown(f"✅ {action}")

                    with st.expander("🎓 View Advisor Philosophy"):
                        st.write(advice_data['principle_guidance'])
                    st.caption(advice_data['motivation_and_disclaimer'])

            except json.JSONDecodeError:
                st.chat_message("assistant").write(response)
        else:
            st.chat_message("assistant").write(response)

# --------------------- ANALYTICS TAB -------------------------
with tab_charts:
    st.subheader("📊 Visual Analytics")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### Spending by Category")
        if os.path.exists(bar_chart):
            st.image(bar_chart, use_container_width=True)
        else:
            st.info("Chart will appear after data processing.")

    with col2:
        st.markdown("#### Monthly Spending Trend")
        if os.path.exists(line_chart):
            st.image(line_chart, use_container_width=True)
        else:
            st.info("Chart will appear after data processing.")