const requestList = document.getElementById("requestList");
const adminStatus = document.getElementById("adminStatus");
const refreshBtn = document.getElementById("refreshBtn");
const adminApiBase =
  window.location.protocol === "file:" || window.location.origin !== "http://localhost:3000"
    ? "http://localhost:3000"
    : "";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function renderRequests(requests) {
  if (!requestList) {
    return;
  }

  if (!requests.length) {
    requestList.innerHTML = `
      <article class="request-card empty-state">
        <h2>No requests yet</h2>
        <p>When a customer submits the service form, it will show up here.</p>
      </article>
    `;
    return;
  }

  requestList.innerHTML = requests
    .slice()
    .reverse()
    .map(
      (request) => `
        <article class="request-card">
          <div class="request-top">
            <h2>${request.name}</h2>
            <span>${formatDate(request.receivedAt)}</span>
          </div>
          <p><strong>Phone:</strong> ${request.phone}</p>
          <p><strong>Service:</strong> ${request.service}</p>
          <p><strong>Message:</strong> ${request.message}</p>
        </article>
      `
    )
    .join("");
}

async function loadRequests() {
  if (adminStatus) {
    adminStatus.textContent = "Loading requests...";
  }

  try {
    const response = await fetch(`${adminApiBase}/api/requests`);
    const requests = await response.json();

    if (!response.ok) {
      throw new Error("Unable to load requests.");
    }

    renderRequests(requests);

    if (adminStatus) {
      adminStatus.textContent = `Showing ${requests.length} request${requests.length === 1 ? "" : "s"}.`;
    }
  } catch (error) {
    if (requestList) {
      requestList.innerHTML = `
        <article class="request-card empty-state">
          <h2>Could not load requests</h2>
          <p>Make sure the backend is running on http://localhost:3000.</p>
        </article>
      `;
    }

    if (adminStatus) {
      adminStatus.textContent = "Could not connect to the backend.";
    }
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", loadRequests);
}

loadRequests();
