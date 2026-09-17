import re


def detect_device_info(user_agent: str | None):
    """
    Detect device type, device name, browser,
    and operating system from User-Agent.
    """

    if not user_agent:
        return {
            "device_type": "Unknown",
            "device_name": "Unknown Device",
            "browser": "Unknown",
            "operating_system": "Unknown",
        }

    ua = user_agent.lower()

    # =========================================
    # OPERATING SYSTEM
    # =========================================

    if "windows nt 10.0" in ua:
        operating_system = "Windows 10/11"

    elif "windows nt 6.3" in ua:
        operating_system = "Windows 8.1"

    elif "windows nt 6.2" in ua:
        operating_system = "Windows 8"

    elif "windows nt 6.1" in ua:
        operating_system = "Windows 7"

    elif "mac os x" in ua:
        match = re.search(r"mac os x ([0-9_]+)", ua)

        if match:
            version = match.group(1).replace("_", ".")
            operating_system = f"macOS {version}"
        else:
            operating_system = "macOS"

    elif "android" in ua:
        match = re.search(r"android ([0-9.]+)", ua)

        if match:
            operating_system = f"Android {match.group(1)}"
        else:
            operating_system = "Android"

    elif "iphone" in ua or "ipad" in ua:
        operating_system = "iOS"

    elif "linux" in ua:
        operating_system = "Linux"

    else:
        operating_system = "Unknown"


    # =========================================
    # DEVICE TYPE
    # =========================================

    if "ipad" in ua or "tablet" in ua:
        device_type = "Tablet"

    elif "mobile" in ua or "iphone" in ua or "android" in ua:
        device_type = "Mobile"

    else:
        device_type = "Desktop"


    # =========================================
    # DEVICE NAME
    # =========================================

    if "iphone" in ua:
        device_name = "iPhone"

    elif "ipad" in ua:
        device_name = "iPad"

    elif "android" in ua:
        device_name = "Android Device"

    elif "windows" in ua:
        device_name = "Windows PC"

    elif "macintosh" in ua:
        device_name = "Mac"

    elif "linux" in ua:
        device_name = "Linux PC"

    else:
        device_name = "Unknown Device"


    # =========================================
    # BROWSER
    # =========================================

    if "edg/" in ua:
        match = re.search(r"edg/([\d.]+)", ua)
        browser = (
            f"Microsoft Edge {match.group(1)}"
            if match
            else "Microsoft Edge"
        )

    elif "opr/" in ua:
        match = re.search(r"opr/([\d.]+)", ua)
        browser = (
            f"Opera {match.group(1)}"
            if match
            else "Opera"
        )

    elif "firefox/" in ua:
        match = re.search(r"firefox/([\d.]+)", ua)
        browser = (
            f"Firefox {match.group(1)}"
            if match
            else "Firefox"
        )

    elif "chrome/" in ua and "edg/" not in ua:
        match = re.search(r"chrome/([\d.]+)", ua)
        browser = (
            f"Chrome {match.group(1)}"
            if match
            else "Chrome"
        )

    elif "safari/" in ua and "chrome/" not in ua:
        match = re.search(r"version/([\d.]+)", ua)
        browser = (
            f"Safari {match.group(1)}"
            if match
            else "Safari"
        )

    else:
        browser = "Unknown"


    return {
        "device_type": device_type,
        "device_name": device_name,
        "browser": browser,
        "operating_system": operating_system,
    }