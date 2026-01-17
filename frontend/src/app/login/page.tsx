"use client";
import BaseButton from "@/components/BaseButton";
import BaseInput from "@/components/inputs/BaseInput";
import { apiFetch } from "@/utils/api";
import React from "react";

export default function LoginPage() {
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const email = data.email;
    const password = data.password;

    try {
      const data = await apiFetch("/auth/login/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setSuccess("Login successful. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <div>
        <h1 className="mb-6 text-center text-2xl font-medium">Login</h1>
        <div>
          <form
            onSubmit={handleLoginSubmit}
            id="login"
            className="flex flex-col gap-4"
          >
            <BaseInput type="text" name="email" placeholder="Email" required />
            <BaseInput
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <a className="cursor-pointer text-gray-500 transition-colors hover:text-white">
              Forgot password?
            </a>
            <BaseButton buttonType="submit" fullWidth>
              Login
            </BaseButton>
          </form>
          {error && <p className="text-red mt-4 text-center">{error}</p>}
          {success && <p className="text-green mt-4 text-center">{success}</p>}
        </div>
      </div>
    </div>
  );
}
