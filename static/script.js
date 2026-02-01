async function loadEvents() {
  const res = await fetch("/events");
  const data = await res.json();

  const list = document.getElementById("events");
  list.innerHTML = "";

  data.forEach((event) => {
    let text = "";

    if (event.action === "PUSH") {
      text = `${event.author} pushed to ${event.to_branch} on ${event.timestamp}`;
    }

    if (event.action === "PULL_REQUEST") {
      text = `${event.author} submitted a pull request from ${event.from_branch} to ${event.to_branch} on ${event.timestamp}`;
    }
    if (event.action === "MERGE") {
      text = `${event.author} merged branch ${event.from_branch} to ${event.to_branch} on ${event.timestamp}`;
    }

    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
}

loadEvents();
setInterval(loadEvents, 15000);
