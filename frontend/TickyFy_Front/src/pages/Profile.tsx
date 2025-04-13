import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../index.css";
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

const Profile = () => {
  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect only when loading is done and no user
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login"); // Or replace with "/"
    }
  }, [user, loading, navigate]);

  const [showPassword, setShowPassword] = useState(false);

  // Initialize formData with existing and new User properties
  const [formData, setFormData] = useState({
    f_name: user?.f_name || "",
    l_name: user?.l_name || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || "",
    nationality: user?.nationality || "", // Now part of User
    birthdate: user?.birthdate || "",    // Now part of User
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center px-4 py-10"
      style={{ backgroundImage: "url('/images/stadiumbg.jpg')" }}
    >
      <div className="text-center text-white mb-8">
        <img
          src={user?.picture || "/default-avatar.png"}
          alt="profile-pic"
          className="w-24 h-24 rounded-full object-cover border-4 border-white mx-auto"
        />
        <h2 className="text-xl font-semibold mt-4">
          {formData.f_name} {formData.l_name}
        </h2>
        <p className="text-gray-300">{formData.email}</p>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {/* First & Last Name */}
        <div className="flex gap-4">
          <input
            type="text"
            name="f_name"
            value={formData.f_name}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-white/20 text-white placeholder-gray-200 px-4 py-2 backdrop-blur-md"
            placeholder="First name*"
            required
          />
          <input
            type="text"
            name="l_name"
            value={formData.l_name}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-white/20 text-white placeholder-gray-200 px-4 py-2 backdrop-blur-md"
            placeholder="Last name*"
            required
          />
        </div>

        {/* Password (only for normal login) */}
        {!user?.loginMethod && (
          <div className="w-full relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full rounded-lg bg-white/20 text-white placeholder-gray-200 px-4 py-2 backdrop-blur-md pr-10"
              placeholder="Password*"
              required
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        {/* Phone Number */}
        <PhoneInput
          country={"us"}
          value={formData.phone}
          onChange={handlePhoneChange}
          inputProps={{ name: "phone", required: true }}
          inputClass="!w-full !rounded-lg !bg-white/20 !text-white !backdrop-blur-md !placeholder-gray-200"
          containerClass="!w-full"
          placeholder="Phone number*"
        />

        {/* Nationality */}
        <input
          type="text"
          name="nationality"
          value={formData.nationality}
          onChange={handleInputChange}
          className="w-full rounded-lg bg-white/20 text-white placeholder-gray-200 px-4 py-2 backdrop-blur-md"
          placeholder="Nationality"
        />

        {/* Birthdate */}
        <input
          type="date"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleInputChange}
          className="w-full rounded-lg bg-white/20 text-white placeholder-gray-200 px-4 py-2 backdrop-blur-md"
          placeholder="Birthdate"
        />

        {/* Language Buttons */}
        <div className="text-white mt-4">
          <p className="mb-2">Language</p>
          <div className="flex gap-4">
            <button className="rounded-lg px-4 py-2 bg-white/20 text-white backdrop-blur-md">
              English
            </button>
            <button className="rounded-lg px-4 py-2 bg-white/20 text-white backdrop-blur-md">
              French
            </button>
            <button className="rounded-lg px-4 py-2 bg-white/20 text-white backdrop-blur-md">
              العربية
            </button>
          </div>
        </div>

        {/* Email at Bottom */}
        <div className="flex items-center gap-2 text-white mt-6">
          <FaEnvelope />
          <span>{formData.email}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;