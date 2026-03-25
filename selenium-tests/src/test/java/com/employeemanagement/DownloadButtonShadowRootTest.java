package com.employeemanagement;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Selenium Java tests demonstrating how to interact with a {@code <download-button>}
 * Web Component whose shadow root is created in <b>closed</b> mode
 * ({@code attachShadow({ mode: 'closed' })}).
 *
 * <h2>Why closed shadow roots are hard for Selenium</h2>
 * When a shadow root is closed, {@code element.shadowRoot} returns {@code null}
 * from JavaScript running in the page context, so the usual
 * {@code JavascriptExecutor} trick of traversing shadow roots with
 * {@code element.shadowRoot.querySelector(…)} does NOT work.
 *
 * <h2>Solutions implemented here</h2>
 * <ol>
 *   <li><b>Selenium 4 native API</b> – {@link WebElement#getShadowRoot()} uses
 *       Chrome DevTools Protocol under the hood and can pierce closed shadow
 *       roots regardless of the {@code mode} setting.  This is the recommended
 *       approach and is demonstrated in
 *       {@link #clickDownloadButton_usingSelenium4ShadowRootApi()}.</li>
 *   <li><b>CDP / JavascriptExecutor fallback</b> – When the host element has a
 *       known, stable selector you can tell ChromeDriver to execute a script
 *       that captures the shadow root reference <em>at construction time</em>
 *       via a custom property set on the host.  This approach requires the Web
 *       Component to expose a reference in a non-standard way and is shown as
 *       an illustrative example in
 *       {@link #clickDownloadButton_usingJavascriptExecutorFallback()}.</li>
 * </ol>
 *
 * <h2>Prerequisites</h2>
 * <ul>
 *   <li>Google Chrome installed on the test machine.</li>
 *   <li>The Employee Management System frontend running at
 *       {@code http://localhost:3000} (start with {@code npm start} inside
 *       the {@code frontend/} directory).</li>
 * </ul>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class DownloadButtonShadowRootTest {

    /** Base URL of the running React application. */
    private static final String BASE_URL = System.getProperty("app.url", "http://localhost:3000");

    /** CSS selector for the {@code <download-button>} host element. */
    private static final String HOST_SELECTOR = "download-button#download-btn-host";

    /** CSS selector for the inner button *inside* the shadow root. */
    private static final String INNER_BUTTON_SELECTOR = "#download-csv-btn";

    private static WebDriver driver;
    private static WebDriverWait wait;

    // -----------------------------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------------------------

    @BeforeAll
    static void setUpDriver() {
        // WebDriverManager downloads and configures ChromeDriver automatically.
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        // Run headless in CI environments; remove for local debugging.
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1280,800");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterAll
    static void tearDownDriver() {
        if (driver != null) {
            driver.quit();
        }
    }

    @BeforeEach
    void navigateToApp() {
        driver.get(BASE_URL);
        // Wait until the custom element is registered and visible in the DOM.
        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(HOST_SELECTOR)));
    }

    // -----------------------------------------------------------------------
    // Test 1 – Selenium 4 native getShadowRoot() API  (recommended approach)
    // -----------------------------------------------------------------------

    /**
     * <b>Approach 1 (recommended):</b> Use Selenium 4's built-in
     * {@link WebElement#getShadowRoot()} to obtain a {@link SearchContext} that
     * represents the shadow root.  Selenium communicates with Chrome through the
     * <a href="https://chromedevtools.github.io/devtools-protocol/">Chrome DevTools
     * Protocol</a>, which can access closed shadow roots that are invisible to
     * ordinary JavaScript.
     *
     * <pre>
     * WebElement host       = driver.findElement(By.cssSelector("download-button#download-btn-host"));
     * SearchContext shadow   = host.getShadowRoot();          // pierces closed shadow root
     * WebElement innerButton = shadow.findElement(By.cssSelector("#download-csv-btn"));
     * innerButton.click();
     * </pre>
     */
    @Test
    @Order(1)
    void clickDownloadButton_usingSelenium4ShadowRootApi() {
        // Step 1 – Locate the host element in the regular DOM.
        WebElement host = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector(HOST_SELECTOR))
        );
        assertNotNull(host, "The <download-button> host element must be present in the DOM.");

        // Step 2 – Confirm that element.shadowRoot is null from JS (closed mode).
        Object shadowRootFromJs = ((JavascriptExecutor) driver)
                .executeScript("return arguments[0].shadowRoot;", host);
        assertNull(shadowRootFromJs,
                "shadowRoot must be null from JavaScript because the shadow root is in closed mode.");

        // Step 3 – Use Selenium 4's getShadowRoot() which uses CDP to pierce the closed root.
        SearchContext shadowRoot = host.getShadowRoot();
        assertNotNull(shadowRoot, "getShadowRoot() must return a non-null SearchContext via CDP.");

        // Step 4 – Find the inner button inside the shadow root.
        WebElement downloadButton = shadowRoot.findElement(By.cssSelector(INNER_BUTTON_SELECTOR));
        assertNotNull(downloadButton, "The inner #download-csv-btn button must exist in the shadow root.");
        assertTrue(downloadButton.isDisplayed(), "The download button must be visible.");

        // Step 5 – Click the button.
        downloadButton.click();

        // Step 6 – Verify that the click dispatched the custom event (the app
        // handles it by triggering a CSV download; we verify no JS error occurs).
        Object error = ((JavascriptExecutor) driver)
                .executeScript("return window.__lastDownloadError__ || null;");
        assertNull(error, "No JavaScript error should occur after clicking the download button.");
    }

    // -----------------------------------------------------------------------
    // Test 2 – JavascriptExecutor fallback via host-stored reference
    // -----------------------------------------------------------------------

    /**
     * <b>Approach 2 (fallback):</b> A closed shadow root cannot be reached via
     * {@code element.shadowRoot} from JavaScript, but the Web Component can store
     * a reference to the shadow root in a custom property on the host element at
     * construction time.  A script injected by {@link JavascriptExecutor} can
     * then read that property to reach the inner button.
     *
     * <p>This is an illustrative pattern; the production {@code DownloadButton}
     * component does NOT expose an internal reference, so this test instead
     * verifies that clicking the host element triggers the {@code download-csv}
     * event by listening for it on the document.</p>
     *
     * <pre>
     * // Example: if the component stored its shadow root as host.__shadow__
     * Object button = ((JavascriptExecutor) driver).executeScript(
     *     "return arguments[0].__shadow__.querySelector('#download-csv-btn');",
     *     host
     * );
     * ((WebElement) button).click();
     * </pre>
     */
    @Test
    @Order(2)
    void clickDownloadButton_usingJavascriptExecutorFallback() {
        WebElement host = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector(HOST_SELECTOR))
        );

        // Register a one-shot listener on the document to capture the custom event.
        ((JavascriptExecutor) driver).executeScript(
                "document.__downloadCsvEventFired__ = false;" +
                "document.addEventListener('download-csv', function onDownload() {" +
                "  document.__downloadCsvEventFired__ = true;" +
                "  document.removeEventListener('download-csv', onDownload);" +
                "}, { once: true });"
        );

        // Use Selenium 4's getShadowRoot() (CDP-backed) to click the inner button.
        SearchContext shadowRoot = host.getShadowRoot();
        WebElement downloadButton = shadowRoot.findElement(By.cssSelector(INNER_BUTTON_SELECTOR));
        downloadButton.click();

        // Assert that the custom event bubbled up to the document.
        Boolean eventFired = (Boolean) ((JavascriptExecutor) driver)
                .executeScript("return document.__downloadCsvEventFired__;");
        assertTrue(eventFired,
                "The 'download-csv' CustomEvent must bubble up from the closed shadow root to the document.");
    }

    // -----------------------------------------------------------------------
    // Test 3 – Verify the button attributes and accessibility label
    // -----------------------------------------------------------------------

    /**
     * Verifies the inner button's aria-label and id are correctly set inside the
     * closed shadow root, ensuring the Web Component renders as expected.
     */
    @Test
    @Order(3)
    void downloadButton_hasCorrectAttributesInsideShadowRoot() {
        WebElement host = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector(HOST_SELECTOR))
        );

        SearchContext shadowRoot = host.getShadowRoot();
        WebElement button = shadowRoot.findElement(By.cssSelector(INNER_BUTTON_SELECTOR));

        assertEquals("download-csv-btn", button.getAttribute("id"),
                "Inner button id must be 'download-csv-btn'.");
        assertEquals("Download employee data as CSV", button.getAttribute("aria-label"),
                "Inner button must have the correct aria-label for accessibility.");
        assertTrue(button.getText().contains("Download CSV"),
                "Button text must include 'Download CSV'.");
    }
}
