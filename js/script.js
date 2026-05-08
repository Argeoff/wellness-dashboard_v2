    let lastState = null;
    let secondsSinceUpdate = 0;
	
	const page = document.querySelector(".page");
	const sidebar = document.querySelector(".sidebar");
	const btn = document.querySelector(".nav-title button");
	
	//restore previous sidebar state on page load (using localstorage)
	if (localStorage.getItem("sidebar-collapsed") === "true") {
		sidebar.classList.add("collapsed");
	}
	
	// now reveal page (after layout is correct)
	requestAnimationFrame(() => {
		page.classList.add("loaded");
	});
	
	btn.addEventListener("click", () => {
		sidebar.classList.toggle("collapsed");
		localStorage.setItem("sidebar-collapsed", sidebar.classList.contains("collapsed"));
	});
	
	// calculte sidebar icon position (for tooltip)
	document.querySelectorAll(".nav-content li a").forEach(el => {
    el.addEventListener("mouseenter", (e) => {
			const rect = e.target.getBoundingClientRect();

			e.target.style.setProperty("--tooltip-y", rect.top + rect.height / 2 + "px");
		});
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