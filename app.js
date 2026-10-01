const BANKS = [
  { name: "IBKHCM", bin: "970456" },
  { name: "HSBC", bin: "458761" },
  { name: "Oceanbank", bin: "970414" },
  { name: "BaoVietBank", bin: "970438" },
  { name: "UnitedOverseas", bin: "970458" },
  { name: "Eximbank", bin: "970431" },
  { name: "DBSBank", bin: "796500" },
  { name: "PGBank", bin: "970430" },
  { name: "LienVietPostBank", bin: "970449" },
  { name: "Nonghyup", bin: "801011" },
  { name: "KookminHN", bin: "970462" },
  { name: "VietCapitalBank", bin: "970454" },
  { name: "VIB", bin: "970441" },
  { name: "ViettelMoney", bin: "971005" },
  { name: "NamABank", bin: "970428" },
  { name: "COOPBANK", bin: "970446" },
  { name: "DongABank", bin: "970406" },
  { name: "VietABank", bin: "970427" },
  { name: "SeABank", bin: "970440" },
  { name: "KBank", bin: "668888" },
  { name: "SCB", bin: "970429" },
  { name: "IBKHN", bin: "970455" },
  { name: "HDBank", bin: "970437" },
  { name: "SHB", bin: "970443" },
  { name: "SaigonBank", bin: "970400" },
  { name: "KookminHCM", bin: "970463" },
  { name: "VNPTMoney", bin: "971011" },
  { name: "BacABank", bin: "970409" },
  { name: "PVcomBank", bin: "970412" },
  { name: "ShinhanBank", bin: "970424" },
  { name: "CIMB", bin: "422589" },
  { name: "NCB", bin: "970419" },
  { name: "MSB", bin: "970426" },
  { name: "IndovinaBank", bin: "970434" },
  { name: "OCB", bin: "970448" },
  { name: "PublicBank", bin: "970439" },
  { name: "HongLeong", bin: "970442" },
  { name: "VietBank", bin: "970433" },
  { name: "CAKE", bin: "546034" },
  { name: "StandardChartered", bin: "970410" },
  { name: "CBBank", bin: "970444" },
  { name: "KienLongBank", bin: "970452" },
  { name: "Techcombank", bin: "970407" },
  { name: "Ubank", bin: "546035" },
  { name: "Umee", bin: "963399" },
  { name: "Liobank", bin: "963369" },
  { name: "Vikki", bin: "963311" },
  { name: "GPBank", bin: "970408" },
  { name: "Timo", bin: "963388" },
  { name: "ABBANK", bin: "970425" },
  { name: "VRB", bin: "970421" },
  { name: "Woori", bin: "970457" },
  { name: "VietinBank", bin: "970415" },
  { name: "MBBank", bin: "970422" },
  { name: "TPBank", bin: "970423" },
  { name: "ACB", bin: "970416" },
  { name: "Sacombank", bin: "970403" },
  { name: "Agribank", bin: "970405" },
  { name: "VPBank", bin: "970432" },
  { name: "Vietcombank", bin: "970436" },
  { name: "BIDV", bin: "970418" },
  { name: "AUTO 54", bin: "111154" },
  { name: "AutomationTest Bank", bin: "555567" },
  { name: "Anz Bank Napas", bin: "980484" },
  { name: "Andrew", bin: "980485" },
  { name: "KDT", bin: "999999" },
  { name: "Momo", bin: "971025" },
  { name: "ZaloPay", bin: "971101" },
  { name: "PayX", bin: "971009" },
  { name: "VBSP", bin: "999888" },
  { name: "CITI", bin: "533948" },
  { name: "BNP PARIBAS HCM", bin: "963666" },
  { name: "DeutscheBank", bin: "963601" },
  { name: "Bank of China (HK) - HCM", bin: "963688" },
  { name: "Keb Hana - HN", bin: "970467" },
  { name: "SINOPAC", bin: "970465" },
  { name: "Cathay - HCM", bin: "168999" },
  { name: "BIDC", bin: "555666" },
  { name: "ICBCHN", bin: "963669" },
  { name: "Keb Hana - HCM", bin: "970466" },
  { name: "BNPPARIBAS HN", bin: "963668" },
  { name: "TNEX", bin: "963326" },
  { name: "Tài chính Shinhan", bin: "963368" },
  { name: "MVAS", bin: "971032" },
  { name: "PVcomBank Pay", bin: "971133" },
  { name: "Mirae Asset", bin: "977777" },
];

const form = document.querySelector("#qrForm");
const bankInput = document.querySelector("#bank");
const bankSuggestions = document.querySelector("#bankSuggestions");
const accountInput = document.querySelector("#accountNumber");
const nameInput = document.querySelector("#accountName");
const qrWrap = document.querySelector("#qrCanvasWrap");
const fallbackQr = document.querySelector("#fallbackQr");
const payloadOutput = document.querySelector("#payloadOutput");
const downloadBtn = document.querySelector("#downloadBtn");
const summaryBank = document.querySelector("#summaryBank");
const summaryAccount = document.querySelector("#summaryAccount");
const summaryName = document.querySelector("#summaryName");

let currentQrCanvas = null;
let currentFallbackUrl = "";
let selectedBank = null;
let activeSuggestionIndex = -1;

function normalizeSearch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

function getMatchingBanks(query) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return BANKS;

  return BANKS.filter((bank) =>
    normalizeSearch(`${bank.name} ${bank.bin}`).includes(normalizedQuery),
  );
}

function closeBankSuggestions() {
  bankSuggestions.classList.add("hidden");
  bankInput.setAttribute("aria-expanded", "false");
  bankInput.removeAttribute("aria-activedescendant");
  activeSuggestionIndex = -1;
}

function selectBank(bank) {
  selectedBank = bank;
  bankInput.value = `${bank.name} - ${bank.bin}`;
  closeBankSuggestions();
}

function renderBankSuggestions() {
  const matches = getMatchingBanks(bankInput.value);
  bankSuggestions.innerHTML = "";
  activeSuggestionIndex = -1;

  matches.forEach((bank, index) => {
    const option = document.createElement("li");
    option.id = `bank-option-${index}`;
    option.role = "option";
    option.dataset.index = String(index);
    option.innerHTML = `<span>${bank.name}</span><strong>${bank.bin}</strong>`;
    option.addEventListener("mousedown", (event) => {
      event.preventDefault();
      selectBank(bank);
    });
    bankSuggestions.appendChild(option);
  });

  if (!matches.length) {
    const empty = document.createElement("li");
    empty.className = "no-suggestion";
    empty.textContent = /^\d{6,12}$/.test(bankInput.value.trim())
      ? "Nhấn Tạo QR để dùng mã BIN này"
      : "Không tìm thấy ngân hàng phù hợp";
    bankSuggestions.appendChild(empty);
  }

  bankSuggestions.classList.remove("hidden");
  bankInput.setAttribute("aria-expanded", "true");
}

function handleBankKeydown(event) {
  const options = [...bankSuggestions.querySelectorAll('[role="option"]')];
  if (event.key === "Escape") return closeBankSuggestions();
  if (!options.length || !["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;

  if (event.key === "Enter" && activeSuggestionIndex < 0) return;
  event.preventDefault();
  if (event.key === "ArrowDown") {
    activeSuggestionIndex = (activeSuggestionIndex + 1) % options.length;
  } else if (event.key === "ArrowUp") {
    activeSuggestionIndex = (activeSuggestionIndex - 1 + options.length) % options.length;
  } else {
    return options[activeSuggestionIndex].dispatchEvent(new MouseEvent("mousedown"));
  }

  options.forEach((option, index) => option.classList.toggle("active", index === activeSuggestionIndex));
  bankInput.setAttribute("aria-activedescendant", options[activeSuggestionIndex].id);
}

function formatField(id, value) {
  const stringValue = String(value);
  return `${id}${String(stringValue.length).padStart(2, "0")}${stringValue}`;
}

function normalizeAccountName(name) {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function crc16CcittFalse(payload) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildVietQrPayload({ bankBin, accountNumber, accountName }) {
  const guid = formatField("00", "A000000727");
  const bankInfo =
    formatField("00", bankBin) + formatField("01", accountNumber);
  const consumerAccount = formatField("01", bankInfo);
  const serviceCode = formatField("02", "QRIBFTTA");
  const merchantAccountInfo = formatField(
    "38",
    guid + consumerAccount + serviceCode,
  );

  const withoutCrc = [
    formatField("00", "01"),
    formatField("01", "12"),
    merchantAccountInfo,
    formatField("53", "704"),
    formatField("58", "VN"),
    formatField("59", accountName.slice(0, 25) || "ACCOUNT HOLDER"),
    formatField("60", "VIETNAM"),
    "6304",
  ].join("");

  return `${withoutCrc}${crc16CcittFalse(withoutCrc)}`;
}

function getSelectedBank() {
  if (selectedBank && bankInput.value === `${selectedBank.name} - ${selectedBank.bin}`) {
    return selectedBank;
  }

  const value = bankInput.value.trim();
  const normalizedValue = normalizeSearch(value);
  const bank = BANKS.find(
    (item) => item.bin === value || normalizeSearch(item.name) === normalizedValue,
  );
  if (bank) return bank;

  return /^\d{6,12}$/.test(value)
    ? { bin: value, name: `BIN ${value}` }
    : { bin: "", name: "" };
}

function setError(message) {
  qrWrap.innerHTML = `<span class="error">${message}</span>`;
  fallbackQr.classList.add("hidden");
  payloadOutput.value = "";
  downloadBtn.disabled = true;
  currentQrCanvas = null;
  currentFallbackUrl = "";
}

async function renderQr(payload) {
  qrWrap.innerHTML = "";
  fallbackQr.classList.add("hidden");
  currentQrCanvas = null;
  currentFallbackUrl = "";

  if (window.QRCode?.toCanvas) {
    const canvas = document.createElement("canvas");
    await window.QRCode.toCanvas(canvas, payload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    });
    qrWrap.appendChild(canvas);
    currentQrCanvas = canvas;
    downloadBtn.disabled = false;
    return;
  }

  const params = new URLSearchParams({
    size: "320x320",
    margin: "12",
    data: payload,
  });
  currentFallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?${params}`;
  fallbackQr.onerror = () => {
    setError(
      "Không tải được thư viện tạo QR. Vui lòng kiểm tra kết nối mạng rồi thử lại.",
    );
  };
  fallbackQr.src = currentFallbackUrl;
  qrWrap.appendChild(fallbackQr);
  fallbackQr.classList.remove("hidden");
  downloadBtn.disabled = false;
}

async function handleSubmit(event) {
  event.preventDefault();

  const bank = getSelectedBank();
  const bankBin = bank.bin;
  const accountNumber = accountInput.value.replace(/\D/g, "");
  const accountName = normalizeAccountName(nameInput.value);

  if (!bankBin) {
    setError("Vui lòng chọn một ngân hàng trong danh sách gợi ý hoặc nhập mã BIN từ 6 đến 12 chữ số.");
    bankInput.focus();
    return;
  }

  if (!/^\d{4,20}$/.test(accountNumber)) {
    setError("Số tài khoản cần từ 4 đến 20 chữ số.");
    return;
  }

  if (!accountName) {
    setError("Vui lòng nhập tên chủ tài khoản.");
    return;
  }

  const payload = buildVietQrPayload({ bankBin, accountNumber, accountName });
  payloadOutput.value = payload;
  summaryBank.textContent = bank.name;
  summaryAccount.textContent = accountNumber;
  summaryName.textContent = accountName;

  try {
    await renderQr(payload);
  } catch (error) {
    setError("Không tạo được mã QR. Vui lòng kiểm tra lại thông tin.");
  }
}

function downloadQr() {
  if (currentQrCanvas) {
    const link = document.createElement("a");
    link.href = currentQrCanvas.toDataURL("image/png");
    link.download = "vietqr-chuyen-khoan.png";
    link.click();
    return;
  }

  if (currentFallbackUrl) {
    window.open(currentFallbackUrl, "_blank", "noopener,noreferrer");
  }
}

bankInput.addEventListener("input", () => {
  selectedBank = null;
  renderBankSuggestions();
});
bankInput.addEventListener("focus", renderBankSuggestions);
bankInput.addEventListener("keydown", handleBankKeydown);
bankInput.addEventListener("blur", () => setTimeout(closeBankSuggestions, 100));
form.addEventListener("submit", handleSubmit);
downloadBtn.addEventListener("click", downloadQr);
