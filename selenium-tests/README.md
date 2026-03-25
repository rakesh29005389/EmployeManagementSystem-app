# Selenium Tests – Employee Management System

This Maven project contains Selenium Java automation tests for the Employee Management System, with a focus on interacting with the **Download CSV** button that lives inside a **closed shadow root** Web Component.

## Why closed shadow roots are challenging

When a Web Component's shadow root is created with `{ mode: 'closed' }`, the browser's JavaScript API returns `null` for `element.shadowRoot`.  This means ordinary `JavascriptExecutor` scripts that traverse the shadow tree with `element.shadowRoot.querySelector(…)` will fail with a `NullPointerException` or return nothing.

```html
<!-- <download-button> host element in the regular DOM -->
<download-button id="download-btn-host">
  <!-- #shadow-root (closed)  ← element.shadowRoot === null from JS -->
  |  <button id="download-csv-btn" aria-label="Download employee data as CSV">
  |    ⬇ Download CSV
  |  </button>
</download-button>
```

## Solution: Selenium 4's `getShadowRoot()` API

Selenium 4 provides [`WebElement.getShadowRoot()`](https://www.selenium.dev/documentation/webdriver/elements/shadow_dom/) which communicates with Chrome via the **Chrome DevTools Protocol (CDP)**.  CDP can access the internals of *any* shadow root — open or closed — because it operates at a lower level than the JavaScript API.

```java
// 1. Find the host element in the regular DOM
WebElement host = driver.findElement(By.cssSelector("download-button#download-btn-host"));

// 2. Confirm the shadow root is truly closed from JavaScript
Object shadowRootFromJs = ((JavascriptExecutor) driver)
        .executeScript("return arguments[0].shadowRoot;", host);
// → null  (closed mode)

// 3. Pierce the closed shadow root via Selenium 4 / CDP
SearchContext shadowRoot = host.getShadowRoot();   // ✓ returns a valid SearchContext

// 4. Find the button inside the shadow root
WebElement downloadBtn = shadowRoot.findElement(By.cssSelector("#download-csv-btn"));

// 5. Interact normally
downloadBtn.click();
```

## Prerequisites

| Requirement | Version |
|---|---|
| Java | 11+ |
| Maven | 3.8+ |
| Google Chrome | Latest stable |
| Employee Management frontend | Running at `http://localhost:3000` |

## Running the tests

```bash
# 1. Start the frontend (from the repo root)
cd frontend && npm install && npm start &

# 2. Run the Selenium tests
cd selenium-tests
mvn test

# 3. Optionally point at a different URL
mvn test -Dapp.url=http://staging.example.com
```

## Test overview

| Test | Approach |
|---|---|
| `clickDownloadButton_usingSelenium4ShadowRootApi` | **Recommended** – uses `getShadowRoot()` (CDP-backed) to pierce the closed shadow root and click the inner button |
| `clickDownloadButton_usingJavascriptExecutorFallback` | **Fallback pattern** – shows how to verify the `download-csv` custom event bubbles through the closed shadow root |
| `downloadButton_hasCorrectAttributesInsideShadowRoot` | Verifies id, `aria-label`, and button text inside the shadow root |
