// pages/home/page.tsx
import React from "react";
import { SignInButton } from "@clerk/nextjs";
import { type Metadata } from "next";
export const metadata: Metadata = {
  title: "PassGuard",
  description: "Dashboard",
};

const HomePage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex flex-col font-sans">
      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-6 text-center mt-24">
          <div className="bg-white/30 backdrop-blur-md rounded-xl p-25 shadow-xl border border-gray-200">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
              Secure Your Digital Life with{" "}
              <span className="text-blue-600">PassGuard</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Military-grade encryption. Cross-platform access. Seamless
              experience.
            </p>

            <div className="flex justify-center space-x-4">
              <SignInButton>
                <button className="cursor-pointer w-60 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-transform">
                  Get Started
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 mt-20 mb-20 pb-60 pt-70">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-16">
            Why Choose PassGuard?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "End-to-End Encryption",
                desc: "Your data is protected with top-tier encryption, ensuring only you have access.",
              },
              {
                title: "Cross-Platform Access",
                desc: "Access your password vault from any device, anywhere in the world.",
              },
              {
                title: "User-Friendly Interface",
                desc: "Manage your credentials effortlessly with a sleek and intuitive dashboard.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transform transition-transform duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          © {new Date().getFullYear()} PassGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
