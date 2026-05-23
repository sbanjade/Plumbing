const menuBtn = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const isBackendOrigin = window.location.origin === "http://localhost:3000";
const apiBase =
  window.location.protocol === "file:" || !isBackendOrigin ? "http://localhost:3000" : "";

if (menuBtn && siteNav) {
  menuBtn.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "Sending your request...";

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send request.");
      }

      formStatus.textContent = result.message;
      contactForm.reset();
    } catch (error) {
      formStatus.textContent =
        "Could not send request. Make sure the backend is running on http://localhost:3000, then try again.";
    }
  });
}
