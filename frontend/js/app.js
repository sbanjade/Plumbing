const menuBtn = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const isBackendOrigin = window.location.origin === "http://localhost:3000";
const apiBase =
  window.location.protocol === "file:" || !isBackendOrigin ? "http://localhost:3000" : "";

if (menuBtn && siteNav) {
  menuBtn.setAttribute("aria-expanded", "false");

  menuBtn.addEventListener("click", () => {
    siteNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(siteNav.classList.contains("open")));
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length) {
  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 0.06, 0.3)}s`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
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
