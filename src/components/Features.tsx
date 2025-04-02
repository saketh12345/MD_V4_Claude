
import { Shield, Clock, Users, Lock, FileText, Globe } from "lucide-react";

const Features = () => {
  const featuresList = [
    {
      icon: <Shield className="h-10 w-10 text-medivault-blue" />,
      title: "Secure Storage",
      description: "Your medical records are encrypted with hospital-grade security protocols.",
    },
    {
      icon: <Clock className="h-10 w-10 text-medivault-blue" />,
      title: "24/7 Access",
      description: "Access your medical information anytime, anywhere using any device.",
    },
    {
      icon: <Users className="h-10 w-10 text-medivault-blue" />,
      title: "Family Accounts",
      description: "Manage records for your entire family with our multi-user accounts.",
    },
    {
      icon: <Lock className="h-10 w-10 text-medivault-blue" />,
      title: "Privacy Controls",
      description: "You control who can access your medical information and when.",
    },
    {
      icon: <FileText className="h-10 w-10 text-medivault-blue" />,
      title: "Document Scanning",
      description: "Easily scan and upload paper records to your secure digital vault.",
    },
    {
      icon: <Globe className="h-10 w-10 text-medivault-blue" />,
      title: "Provider Network",
      description: "Share records securely with healthcare providers in our network.",
    },
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medivault-darkGray mb-4">
            Features That Make a Difference
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            MediVault combines security, convenience, and innovation to give you the best experience in managing your medical records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-medivault-darkGray mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
