const CLOUD_NAME = "dshw6g6o8";
const UPLOAD_PRESET = "eazylink_uploads";

// Your WhatsApp number (digits only, no +)
const WHATSAPP_NUMBER = "27748475208";

const form = document.getElementById("eazylinkForm");
const serviceSelect = document.getElementById("serviceSelect");
const uploadSection = document.getElementById("uploadSection");
const statusText = document.getElementById("statusText");
const submitBtn = document.getElementById("submitBtn");

serviceSelect.addEventListener("change", () => {
  const service = serviceSelect.value;
  uploadSection.hidden = !service || service === "General Enquiry";
});

async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "eazylink/uploads");

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusText.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading...";

  try {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("serviceSelect").value;
    const pkg = document.getElementById("packageSelect").value;
    const msg = document.getElementById("message").value.trim();

    const cvFile = document.getElementById("cvFile").files[0];
    const qualFile = document.getElementById("qualFile").files[0];
    const otherFile = document.getElementById("otherFile").files[0];

    const links = {};

    // Upload only if service is NOT General Enquiry
    if (service !== "General Enquiry" && service !== "") {
      if (cvFile) links.CV = await uploadToCloudinary(cvFile);
      if (qualFile) links.Qualifications = await uploadToCloudinary(qualFile);
      if (otherFile) links.Supporting = await uploadToCloudinary(otherFile);
    }

    // Build WhatsApp message
    let waMessage =
`Hi, I would like to submit a request to EazyLink Careers.

Name: ${fullName}
Email: ${email}
Phone: ${phone}
Service: ${service}
Package: ${pkg}
Message: ${msg || "N/A"}`;

    if (Object.keys(links).length > 0) {
      waMessage += `

Uploaded Files (Cloudinary links):`;
      for (const k in links) {
        waMessage += `
${k}: ${links[k]}`;
      }
    }

    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    submitBtn.textContent = "Opening WhatsApp...";
    window.open(waLink, "_blank");

    statusText.textContent = "Done. WhatsApp opened with your request.";
    form.reset();
    uploadSection.hidden = true;

  } catch (err) {
    console.error(err);
    statusText.textContent = "Something went wrong while uploading. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Request";
  }
});


const careerGoal = document.getElementById("careerGoal");
const packageMatch = document.getElementById("packageMatch");
const packageSelect = document.getElementById("packageSelect");

function updatePackageMatch() {
  const match = document.getElementById(careerGoal.value);
  packageMatch.hidden = !match;

  if (match) {
    packageMatch.href = "#" + match.id;
    packageMatch.firstChild.textContent = "View " + match.querySelector("h3").textContent + " ";
  } else {
    packageMatch.removeAttribute("href");
  }
}

careerGoal.addEventListener("change", updatePackageMatch);
updatePackageMatch();
document.getElementById("packageFinder").hidden = false;

document.querySelectorAll(".packages a[data-package]").forEach((link) => {
  link.addEventListener("click", () => {
    const option = packageSelect.querySelector(`option[data-package="${link.dataset.package}"]`);
    if (option) packageSelect.value = option.value;
  });
});

const checklistItems = Array.from(document.querySelectorAll("#applicationChecklist input"));
const checklistProgress = document.getElementById("checklistProgress");
const checklistKey = "eazylink-application-checklist";
const resetChecklist = document.getElementById("resetChecklist");

try {
  const saved = JSON.parse(localStorage.getItem(checklistKey) || "[]");
  if (Array.isArray(saved)) {
    checklistItems.forEach((item) => { item.checked = saved.includes(item.value); });
  }
} catch {
  // The checklist remains usable when browser storage is unavailable.
}

function updateChecklist() {
  const completed = checklistItems.filter((item) => item.checked).map((item) => item.value);
  checklistProgress.textContent = `${completed.length} of ${checklistItems.length} steps complete`;
  return completed;
}

function saveChecklist() {
  const completed = updateChecklist();
  try {
    localStorage.setItem(checklistKey, JSON.stringify(completed));
  } catch {
    // Progress still works for the current page.
  }
}

checklistItems.forEach((item) => item.addEventListener("change", saveChecklist));
resetChecklist.addEventListener("click", () => {
  checklistItems.forEach((item) => { item.checked = false; });
  saveChecklist();
});
updateChecklist();
document.getElementById("checklistActions").hidden = false;

const resourceCategory = document.getElementById("resourceCategory");
const resources = document.querySelectorAll("[data-resource]");

function filterResources() {
  resources.forEach((resource) => {
    resource.hidden = resourceCategory.value !== "all" && resource.dataset.resource !== resourceCategory.value;
  });
}

resourceCategory.addEventListener("change", filterResources);
filterResources();
document.getElementById("resourceFilter").hidden = false;

const askForm = document.getElementById("askForm");
const askQuestion = document.getElementById("askQuestion");

askForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = askQuestion.value.trim();
  if (!question) {
    askQuestion.focus();
    return;
  }
  const message = encodeURIComponent("Hi EazyLink Careers, I have a question:\n\n" + question);
  window.location.assign(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`);
});
askForm.hidden = false;

const chatLaunch = document.getElementById("chatLaunch");
const chatPopup = document.getElementById("chatPopup");
const whatsappLaunch = document.getElementById("whatsappLaunch");
const whatsappPopup = document.getElementById("whatsappPopup");

if (typeof chatPopup.showModal === "function") {
  chatLaunch.hidden = false;
  [[chatLaunch, chatPopup], [whatsappLaunch, whatsappPopup]].forEach(([launcher, popup]) => {
    launcher.setAttribute("aria-controls", popup.id);
    launcher.setAttribute("aria-expanded", "false");
    launcher.addEventListener("click", (event) => {
      event.preventDefault();
      popup.showModal();
      launcher.setAttribute("aria-expanded", "true");
    });
    popup.addEventListener("close", () => launcher.setAttribute("aria-expanded", "false"));
  });
}

const chatTopics = {
  packages: ["Compare packages for school leavers, graduates, professionals, and teams.", "#materials", "Compare packages"],
  cv: ["The new graduate package includes CV writing, LinkedIn optimisation, and interview coaching.", "#graduates", "View the graduate package"],
  jobs: ["Browse vacancies on the jobs portal, or use the application checklist to prepare.", "#opportunities", "Explore job resources"],
  study: ["The matriculant package includes help with course choices, study applications, and bursaries.", "#matriculants", "View the matriculant package"],
};

const chatAnswer = document.getElementById("chatAnswer");
const chatNext = document.getElementById("chatNext");

chatPopup.querySelectorAll("[data-topic]").forEach((button) => {
  button.addEventListener("click", () => {
    const [answer, href, label] = chatTopics[button.dataset.topic];
    chatAnswer.textContent = answer;
    chatNext.href = href;
    chatNext.textContent = label;
    chatNext.hidden = false;
  });
});

[chatNext, document.getElementById("chatHuman")].forEach((link) => {
  link.addEventListener("click", () => chatPopup.close());
});
