document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const targetDateParam = urlParams.get("date");

  const todayStr = targetDateParam || new Date().toLocaleDateString("ru-RU");

  // Форматирование даты в шапке
  const dateParts = todayStr.split(".");
  let displayDateStr = todayStr;
  if (dateParts.length === 3) {
    const dObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    displayDateStr = dObj.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  }
  document.getElementById("current-date").innerText = displayDateStr;

  const medsList = document.getElementById("meds-list");
  const addMedBtn = document.getElementById("add-med-btn");

  // Дефолтные обязательные препараты (назначенные врачом)
  const DEFAULT_PRESCRIPTIONS = [
    {
      name: "Пароксетин",
      dose: "10мг",
      time: "09:00",
      isPrescription: true,
      taken: false,
    },
    {
      name: "Оланзапин",
      dose: "5мг",
      time: "21:00",
      isPrescription: true,
      taken: false,
    },
  ];

  function getSavedPrescriptions() {
    const saved = localStorage.getItem("user_prescriptions");
    if (!saved) {
      localStorage.setItem(
        "user_prescriptions",
        JSON.stringify(DEFAULT_PRESCRIPTIONS),
      );
      return DEFAULT_PRESCRIPTIONS;
    }
    return JSON.parse(saved);
  }

  // Создание строки препарата в форме дня
  function addMedRow(
    name = "",
    dose = "",
    time = "",
    taken = false,
    isPrescription = false,
  ) {
    const row = document.createElement("div");
    row.className = `med-row ${isPrescription ? "prescription-row" : ""}`;
    row.dataset.prescription = isPrescription ? "true" : "false";

    const defaultTime =
      time ||
      new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

    // Если препарат не является обязательным, кнопка чекбокса скрывается
    row.innerHTML = `
            ${
              isPrescription
                ? `
                <button type="button" class="med-check-btn ${taken ? "active" : ""}" title="Отметка о приеме обязательного препарата">
                    <i class="fa-solid fa-check"></i>
                </button>
            `
                : `<div style="width: 28px;"></div>`
            }
            <input type="text" class="med-name" placeholder="Препарат" value="${name}">
            <input type="text" class="med-dose" placeholder="Доза" value="${dose}">
            <input type="time" class="med-time" value="${defaultTime}">
            <button type="button" class="remove-med-btn"><i class="fa-solid fa-xmark"></i></button>
        `;

    const checkBtn = row.querySelector(".med-check-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        checkBtn.classList.toggle("active");
      });
    }

    row.querySelector(".remove-med-btn").addEventListener("click", () => {
      row.remove();
    });

    medsList.appendChild(row);
  }

  if (addMedBtn) {
    addMedBtn.addEventListener("click", () =>
      addMedRow("", "", "", false, false),
    );
  }

  // Выбор настроения 1-10
  const numButtons = document.querySelectorAll(".num-btn");
  const overallMoodInput = document.getElementById("overallMood");

  numButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      numButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      overallMoodInput.value = btn.getAttribute("data-value");
    });
  });

  // Переключение симптомов
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
    });
  });

  // Загрузка существующей записи ИЛИ создание новой
  const existingLogs = JSON.parse(localStorage.getItem("health_logs") || "[]");
  let targetLogIndex = existingLogs.findIndex((log) => log.date === todayStr);

  if (targetLogIndex !== -1) {
    const logData = existingLogs[targetLogIndex];

    document.getElementById("record-status-label").innerText = targetDateParam
      ? `Редактирование (${todayStr})`
      : "Запись за сегодня";
    document.getElementById("submit-btn").innerText =
      `Сохранить данные (${todayStr})`;

    if (logData.overallMood) {
      overallMoodInput.value = logData.overallMood;
      const btn = document.querySelector(
        `.num-btn[data-value="${logData.overallMood}"]`,
      );
      if (btn) btn.classList.add("active");
    }

    if (logData.emotions) {
      Object.keys(logData.emotions).forEach((key) => {
        const input = document.getElementById(`input-${key}`);
        const valDisplay = document.getElementById(`val-${key}`);
        if (input) {
          input.value = logData.emotions[key];
          if (valDisplay) valDisplay.innerText = logData.emotions[key];
        }
      });
    }

    document.getElementById("mood-notes").value = logData.moodNotes || "";
    document.getElementById("sleep-hours").value = logData.sleepHours || "";

    if (logData.sleepQuality) {
      document.getElementById("input-sleepQuality").value =
        logData.sleepQuality;
      document.getElementById("val-sleep").innerText = logData.sleepQuality;
    }

    if (logData.meds && logData.meds.length > 0) {
      logData.meds.forEach((m) =>
        addMedRow(m.name, m.dose, m.time, m.taken, m.isPrescription),
      );
    } else {
      getSavedPrescriptions().forEach((p) =>
        addMedRow(p.name, p.dose, p.time, false, true),
      );
    }

    if (logData.symptoms) {
      chips.forEach((chip) => {
        if (logData.symptoms.includes(chip.getAttribute("data-symptom"))) {
          chip.classList.add("active");
        }
      });
    }

    document.getElementById("general-notes").value = logData.generalNotes || "";
  } else {
    const prescriptions = getSavedPrescriptions();
    prescriptions.forEach((p) =>
      addMedRow(p.name, p.dose, p.time, false, true),
    );
  }

  // ОКНО "НАЗНАЧЕННЫЕ ПРЕПАРАТЫ"
  const prescModal = document.getElementById("prescriptions-modal");
  const openPrescBtn = document.getElementById("open-prescriptions-btn");
  const closePrescBtn = document.getElementById("close-prescriptions-btn");
  const prescList = document.getElementById("prescriptions-list");
  const addPrescBtn = document.getElementById("add-prescription-btn");
  const savePrescBtn = document.getElementById("save-prescriptions-btn");

  function renderPrescriptionModalList() {
    prescList.innerHTML = "";
    const currentList = getSavedPrescriptions();
    currentList.forEach((p) => addPrescriptionModalRow(p.name, p.dose, p.time));
  }

  function addPrescriptionModalRow(name = "", dose = "", time = "") {
    const row = document.createElement("div");
    row.className = "med-row";
    row.style.gridTemplateColumns = "1fr 70px 70px 32px";
    row.innerHTML = `
            <input type="text" class="presc-name" placeholder="Название" value="${name}">
            <input type="text" class="presc-dose" placeholder="Доза" value="${dose}">
            <input type="time" class="presc-time" value="${time || "09:00"}">
            <button type="button" class="remove-med-btn"><i class="fa-solid fa-xmark"></i></button>
        `;
    row
      .querySelector(".remove-med-btn")
      .addEventListener("click", () => row.remove());
    prescList.appendChild(row);
  }

  if (openPrescBtn) {
    openPrescBtn.addEventListener("click", () => {
      renderPrescriptionModalList();
      prescModal.classList.add("active");
    });
  }

  if (closePrescBtn) {
    closePrescBtn.addEventListener("click", () =>
      prescModal.classList.remove("active"),
    );
  }
  if (addPrescBtn) {
    addPrescBtn.addEventListener("click", () => addPrescriptionModalRow());
  }

  if (savePrescBtn) {
    savePrescBtn.addEventListener("click", () => {
      const newPrescriptions = [];
      prescList.querySelectorAll(".med-row").forEach((row) => {
        const name = row.querySelector(".presc-name").value.trim();
        const dose = row.querySelector(".presc-dose").value.trim();
        const time = row.querySelector(".presc-time").value;
        if (name) {
          newPrescriptions.push({
            name,
            dose,
            time,
            isPrescription: true,
            taken: false,
          });
        }
      });

      localStorage.setItem(
        "user_prescriptions",
        JSON.stringify(newPrescriptions),
      );
      prescModal.classList.remove("active");

      if (targetLogIndex === -1) {
        medsList.innerHTML = "";
        newPrescriptions.forEach((p) =>
          addMedRow(p.name, p.dose, p.time, false, true),
        );
      }
    });
  }

  // Сохранение записи дня
  const form = document.getElementById("tracker-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const medsData = [];
      document.querySelectorAll("#meds-list .med-row").forEach((row) => {
        const name = row.querySelector(".med-name").value.trim();
        const dose = row.querySelector(".med-dose").value.trim();
        const time = row.querySelector(".med-time").value;
        const checkBtn = row.querySelector(".med-check-btn");
        const taken = checkBtn ? checkBtn.classList.contains("active") : true;
        const isPrescription = row.dataset.prescription === "true";

        if (name) {
          medsData.push({ name, dose, time, taken, isPrescription });
        }
      });

      const selectedSymptoms = [];
      document.querySelectorAll(".chip.active").forEach((chip) => {
        selectedSymptoms.push(chip.getAttribute("data-symptom"));
      });

      const logData = {
        id:
          targetLogIndex !== -1 ? existingLogs[targetLogIndex].id : Date.now(),
        date: todayStr,
        updatedAt: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        overallMood: overallMoodInput.value || null,
        emotions: {
          fear: form.fear.value,
          anxiety: form.anxiety.value,
          shame: form.shame.value,
          guilt: form.guilt.value,
          sadness: form.sadness.value,
          anger: form.anger.value,
        },
        moodNotes: form.moodNotes.value,
        sleepHours: form.sleepHours.value,
        sleepQuality: form.sleepQuality.value,
        meds: medsData,
        symptoms: selectedSymptoms,
        generalNotes: form.generalNotes.value,
      };

      const logs = JSON.parse(localStorage.getItem("health_logs") || "[]");
      targetLogIndex = logs.findIndex((log) => log.date === todayStr);

      if (targetLogIndex !== -1) {
        logs[targetLogIndex] = logData;
      } else {
        logs.unshift(logData);
      }

      localStorage.setItem("health_logs", JSON.stringify(logs));

      const submitBtn = document.getElementById("submit-btn");
      submitBtn.innerText = "Сохранено!";
      submitBtn.style.background = "#2b6cb0";

      setTimeout(() => {
        window.location.href = "stats.html";
      }, 800);
    });
  }
});
