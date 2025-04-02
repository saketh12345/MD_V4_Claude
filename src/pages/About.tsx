
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CallToAction from "@/components/CallToAction";
import { Shield, Clock, Users } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Jennifer Lee",
      role: "CEO & Founder",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      bio: "Former hospital CTO with 15+ years of experience in healthcare IT systems."
    },
    {
      name: "Mark Wilson",
      role: "Chief Technology Officer",
      image: "https://randomuser.me/api/portraits/men/5.jpg",
      bio: "Cybersecurity expert specialized in protecting sensitive medical data."
    },
    {
      name: "Sarah Thompson",
      role: "Head of Product",
      image: "https://randomuser.me/api/portraits/women/6.jpg",
      bio: "Former healthcare administrator passionate about patient-centered solutions."
    }
  ];

  const values = [
    {
      icon: <Shield className="h-10 w-10 text-medivault-blue" />,
      title: "Security First",
      description: "We prioritize the security and privacy of your medical data above all else."
    },
    {
      icon: <Clock className="h-10 w-10 text-medivault-blue" />,
      title: "Accessibility",
      description: "Making healthcare information accessible to everyone, anytime they need it."
    },
    {
      icon: <Users className="h-10 w-10 text-medivault-blue" />,
      title: "Patient Empowerment",
      description: "We believe patients should have control over their own medical information."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-medivault-darkGray mb-6">
              About <span className="text-medivault-blue">MediVault</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're on a mission to transform how individuals store, access, and share their medical records.
            </p>
          </div>
        </div>

        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-medivault-darkGray mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  MediVault was founded in 2020 by Dr. Jennifer Lee, who experienced firsthand the challenges of accessing and managing medical records across different healthcare providers.
                </p>
                <p className="text-gray-600 mb-4">
                  After struggling to compile her family's medical history during an emergency, she envisioned a secure platform that would give patients control over their medical information while maintaining the highest security standards.
                </p>
                <p className="text-gray-600">
                  Today, MediVault serves thousands of users across the country, partnering with healthcare providers to create a seamless, secure experience for managing medical records.
                </p>
              </div>
              <div className="order-first md:order-last">
                <img
                  src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg?w=900&t=st=1704294988~exp=1704295588~hmac=d130f218a9e1c1f6465a0a09619a8d9a71e3d38ea8ae1e9e2bc55acd3de008dd"
                  alt="Medical team illustration"
                  className="rounded-lg w-full h-auto shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-medivault-gray">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-medivault-darkGray mb-6">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                These core principles guide everything we do at MediVault.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-medivault-darkGray mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-medivault-darkGray mb-6">Our Team</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Meet the dedicated professionals behind MediVault.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                  />
                  <h3 className="text-xl font-semibold text-medivault-darkGray">{member.name}</h3>
                  <p className="text-medivault-blue font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CallToAction />
      </div>
      <Footer />
    </div>
  );
};

export default About;
