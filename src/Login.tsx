import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { BASE_URL } from "./config/apiconfig.ts";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store.ts";
import { setLoginSession } from "./redux/features/userAuthSlice.ts";

type LoginFormData = {
  userName: string;
  password: string;
};

const Login = () => {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const loginTimestamp = useSelector((state: RootState) => state.userAuth.loginTimestamp);

  useEffect(() => {
    if (loginTimestamp != null) {
      navigate("/profile");
    }
  }, [loginTimestamp, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    mode: "onChange",
  });

  const getErrorMessage = (error: any): string | null => {
    if (!error) return null;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
    }
    return null;
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");

    try {
      const loginRes = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: data.userName,
          password: data.password,
        }),
        credentials: "include",
      });

      const userJsonData = await loginRes.json();

      if (loginRes.ok) {
        dispatch(
          setLoginSession({
            timestamp: Date.now(),
            userData: userJsonData.userData,
          })
        );
        navigate(`/profile`);
        console.log(userJsonData.message || "Login successful");
      } else {
        setServerError(userJsonData.message || "Login failed.");
      }
    } catch (error) {
      setServerError("Unable to connect to server. Please try again later.");
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <h1>Login Page</h1>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Username Field */}
            <div>
              {errors?.userName && (
                <p style={{ color: "red", margin: "0 0 5px 0" }}>
                  {getErrorMessage(errors.userName)}
                </p>
              )}
              <input
                {...register("userName", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                placeholder="Username"
                autoComplete="username"
                style={{
                  border: errors.userName ? "1px solid red" : undefined,
                  padding: "8px",
                  width: "200px",
                }}
              />
            </div>
            <br /><br />

            {/* Password Field */}
            <div>
              {errors?.password && (
                <p style={{ color: "red", margin: "0 0 5px 0" }}>
                  {getErrorMessage(errors.password)}
                </p>
              )}
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter Password"
                type="password"
                autoComplete="current-password"
                style={{
                  border: errors.password ? "1px solid red" : undefined,
                  padding: "8px",
                  width: "200px",
                }}
              />
            </div>
            <br />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              style={{
                padding: "8px 16px",
                cursor: isSubmitting || !isValid ? "not-allowed" : "pointer",
                opacity: isSubmitting || !isValid ? 0.6 : 1,
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Server Error Message */}
            {serverError && (
              <p style={{ color: "red", marginTop: "10px" }}>{serverError}</p>
            )}
          </form>
        </div>

      </div>
    </>
  );
};

export default Login;