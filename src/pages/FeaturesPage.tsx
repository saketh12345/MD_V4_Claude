
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import { Shield, Clock, Users, Lock, FileText, Globe, CreditCard, Smartphone, Heart, Zap } from "lucide-react";

const FeaturesPage = () => {
  const additionalFeatures = [
    {
      icon: <CreditCard className="h-10 w-10 text-medivault-blue" />,
      title: "Insurance Management",
      description: "Store and manage your insurance details and claims in one secure location.",
    },
    {
      icon: <Smartphone className="h-10 w-10 text-medivault-blue" />,
      title: "Mobile App",
      description: "Access your medical records on the go with our dedicated mobile application.",
    },
    {
      icon: <Heart className="h-10 w-10 text-medivault-blue" />,
      title: "Health Tracking",
      description: "Monitor your health metrics and spot trends with our integrated tracking tools.",
    },
    {
      icon: <Zap className="h-10 w-10 text-medivault-blue" />,
      title: "Fast Access",
      description: "Quick emergency access options for critical medical information.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-medivault-darkGray mb-6">
              Our <span className="text-medivault-blue">Features</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover all the powerful tools and capabilities that make MediVault the premier platform for medical records management.
            </p>
          </div>
        </div>

        <Features />

        <section className="py-16 px-6 bg-medivault-gray">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-medivault-darkGray mb-4">
                Advanced Features
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Beyond the basics, MediVault offers sophisticated tools to enhance your healthcare management experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm flex">
                  <div className="mr-6 mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-medivault-darkGray mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
