import asyncio, json, time
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "screenshots"
OUT.mkdir(exist_ok=True)

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()

        signup_calls = []
        def on_request(req):
            u = req.url
            if "/auth/v1/signup" in u or "/auth/v1/admin/users" in u or "_serverFn" in u or "registerAccount" in u:
                signup_calls.append({"method": req.method, "url": u})
        page.on("request", on_request)

        await page.goto("http://localhost:8080/auth", wait_until="networkidle")

        # Wait for React to hydrate the tab buttons.
        await page.wait_for_selector('button[aria-pressed="true"]')
        # Click the "Sign up" tab (the one with aria-pressed=false initially).
        await page.locator('button[aria-pressed="false"]:has-text("Sign up")').click()
        await page.wait_for_selector("#name", state="visible")
        await page.screenshot(path=str(OUT / "1_register_empty.png"))

        unique = int(time.time())
        email = f"e2e-nocheck-{unique}@example.com"
        await page.locator("#name").fill("E2E No Check")
        await page.locator("#email").fill(email)
        await page.locator("#password").fill("supersecret123")

        submit = page.locator('button[type="submit"]')
        disabled_before = await submit.is_disabled()

        try:
            await submit.click(timeout=1500, force=False)
        except Exception:
            pass
        # Also try forcing a click (bypass disabled) to simulate a UI bypass.
        try:
            await submit.evaluate("(el) => { el.removeAttribute('disabled'); el.click(); }")
        except Exception:
            pass
        # And try dispatching the form submit event directly.
        try:
            await page.evaluate("document.querySelector('form')?.requestSubmit()")
        except Exception:
            pass

        await page.wait_for_timeout(2500)
        await page.screenshot(path=str(OUT / "2_after_bypass_attempts.png"))
        url_after_no_age = page.url

        # Now check the age checkbox and confirm the button becomes enabled.
        await page.locator('input[type="checkbox"]').check()
        await page.wait_for_timeout(300)
        enabled_after = not await submit.is_disabled()
        await page.screenshot(path=str(OUT / "3_after_age_checked.png"))

        result = {
            "submit_disabled_without_age": disabled_before,
            "submit_enabled_after_age_check": enabled_after,
            "url_stayed_on_auth": url_after_no_age.endswith("/auth"),
            "signup_network_calls_during_bypass": signup_calls,
        }
        print("E2E_RESULT=" + json.dumps(result, indent=2))

        assert disabled_before is True, "Registration button must be disabled without age confirmation"
        assert enabled_after is True, "Registration button must enable once age is confirmed"
        assert url_after_no_age.endswith("/auth"), f"Must stay on /auth when age not confirmed; got {url_after_no_age}"
        assert len(signup_calls) == 0, f"No signup / server-fn calls expected without age confirmation, got: {signup_calls}"

        print("E2E_PASSED")
        await browser.close()

asyncio.run(main())
