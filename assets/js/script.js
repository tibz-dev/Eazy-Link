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
