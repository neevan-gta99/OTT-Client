import { useEffect, useState } from "react";
import { BASE_URL } from "./config/apiconfig";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store";
import { fetchTransactionsData, fetchUserData, resetTransactions } from "./redux/features/userAuthSlice";
import { coinPlans } from "../utils/coinPackages.ts";
import Navbar from "./Navbar.tsx";
import { useNavigate } from "react-router-dom";

function BuyCoins() {
  const [loading, setLoading] = useState<string | null>(null);
  const user_data = useSelector((state: RootState) => state.userAuth.userData);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const loginTimestamp = useSelector((state: RootState) => state.userAuth.loginTimestamp);

  useEffect(() => {
    if (loginTimestamp == null) {
      navigate("/login");
    }
  }, [loginTimestamp, navigate]);

  const handlePayment = async (rupees: number, coins: number) => {
    try {
      setLoading(`${rupees}`);

      const res = await fetch(`${BASE_URL}/api/users/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: user_data?.userName,
          amount: rupees * 100,
          coins: coins
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const orderData = await res.json();

      const options = {
        key: "rzp_test_WQMBQcFpAW335k",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "OTT Demo",
        description: `Buy ${coins} Coins worth ₹${rupees}`,
        order_id: orderData.id,
        handler: function (response: any) {
          fetch(`${BASE_URL}/api/users/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              username: user_data?.userName,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              coins: coins
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert(`Success! ${coins} coins added to your account.`);
                if (user_data?.userName) {
                  dispatch(fetchUserData(user_data.userName));
                  dispatch(resetTransactions());
                  dispatch(fetchTransactionsData({
                    username: user_data.userName,
                    offset: 0
                  }));
                }
                navigate("/profile");
              } else {
                alert("Payment verification failed. Contact support.");
              }
            })
            .catch(err => {
              console.error("Verification error:", err);
              alert("Verification failed. Please contact support.");
            })
            .finally(() => {
              setLoading(null);
            });
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
            console.log("Payment cancelled");
          }
        },
        theme: { color: "#3399cc" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment. Please try again.");
      setLoading(null);
    }
  };

  if (!user_data) return <div>Loading...</div>;

  return (
    <>
      <Navbar data={user_data} />
      <div className="buy-coins-page p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">💰 Buy Coins</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="py-3 px-6 text-left">Coins</th>
                <th className="py-3 px-6 text-left">Price (₹)</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {coinPlans.map((plan, index) => {
                return (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-100 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="py-3 px-6 font-semibold">{plan.coins} 🪙</td>
                    <td className="py-3 px-6">₹{plan.rupees}</td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() => handlePayment(plan.rupees, plan.coins)}
                        disabled={loading === `${plan.rupees}`}
                        className={`px-4 py-2 rounded text-white font-semibold transition ${loading === `${plan.rupees}`
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                        {loading === `${plan.rupees}` ? "Processing..." : "Buy Now"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          ⚡ Secure payments via Razorpay | Coins added instantly after success
        </p>
      </div>
    </>
  );
}

export default BuyCoins;