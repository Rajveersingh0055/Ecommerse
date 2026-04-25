import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

const isEmailAddress = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function SignUpPage() {
  const navigate = useNavigate();

  // ── Step state: "form" → "otp" ───────────────────────────────────────────
  const [step, setStep] = useState("form");

  // ── Form fields ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");

  // ── OTP state ─────────────────────────────────────────────────────────────
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [channel, setChannel] = useState("email");
  const [identifier, setIdentifier] = useState(""); // what OTP was sent to

  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // ── Step 1: Register → API creates user + sends OTP ──────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) return setFormError("Full name is required");
    if (!form.email.trim() && !form.phone.trim())
      return setFormError("Please enter your email or phone number");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });

      const sentTo = form.email.trim() || form.phone.trim();
      setIdentifier(sentTo);
      setChannel(data.channel || (isEmailAddress(sentTo) ? "email" : "phone"));

      if (data.otp) {
        setDemoOtp(data.otp);
        setOtp(data.otp.split(""));
      }

      setStep("otp");
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  async function handleVerify(e) {
    e.preventDefault();
    setOtpError("");

    const value = otp.join("");
    if (value.length < 6) return setOtpError("Please enter the 6-digit OTP");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify-otp", {
        identifier,
        otp: value,
      });

      // Save user info to sessionStorage so other pages can read it
      sessionStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) sessionStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setOtpError(
        err?.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input helpers ────────────────────────────────────────────────────
  function handleOtpChange(index, value) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (otpError) setOtpError("");
    if (clean && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  }

  async function handleResend() {
    try {
      setLoading(true);
      setOtpError("");
      setOtp(["", "", "", "", "", ""]);
      setDemoOtp("");
      // Re-register sends a new OTP via send-otp
      const { data } = await api.post("/auth/send-otp", { identifier });
      if (data.otp) {
        setDemoOtp(data.otp);
        setOtp(data.otp.split(""));
      }
    } catch {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="login-page">
      {/* Left visual panel — same as login */}
      <div className="login-visual">
        <div className="login-logo">
          Productr <span className="logo-dot" />
        </div>
        <div className="phone-card">
          <div className="phone-image">
            <img
              src="/e3dec1cff3f99e02403f915c26ff16944053aa4f.jpg"
              alt="Runner"
              style={{
                width: "100%",
                height: "340px",
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(3, 3, 3, 0.12))",
                position: "relative",
                top: "0px",
                left: "0px",
              }}
            />
          </div>
          <p>Uplist your product to market</p>
        </div>
      </div>

      <div className="login-content">
        <form
          className="login-form"
          onSubmit={step === "form" ? handleRegister : handleVerify}
        >
          {step === "form" ? (
            <>
              <h2>Create your Productr Account</h2>

              <label htmlFor="su-name">Full Name</label>
              <input
                id="su-name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                autoFocus
              />

              <label htmlFor="su-email">Email Address</label>
              <input
                id="su-email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />

              <div className="su-divider">
                <span>or</span>
              </div>

              <label htmlFor="su-phone">Phone Number</label>
              <input
                id="su-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
              />

              {formError && <p className="su-error">{formError}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account & Get OTP"}
              </button>
            </>
          ) : (
            <>
              <h2>Verify your OTP</h2>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#555e78",
                  marginTop: "-4px",
                }}
              >
                {channel === "email" ? "📧" : "📱"} OTP sent to{" "}
                <strong>{identifier}</strong>
              </p>

              {/* Demo banner */}
              {demoOtp && (
                <div className="demo-otp-banner">
                  <strong>Demo mode:</strong> Your OTP is{" "}
                  <strong className="demo-otp-value">{demoOtp}</strong>{" "}
                  <span>(auto-filled)</span>
                </div>
              )}

              <label>Enter 6-digit OTP</label>
              <div className="otp-row">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(n) => (inputRefs.current[i] = n)}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`otp-box ${otpError ? "otp-box-error" : ""}`}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {otpError && <p className="su-error">{otpError}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <p className="resend-text">
                Didn&apos;t receive OTP?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResend();
                  }}
                >
                  Resend
                </a>
              </p>
            </>
          )}
        </form>

        <div
          className="signup-box"
          style={{ marginTop: step === "form" ? "40px" : "230px" }}
        >
          <span>Already have a Productr Account?</span>
          <Link to="/">Login Here</Link>
        </div>
      </div>
    </section>
  );
}
