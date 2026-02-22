import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router";
import { BASE_URL } from './config/apiconfig.ts'
import { setLoginSession } from "./redux/features/userAuthSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store.ts";

const SignUp = () => {
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const loginTimestamp = useSelector((state: RootState) => state.userAuth.loginTimestamp);

    // ✅ Agar already logged in hai to profile par bhejo
    useEffect(() => {
        if (loginTimestamp != null) {
            navigate('/profile');
        }
    }, [loginTimestamp, navigate]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm({ mode: "onChange" });

    const onSubmit = async (data: any) => {
        setServerError("");

        try {
            const registerPayload = {
                fullName: data.fullName,
                userName: data.userName,
                email: data.email,
                password: data.password
            };

            const registerRes = await fetch(`${BASE_URL}/api/users/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerPayload),
                credentials: "include",
            });

            const userJsonData = await registerRes.json();

            if (registerRes.ok) {
                dispatch(setLoginSession({
                    timestamp: Date.now(),
                    userData: userJsonData.userData
                }));
                navigate(`/profile`); // ✅ Sirf /profile par bhejo
                console.log(userJsonData.message || "Registration successful");
            } else {
                setServerError(userJsonData.message || "Registration failed.");
            }
        } catch (error) {
            setServerError("Server error during registration.");
            console.error("Registration failed:", error);
        }
    };

    const getErrorMessage = (error: any): string | null => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (typeof error === 'object' && error !== null) {
            if ('message' in error && typeof error.message === 'string') {
                return error.message;
            }
        }
        return null;
    };

    return (
        <>
            <div className="signup-wrapper">

                <h1>Sign Up Page</h1>
                <br /><br />
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Full Name Field */}
                        {errors?.fullName && (
                            <p style={{ color: "red" }}>
                                {getErrorMessage(errors.fullName)}
                            </p>
                        )}
                        <input
                            {...register("fullName", {
                                required: "Name is required",
                                minLength: {
                                    value: 2,
                                    message: "Name must be at least 2 characters"
                                }
                            })}
                            placeholder="Full Name"
                        />
                        <br /><br />

                        {/* Username Field */}
                        {errors?.userName && (
                            <p style={{ color: "red" }}>
                                {getErrorMessage(errors.userName)}
                            </p>
                        )}
                        <input
                            {...register("userName", {
                                required: "Username is required",
                                minLength: {
                                    value: 3,
                                    message: "Username must be at least 3 characters"
                                }
                            })}
                            placeholder="Username"
                        />
                        <br /><br />

                        {/* Email Field */}
                        {errors?.email && (
                            <p style={{ color: "red" }}>
                                {getErrorMessage(errors.email)}
                            </p>
                        )}
                        <input
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            placeholder="Email"
                            type="email"
                        />
                        <br /><br />

                        {/* Password Field */}
                        {errors?.password && (
                            <p style={{ color: "red" }}>
                                {getErrorMessage(errors.password)}
                            </p>
                        )}
                        <input
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                            placeholder="Password"
                            type="password"
                        />
                        <br /><br />

                        {/* Confirm Password Field */}
                        {errors?.confirmPassword && (
                            <p style={{ color: "red" }}>
                                {getErrorMessage(errors.confirmPassword)}
                            </p>
                        )}
                        <input
                            {...register("confirmPassword", {
                                required: "Confirm your password",
                                validate: (value) => value === watch("password") || "Passwords do not match"
                            })}
                            placeholder="Confirm Password"
                            type="password"
                        />
                        <br /><br />

                        <button type="submit" disabled={isSubmitting || !isValid}>
                            {isSubmitting ? "Submitting..." : "Sign Up"}
                        </button>

                        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
                    </form>
                </div>
            </div>
        </>
    );
};

export default SignUp;