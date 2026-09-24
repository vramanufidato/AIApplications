import json, os, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

BASE = os.path.dirname(os.path.abspath(__file__))
RECON = os.path.join(BASE, "recon")
os.makedirs(RECON, exist_ok=True)

with open(os.path.join(BASE, "config.json"), encoding="utf-8") as f:
    cfg = json.load(f)
target = cfg["target_url"]

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1920,1080")
opts.add_argument("--disable-gpu")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-dev-shm-usage")
opts.add_argument("--disable-blink-features=AutomationControlled")
opts.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")

driver = webdriver.Chrome(options=opts)
summary = {"target_url": target}
try:
    driver.set_page_load_timeout(45)
    try:
        driver.get(target)
    except Exception as e:
        summary["load_error"] = str(e)
    # wait for document ready
    end = time.time() + 15
    while time.time() < end:
        try:
            if driver.execute_script("return document.readyState") == "complete":
                break
        except Exception:
            pass
        time.sleep(0.5)
    time.sleep(4)  # let SPA / animations settle

    summary["title"] = driver.title
    summary["final_url"] = driver.current_url

    # full page screenshot
    try:
        h = driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)")
        driver.set_window_size(1920, min(int(h) + 200, 20000))
        time.sleep(1.5)
    except Exception:
        pass
    driver.save_screenshot(os.path.join(RECON, "homepage.png"))

    # html source
    with open(os.path.join(RECON, "homepage.html"), "w", encoding="utf-8") as f:
        f.write(driver.page_source)

    # inputs (inputs + textareas + selects)
    inputs = []
    for tag in ("input", "textarea", "select"):
        for el in driver.find_elements(By.TAG_NAME, tag):
            inputs.append({
                "tag": tag,
                "name": el.get_attribute("name"),
                "id": el.get_attribute("id"),
                "type": el.get_attribute("type"),
                "placeholder": el.get_attribute("placeholder"),
                "aria_label": el.get_attribute("aria-label"),
                "displayed": el.is_displayed(),
            })
    with open(os.path.join(RECON, "inputs.json"), "w", encoding="utf-8") as f:
        json.dump(inputs, f, indent=2)

    # buttons
    buttons = []
    for el in driver.find_elements(By.TAG_NAME, "button"):
        buttons.append({
            "text": (el.text or "").strip()[:120],
            "id": el.get_attribute("id"),
            "class": el.get_attribute("class"),
            "aria_label": el.get_attribute("aria-label"),
            "displayed": el.is_displayed(),
        })
    # also input[type=submit]
    for el in driver.find_elements(By.CSS_SELECTOR, "input[type=submit],input[type=button]"):
        buttons.append({"text": el.get_attribute("value"), "id": el.get_attribute("id"), "class": el.get_attribute("class"), "aria_label": None, "displayed": el.is_displayed()})
    with open(os.path.join(RECON, "buttons.json"), "w", encoding="utf-8") as f:
        json.dump(buttons, f, indent=2)

    # top 30 links
    links = []
    for el in driver.find_elements(By.TAG_NAME, "a")[:30]:
        links.append({
            "text": (el.text or "").strip()[:120],
            "href": el.get_attribute("href"),
            "id": el.get_attribute("id"),
            "aria_label": el.get_attribute("aria-label"),
            "displayed": el.is_displayed(),
        })
    with open(os.path.join(RECON, "links.json"), "w", encoding="utf-8") as f:
        json.dump(links, f, indent=2)

    # key elements
    kw = ["search", "login", "sign in", "sign up", "register", "category", "menu", "cart", "contact", "project", "about", "skill", "resume", "download"]
    key = []
    seen = set()
    for el in driver.find_elements(By.XPATH, "//*")[:5000]:
        try:
            text = (el.text or "").strip()
            blob = " ".join(filter(None, [
                text,
                el.get_attribute("id") or "",
                el.get_attribute("class") or "",
                el.get_attribute("name") or "",
                el.get_attribute("aria-label") or "",
                el.get_attribute("placeholder") or "",
                el.get_attribute("href") or "",
            ])).lower()
            matched = [k for k in kw if k in blob]
            if not matched:
                continue
            sig = (el.tag_name, text[:80])
            if sig in seen:
                continue
            seen.add(sig)
            key.append({
                "tag": el.tag_name,
                "text": text[:120],
                "id": el.get_attribute("id"),
                "class": el.get_attribute("class"),
                "name": el.get_attribute("name"),
                "aria_label": el.get_attribute("aria-label"),
                "href": el.get_attribute("href"),
                "displayed": el.is_displayed(),
                "matched": matched,
            })
        except Exception:
            continue
    with open(os.path.join(RECON, "key_elements.json"), "w", encoding="utf-8") as f:
        json.dump(key, f, indent=2)

    # headings + nav labels (extra signal for inference)
    headings = []
    for tag in ("h1", "h2", "h3"):
        for el in driver.find_elements(By.TAG_NAME, tag):
            t = (el.text or "").strip()
            if t:
                headings.append({"tag": tag, "text": t[:160]})
    summary["headings"] = headings[:30]

    nav_labels = []
    for el in driver.find_elements(By.CSS_SELECTOR, "nav a, header a, [class*=nav] a"):
        t = (el.text or "").strip()
        if t:
            nav_labels.append(t[:60])
    summary["nav_labels"] = sorted(set(nav_labels))[:30]

    body = (driver.find_element(By.TAG_NAME, "body").text or "")
    summary["body_text_chars"] = len(body)

    # modal detection
    modal_present = False
    for sel in ("[role=dialog]", "[aria-modal=true]"):
        for el in driver.find_elements(By.CSS_SELECTOR, sel):
            try:
                if el.is_displayed():
                    modal_present = True
            except Exception:
                pass
    if modal_present:
        driver.save_screenshot(os.path.join(RECON, "modal.png"))

    summary["inputs_count"] = len(inputs)
    summary["buttons_count"] = len(buttons)
    summary["links_count"] = len(links)
    summary["key_elements_count"] = len(key)
    summary["modal_present"] = modal_present
    summary["homepage_screenshot"] = "recon/homepage.png"
finally:
    with open(os.path.join(RECON, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    driver.quit()

print(json.dumps(summary, indent=2))
