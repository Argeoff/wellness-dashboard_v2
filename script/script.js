    let lastState = null;
    let secondsSinceUpdate = 0;
	
	const sidebar = document.querySelector(".sidebar");
	const btn = document.querySelector(".nav-title button");

	btn.addEventListener("click", () => {
		sidebar.classList.toggle("collapsed");
	});
	
    function addToHistory(state) {
      const historyEl = document.getElementById('history');
      const li = document.createElement('li');

      const time = new Date().toLocaleString();
      const label = state === "on" ? "Occupied" : "Vacant";

      li.textContent = `${label} at ${time}`;
      historyEl.prepend(li);

      // Limit history
      if (historyEl.children.length > 50) {
        historyEl.removeChild(historyEl.lastChild);
      }
    }

	async function getPresence() {
	  try {
		const res = await fetch('/api/presence');

		if (!res.ok) {
		  throw new Error("Network response failed");
		}

		const data = await res.json();

		const statusEl = document.getElementById('status');

		if (data.state === "on") {
		  statusEl.className = "occupied";
		  statusEl.innerText = "🔴 Occupied";
		} else if (data.state === "off") {
		  statusEl.className = "vacant";
		  statusEl.innerText = "🟢 Vacant";
		} else {
		  statusEl.className = "";
		  statusEl.innerText = "Unknown";
		}

		// Only log if state changes
		if (lastState !== null && data.state !== lastState) {
		  addToHistory(data.state);
		}

		lastState = data.state;

		document.getElementById('updated').innerText = new Date().toLocaleString();

		// Reset dots timing
		secondsSinceUpdate = 0;

	  } catch (err) {
		const statusEl = document.getElementById('status');
		statusEl.className = "";
		statusEl.innerText = "🟡 Error";
		}
	}

    // Dot progression: 1 dot per second (max 5)
    setInterval(() => {
      secondsSinceUpdate++;

      if (secondsSinceUpdate > 5) {
        secondsSinceUpdate = 5;
      }

      document.getElementById('dots').innerText = '.'.repeat(secondsSinceUpdate);
    }, 1000);

    // Initial fetch + repeat every 5 seconds
    async function loop() {
	  await getPresence();
	  setTimeout(loop, 5000);
	}

	loop();