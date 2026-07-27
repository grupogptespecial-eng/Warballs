(() => {
  "use strict";

  const FIXED_DT = 1 / 240;
  const SPEEDS = [0.25, 0.5, 1, 2, 4];
  const CORE_STORAGE_KEY = "portal-simulator-core-html-v1";
  const SPEED_STORAGE_KEY = "portal-simulator-speed-v1";

  const iframe = document.getElementById("simulator");
  const setup = document.getElementById("setup");
  const coreFile = document.getElementById("coreFile");
  const setupStatus = document.getElementById("setupStatus");
  const pauseButton = document.getElementById("pauseButton");
  const speedSelect = document.getElementById("speedSelect");
  const cycleSpeedButton = document.getElementById("cycleSpeedButton");
  const changeCoreButton = document.getElementById("changeCoreButton");
  const engineStatus = document.getElementById("engineStatus");

  let api = null;
  let innerWindow = null;
  let running = true;
  let accumulator = 0;
  let lastFrame = performance.now();
  let lastInnerPauseSync = 0;
  let overloaded = false;

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }

  function safeStorageRemove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  function loadInitialSpeed() {
    const value = Number(safeStorageGet(SPEED_STORAGE_KEY));
    return SPEEDS.includes(value) ? value : 1;
  }

  let simulationSpeed = loadInitialSpeed();

  function formatSpeed(value) {
    return `${String(value).replace(".", ",")}×`;
  }

  function setStatus(text) {
    engineStatus.textContent = text;
  }

  function updatePauseLabels() {
    pauseButton.textContent = running ? "Pausar" : "Continuar";
    const doc = iframe.contentDocument;
    for (const id of ["pauseBtn", "mobilePauseBtn"]) {
      const button = doc?.getElementById(id);
      if (button) button.textContent = running ? "Pausar" : "Continuar";
    }
  }

  function updateSpeedLabels() {
    const label = formatSpeed(simulationSpeed);
    speedSelect.value = String(simulationSpeed);
    cycleSpeedButton.textContent = label;
    cycleSpeedButton.setAttribute("aria-label", `Velocidade atual ${label}. Toque para alternar.`);

    const innerSelect = iframe.contentDocument?.getElementById("externalSpeedSelect");
    if (innerSelect) innerSelect.value = String(simulationSpeed);
    const innerLabel = iframe.contentDocument?.getElementById("externalSpeedReadout");
    if (innerLabel) innerLabel.textContent = label;
  }

  function setSimulationSpeed(value, announce = true) {
    const numeric = Number(value);
    if (!SPEEDS.includes(numeric)) return simulationSpeed;
    simulationSpeed = numeric;
    safeStorageSet(SPEED_STORAGE_KEY, String(numeric));
    accumulator = Math.min(accumulator, FIXED_DT * 2);
    updateSpeedLabels();
    if (announce) setStatus(`Velocidade ${formatSpeed(simulationSpeed)}`);
    return simulationSpeed;
  }

  function cycleSimulationSpeed() {
    const index = SPEEDS.indexOf(simulationSpeed);
    return setSimulationSpeed(SPEEDS[(index + 1) % SPEEDS.length]);
  }

  function toggleRunning() {
    running = !running;
    accumulator = 0;
    lastFrame = performance.now();
    updatePauseLabels();
    setStatus(running ? `Executando em ${formatSpeed(simulationSpeed)}` : "Simulação pausada");
  }

  function interceptInnerButton(button) {
    if (!button || button.dataset.externalController === "1") return;
    button.dataset.externalController = "1";
    button.onclick = null;
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleRunning();
    }, true);
  }

  function installInnerControls() {
    const doc = iframe.contentDocument;
    if (!doc) return;

    interceptInnerButton(doc.getElementById("pauseBtn"));
    interceptInnerButton(doc.getElementById("mobilePauseBtn"));

    const controls = doc.querySelector("#controlsPanel .controls");
    if (controls && !doc.getElementById("externalSpeedSelect")) {
      const label = doc.createElement("label");
      label.className = "control";
      label.textContent = "Velocidade ";

      const select = doc.createElement("select");
      select.id = "externalSpeedSelect";
      for (const value of SPEEDS) {
        const option = doc.createElement("option");
        option.value = String(value);
        option.textContent = formatSpeed(value);
        select.appendChild(option);
      }
      select.value = String(simulationSpeed);
      select.addEventListener("change", event => setSimulationSpeed(event.target.value));
      label.appendChild(select);
      controls.insertBefore(label, controls.querySelector("#gravityBtn") || null);
    }

    const physicsGrid = doc.querySelector("#physicsPanel .grid");
    if (physicsGrid && !doc.getElementById("externalSpeedReadout")) {
      const row = doc.createElement("span");
      row.className = "wide";
      row.append("ritmo ");
      const strong = doc.createElement("strong");
      strong.id = "externalSpeedReadout";
      strong.textContent = formatSpeed(simulationSpeed);
      row.appendChild(strong);
      physicsGrid.appendChild(row);
    }

    updatePauseLabels();
    updateSpeedLabels();
  }

  async function waitForApi(timeoutMs = 8000) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const candidate = iframe.contentWindow?.__portalDebug;
      if (candidate?.step && candidate?.setPaused) return candidate;
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    return null;
  }

  async function onCoreLoaded() {
    innerWindow = iframe.contentWindow;
    api = await waitForApi();
    if (!api) {
      setStatus("Núcleo incompatível: API de depuração não encontrada");
      setup.hidden = false;
      setupStatus.textContent = "O HTML selecionado não parece ser a versão final do simulador.";
      return;
    }

    api.setPaused(true);
    installInnerControls();
    setup.hidden = true;
    accumulator = 0;
    lastFrame = performance.now();
    setStatus(`Executando em ${formatSpeed(simulationSpeed)}`);
  }

  function loadCoreHtml(html, persist = true) {
    if (!html || !/<html[\s>]/i.test(html) || !/__portalDebug/.test(html)) {
      setupStatus.textContent = "Arquivo inválido ou versão sem window.__portalDebug.";
      return false;
    }

    api = null;
    setupStatus.textContent = "Carregando o motor…";
    if (persist && !safeStorageSet(CORE_STORAGE_KEY, html)) {
      setupStatus.textContent = "Carregando. O navegador não permitiu guardar o núcleo permanentemente.";
    }
    iframe.srcdoc = html;
    return true;
  }

  coreFile.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setupStatus.textContent = `Lendo ${file.name}…`;
    try {
      const html = await file.text();
      loadCoreHtml(html, true);
    } catch (error) {
      setupStatus.textContent = `Falha ao ler o arquivo: ${error.message}`;
    }
  });

  iframe.addEventListener("load", onCoreLoaded);
  pauseButton.addEventListener("click", toggleRunning);
  speedSelect.addEventListener("change", event => setSimulationSpeed(event.target.value));
  cycleSpeedButton.addEventListener("click", cycleSimulationSpeed);
  changeCoreButton.addEventListener("click", () => {
    running = false;
    api = null;
    iframe.removeAttribute("srcdoc");
    safeStorageRemove(CORE_STORAGE_KEY);
    coreFile.value = "";
    setup.hidden = false;
    setupStatus.textContent = "Escolha o núcleo HTML novamente.";
    updatePauseLabels();
    setStatus("Sem núcleo");
  });

  addEventListener("keydown", event => {
    if (event.target?.matches?.("input, select, textarea")) return;
    if (event.key === " ") {
      event.preventDefault();
      toggleRunning();
    } else if (event.key === "[") {
      const index = Math.max(0, SPEEDS.indexOf(simulationSpeed) - 1);
      setSimulationSpeed(SPEEDS[index]);
    } else if (event.key === "]") {
      const index = Math.min(SPEEDS.length - 1, SPEEDS.indexOf(simulationSpeed) + 1);
      setSimulationSpeed(SPEEDS[index]);
    } else if (event.key === "\\") {
      setSimulationSpeed(1);
    }
  });

  document.addEventListener("visibilitychange", () => {
    lastFrame = performance.now();
    accumulator = 0;
  });

  function animationLoop(now) {
    const rawDt = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
    lastFrame = now;

    if (api && running) {
      if (now - lastInnerPauseSync > 1000) {
        api.setPaused(true);
        lastInnerPauseSync = now;
        installInnerControls();
      }

      accumulator += rawDt * simulationSpeed;
      let steps = Math.floor(accumulator / FIXED_DT);
      const maxStepsPerFrame = matchMedia("(pointer: coarse)").matches ? 36 : 48;
      overloaded = steps > maxStepsPerFrame;
      if (overloaded) {
        steps = maxStepsPerFrame;
        accumulator = Math.min(accumulator, FIXED_DT * maxStepsPerFrame * 2);
      }

      if (steps > 0) {
        const started = performance.now();
        try {
          api.step(steps);
          accumulator -= steps * FIXED_DT;
          const spent = performance.now() - started;
          setStatus(overloaded || spent > 24
            ? `${formatSpeed(simulationSpeed)} · proteção de desempenho ativa`
            : `Executando em ${formatSpeed(simulationSpeed)}`);
        } catch (error) {
          running = false;
          setStatus(`Erro do motor: ${error.message}`);
          updatePauseLabels();
        }
      }
    }

    requestAnimationFrame(animationLoop);
  }

  updateSpeedLabels();
  updatePauseLabels();
  requestAnimationFrame(animationLoop);

  const storedCore = safeStorageGet(CORE_STORAGE_KEY);
  if (storedCore) {
    setupStatus.textContent = "Núcleo salvo encontrado. Carregando…";
    loadCoreHtml(storedCore, false);
  }
})();
