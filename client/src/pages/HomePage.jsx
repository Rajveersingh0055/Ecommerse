import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

// ─── Helper ──────────────────────────────────────────────────────────────────
const isEmailAddress = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function HomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState(""); // shown in UI when email not configured
  const [channel, setChannel] = useState(""); // "email" or "phone"
  const inputRefs = useRef([]);

  // ── Step 1: send OTP via real API ─────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault();

    if (step === "email") {
      if (!emailOrPhone.trim()) return;

      try {
        setLoading(true);
        setOtpError("");
        const { data } = await api.post("/auth/send-otp", {
          identifier: emailOrPhone.trim(),
        });
        setChannel(
          data.channel ||
            (isEmailAddress(emailOrPhone.trim()) ? "email" : "phone"),
        );
        // If server returns the OTP (demo/mock mode), store & auto-fill it
        if (data.otp) {
          setDemoOtp(data.otp);
          setOtp(data.otp.split(""));
        }
        setStep("otp");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Failed to send OTP. Please try again.";
        setOtpError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Step 2: verify OTP via real API ──────────────────────────────────────
    const value = otp.join("");
    if (value.length < 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setOtpError("");
      const { data } = await api.post("/auth/verify-otp", {
        identifier: emailOrPhone.trim(),
        otp: value,
      });
      // Save logged-in user and JWT token
      sessionStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) sessionStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      // Show error message from server if available
      const msg =
        err?.response?.data?.message ||
        "Invalid or expired OTP. Please try again.";
      setOtpError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index, value) {
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = cleanValue;
      return next;
    });

    if (otpError) setOtpError("");

    if (cleanValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    try {
      setLoading(true);
      setOtpError("");
      setOtp(["", "", "", "", "", ""]);
      setDemoOtp("");
      const { data } = await api.post("/auth/send-otp", {
        identifier: emailOrPhone.trim(),
      });
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

  return (
    <section className="login-page">
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
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login to your Productr Account</h2>

          {step === "email" ? (
            <>
              <label htmlFor="emailOrPhone">Email or Phone number</label>
              <input
                id="emailOrPhone"
                type="text"
                placeholder="Enter email or phone number"
                value={emailOrPhone}
                onChange={(event) => setEmailOrPhone(event.target.value)}
              />
              {otpError && <p className="otp-error">{otpError}</p>}
              <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Login"}
              </button>
            </>
          ) : (
            <>
              <label>Enter OTP</label>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#888",
                  marginTop: "-8px",
                }}
              >
                {channel === "email"
                  ? `📧 OTP sent to ${emailOrPhone}`
                  : `📱 OTP sent to ${emailOrPhone}`}
              </p>

              {/* Demo banner — shown only when server returns OTP directly */}
              {demoOtp && (
                <div
                  style={{
                    background: "#fff8e1",
                    border: "1px solid #ffd54f",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "0.8rem",
                    color: "#795548",
                    marginBottom: "4px",
                  }}
                >
                  <strong>Demo mode:</strong> Your OTP is{" "}
                  <strong
                    style={{
                      letterSpacing: "4px",
                      fontSize: "1rem",
                      color: "#1a237e",
                    }}
                  >
                    {demoOtp}
                  </strong>{" "}
                  (auto-filled below)
                </div>
              )}

              <div className="otp-row">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputRefs.current[index] = node;
                    }}
                    value={digit}
                    onChange={(event) =>
                      handleOtpChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    className={`otp-box ${otpError ? "otp-box-error" : ""}`}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              {otpError && <p className="otp-error">{otpError}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Enter your OTP"}
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

        {step === "email" && (
          <div className="signup-box">
            <span>Don&apos;t have a Productr Account?</span>
            <Link to="/signup">SignUp Here</Link>
          </div>
        )}
      </div>
    </section>
  );
}
