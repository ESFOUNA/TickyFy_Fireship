  import { useEffect, useState, useRef } from "react";
  import PhoneInput from "react-phone-input-2";
  import "react-phone-input-2/lib/style.css";
  import { useAuth } from "../context/AuthContext";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  import API_BASE_URL from "../api/api";
  import { toast } from "react-toastify";

  // Define the allowed language values
  type Language = "English" | "French" | "Arabic";

  // Define the structure of the translation object
  interface Translation {
    firstName: string;
    lastName: string;
    birthdate: string; // Added birthdate
    password: string;
    phone: string;
    language: string;
    email: string;
    signup: string;
    hide: string;
    show: string;
    consentSMS: string;
    consentTerms: string;
    consentFacial: string;
    termsTitle: string;
    termsIntro: string;
    term1: string;
    term2: string;
    term3: string;
    term4: string;
    term5: string;
    term6: string;
    captureTitle: string;
    captureButton: string;
    cancelButton: string;
  }

  // Define the structure of the translations object
  interface Translations {
    English: Translation;
    French: Translation;
    Arabic: Translation;
  }

  const Signup = () => {
    const [f_name, setFName] = useState("");
    const [l_name, setLName] = useState("");
    const [birthdate, setBirthdate] = useState(""); // New birthdate state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showCameraPopup, setShowCameraPopup] = useState(false);
    const [facingConsent, setFacingConsent] = useState(false);
    const [language, setLanguage] = useState<Language>("English");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<Blob | null>(null);

    const { user, login } = useAuth();
    const navigate = useNavigate();

    const isRTL = language === "Arabic";

    useEffect(() => {
      if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    useEffect(() => {
      return () => stopCamera();
    }, []);

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast.error("Unable to access camera: " + err.message);
        setShowCameraPopup(false);
        setFacingConsent(false);
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    const captureImage = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) setCapturedImage(blob);
            },
            "image/jpeg",
            0.9
          );
        }
      }
    };

    const handleCaptureAndSubmit = async () => {
      captureImage();
      setTimeout(async () => {
        if (capturedImage) {
          stopCamera();
          setShowCameraPopup(false);
          await completeSignup();
        } else {
          toast.error(translations[language].captureTitle + " failed");
        }
      }, 100);
    };

    const validateForm = () => {
      if (!f_name.trim()) {
        toast.error(`${translations[language].firstName} ${isRTL ? "مطلوب" : "is required"}`);
        return false;
      }
      if (!l_name.trim()) {
        toast.error(`${translations[language].lastName} ${isRTL ? "مطلوب" : "is required"}`);
        return false;
      }
      if (!birthdate) {
        toast.error(`${translations[language].birthdate} ${isRTL ? "مطلوب" : "is required"}`);
        return false;
      }
      if (!email.trim()) {
        toast.error(`${translations[language].email} ${isRTL ? "مطلوب" : "is required"}`);
        return false;
      }
      if (!password.trim()) {
        toast.error(`${translations[language].password} ${isRTL ? "مطلوب" : "is required"}`);
        return false;
      }
      if (!phone || phone.length < 10) {
        toast.error(`${translations[language].phone} ${isRTL ? "يجب أن يكون 10 أرقام على الأقل" : "must be at least 10 digits"}`);
        return false;
      }
      return true;
    };

    const completeSignup = async () => {
      try {
        const formData = new FormData();
        formData.append("f_name", f_name.trim());
        formData.append("l_name", l_name.trim());
        formData.append("birthdate", birthdate); // Added birthdate to form data
        formData.append("email", email.trim());
        formData.append("password", password.trim());
        formData.append("phone", phone.trim());

        if (facingConsent && capturedImage) {
          formData.append("facePhoto", capturedImage, "facePhoto.jpg");
        }

        const res = await axios.post(`${API_BASE_URL}/auth/signup`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const { jwt } = res.data;
        localStorage.setItem("token", jwt);
        login({ name: `${f_name} ${l_name}`, email });
        toast.success(translations[language].signup + " successful!");
        navigate("/");
      } catch (err) {
        console.error("Signup error:", err.response?.data || err.message);
        toast.error("Signup failed!");
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      if (facingConsent) {
        setShowCameraPopup(true);
        await startCamera();
      } else {
        await completeSignup();
      }
    };

    const handleLanguageChange = (lang: Language) => {
      setLanguage(lang);
    };

    const translations: Translations = {
      English: {
        firstName: "First name",
        lastName: "Last name",
        birthdate: "Birthdate", // Added birthdate
        password: "Password",
        phone: "Phone number",
        language: "Language",
        email: "Email address",
        signup: "Sign up",
        hide: "Hide",
        show: "Show",
        consentSMS: "I consent to receive SMS, emails, updates, events, and promotions.",
        consentTerms: "I agree to the Terms and Privacy Policy.",
        consentFacial: "I consent to use Facial recognition (Optional)",
        termsTitle: "Facial recognition",
        termsIntro: "By signing up, you agree to the following terms:",
        term1: "Facial recognition is used solely for the following purposes:",
        term2: "Identity verification and user authentication",
        term3: "Ticket validation and access control",
        term4: "Fraud prevention and enhanced security",
        term5: "We do not use facial recognition for surveillance, behavioral analysis, or third-party advertising.",
        term6: "You must provide explicit, informed, and verifiable consent before using the facial recognition feature. You may withdraw your consent at any time by disabling the feature or contacting us directly.",
        captureTitle: "Capture Facial Image",
        captureButton: "Capture & Continue",
        cancelButton: "Cancel",
      },
      French: {
        firstName: "Prénom",
        lastName: "Nom de famille",
        birthdate: "Date de naissance", // Added birthdate
        password: "Mot de passe",
        phone: "Numéro de téléphone",
        language: "Langue",
        email: "Adresse e-mail",
        signup: "S'inscrire",
        hide: "Cacher",
        show: "Montrer",
        consentSMS: "J'accepte de recevoir des SMS, des e-mails, des mises à jour, des événements et des promotions.",
        consentTerms: "J'accepte les Conditions et la Politique de confidentialité.",
        consentFacial: "J'accepte d'utiliser la reconnaissance faciale (facultatif)",
        termsTitle: "Reconnaissance faciale",
        termsIntro: "En vous inscrivant, vous acceptez les conditions suivantes :",
        term1: "La reconnaissance faciale est utilisée uniquement pour :",
        term2: "Vérification d'identité et authentification des utilisateurs",
        term3: "Validation des billets et contrôle d'accès",
        term4: "Prévention des fraudes et sécurité renforcée",
        term5: "Nous n'utilisons pas la reconnaissance faciale pour la surveillance, l'analyse comportementale ou la publicité tierce.",
        term6: "Vous devez donner un consentement explicite, informé et vérifiable avant d'utiliser la fonctionnalité de reconnaissance faciale. Vous pouvez retirer votre consentement à tout moment en désactivant la fonctionnalité ou en nous contactant directement.",
        captureTitle: "Capturer une image faciale",
        captureButton: "Capturer et continuer",
        cancelButton: "Annuler",
      },
      Arabic: {
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        birthdate: "تاريخ الميلاد", // Added birthdate
        password: "كلمة المرور",
        phone: "رقم الهاتف",
        language: "اللغة",
        email: "البريد الإلكتروني",
        signup: "التسجيل",
        hide: "إخفاء",
        show: "إظهار",
        consentSMS: "أوافق على تلقي الرسائل النصية، البريد الإلكتروني، التحديثات، الأحداث، والعروض الترويجية.",
        consentTerms: "أوافق على الشروط وسياسة الخصوصية.",
        consentFacial: "أوافق على استخدام التعرف على الوجه (اختياري)",
        termsTitle: "التعرف على الوجه",
        termsIntro: "بالتسجيل، فإنك توافق على الشروط التالية:",
        term1: "يتم استخدام التعرف على الوجه فقط للأغراض التالية:",
        term2: "التحقق من الهوية وتسجيل دخول المستخدم",
        term3: "التحقق من التذاكر والتحكم في الوصول",
        term4: "منع الاحتيال وتعزيز الأمان",
        term5: "لا نستخدم التعرف على الوجه للمراقبة، التحليل السلوكي، أو الإعلانات من جهات خارجية.",
        term6: "يجب عليك تقديم موافقة صريحة ومستنيرة وقابلة للتحقق قبل استخدام ميزة التعرف على الوجه. يمكنك سحب موافقتك في أي وقت عن طريق تعطيل الميزة أو التواصل معنا مباشرة.",
        captureTitle: "التقاط صورة الوجه",
        captureButton: "التقاط ومتابعة",
        cancelButton: "إلغاء",
      },
    };

    return (
      <div
        className={`w-full min-h-screen flex justify-center items-center bg-cover bg-center pt-24 pb-12 px-4`}
        style={{ backgroundImage: "url('/stadium.jpg')" }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex md:flex-row justify-center items-center gap-6 w-full max-w-5xl mx-auto">
          <div className="bg-white bg-opacity-15 backdrop-blur-lg shadow-2xl rounded-xl p-8 w-full max-w-[480px]">
            <div className="flex justify-center items-center mb-4">
              <img src="/mlogo.png" alt="Logo" className="h-16 w-auto object-contain" />
            </div>
            <h2 className="text-center text-3xl font-bold text-white mb-6">
              {translations[language].signup}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`grid grid-cols-2 gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <input
                  type="text"
                  placeholder={translations[language].firstName}
                  className="input-field"
                  value={f_name}
                  onChange={(e) => setFName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder={translations[language].lastName}
                  className="input-field"
                  value={l_name}
                  onChange={(e) => setLName(e.target.value)}
                  required
                />
              </div>

              <input
                type="date"
                placeholder={translations[language].birthdate}
                className="input-field mb-4"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder={translations[language].email}
                className="input-field mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PhoneInput
                country={"us"}
                value={phone}
                onChange={(phone) => setPhone(phone)}
                inputProps={{ required: true }}
                inputStyle={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "25px",
                  backgroundColor: "rgba(255,255,255,0.3)",
                  color: "white",
                  paddingLeft: isRTL ? "15px" : "50px",
                  paddingRight: isRTL ? "50px" : "15px",
                  border: "none",
                  backdropFilter: "blur(8px)",
                  direction: isRTL ? "rtl" : "ltr",
                  textAlign: isRTL ? "right" : "left",
                }}
                buttonStyle={{
                  borderRadius: isRTL ? "0 25px 25px 0" : "25px 0 0 25px",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(255,255,255,0.5)",
                }}
                containerStyle={{ direction: isRTL ? "rtl" : "ltr" }}
              />

              <div className="relative mt-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={translations[language].password}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`absolute ${isRTL ? "left-4" : "right-4"} top-3 text-white text-sm`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? translations[language].hide : translations[language].show}
                </button>
              </div>

              <div className={`text-xs text-white space-y-2 mt-4 ${isRTL ? "text-right" : "text-left"}`}>
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" required />
                  <span>{translations[language].consentSMS}</span>
                </label>
                <label className="flex items-start gap-2 text-xs">
                  <input type="checkbox" className="mt-1" required />
                  <span>
                    {translations[language].consentTerms}{" "}
                    <a href="#" className="underline">
                      {translations[language].consentTerms.includes("Terms")
                        ? "Terms"
                        : translations[language].consentTerms.includes("Conditions")
                        ? "Conditions"
                        : "الشروط"}
                    </a>{" "}
                    {translations[language].consentTerms.includes("and")
                      ? "and"
                      : translations[language].consentTerms.includes("et")
                      ? "et"
                      : "و"}{" "}
                    <a href="#" className="underline">
                      {translations[language].consentTerms.includes("Privacy Policy")
                        ? "Privacy Policy"
                        : translations[language].consentTerms.includes("Politique de confidentialité")
                        ? "Politique de confidentialité"
                        : "سياسة الخصوصية"}
                    </a>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={facingConsent}
                    onChange={async (e) => {
                      setFacingConsent(e.target.checked);
                      if (e.target.checked) {
                        try {
                          await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                        } catch (err) {
                          toast.error("Camera access denied");
                          setFacingConsent(false);
                        }
                      }
                    }}
                  />
                  <span>{translations[language].consentFacial}</span>
                </label>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 font-medium">{translations[language].language}</h3>
                <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} gap-4`}>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("English")}
                    className={`bg-white bg-opacity-15 px-4 py-2 rounded-xl ${
                      language === "English" ? "text-lime-400" : "text-white opacity-70"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("French")}
                    className={`bg-white bg-opacity-15 px-4 py-2 rounded-xl ${
                      language === "French" ? "text-lime-400" : "text-white opacity-70"
                    }`}
                  >
                    French
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("Arabic")}
                    className={`bg-white bg-opacity-15 px-4 py-2 rounded-xl ${
                      language === "Arabic" ? "text-lime-400" : "text-white opacity-70"
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-white py-2.5 rounded-full shadow-xl text-lg font-bold text-black"
              >
                {translations[language].signup}
              </button>
            </form>
          </div>

          {showCameraPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">{translations[language].captureTitle}</h3>
                <video ref={videoRef} className="w-full mb-4 rounded" autoPlay playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} gap-4`}>
                  <button
                    onClick={handleCaptureAndSubmit}
                    className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    {translations[language].captureButton}
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      setShowCameraPopup(false);
                      setCapturedImage(null);
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                  >
                    {translations[language].cancelButton}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-[300px] p-6 bg-black bg-opacity-70 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-3 neon-text">
              {translations[language].termsTitle}
            </h3>
            <p className={`text-sm text-gray-300 ${isRTL ? "text-right" : "text-left"}`}>
              {translations[language].termsIntro}
            </p>
            <ul className={`text-sm text-gray-300 list-disc ${isRTL ? "list-inside pr-4" : "list-inside pl-4"} mt-2 space-y-1`}>
              <li>{translations[language].term1}</li>
              <li>{translations[language].term2}</li>
              <li>{translations[language].term3}</li>
              <li>{translations[language].term4}</li>
              <li>{translations[language].term5}</li>
              <li>{translations[language].term6}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  export default Signup;

  // Ensure this CSS is in your global stylesheet
  const neonStyles = `
    .neon-text {
      color: #fff;
      text-shadow:
        0 0 5px #fff,
        0 0 10px #fff,
        0 0 20px #0ff,
        0 0 40px #0ff,
        0 0 80px #0ff;
    }

    .input-field {
      width: 100%;
      padding: 12px;
      border-radius: 25px;
      background-color: rgba(255, 255, 255, 0.3);
      color: white;
      border: none;
      backdrop-filter: blur(8px);
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  `;