
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      quote: "MediVault has completely changed how I manage my health information. Now I have all my records in one secure place that I can access whenever I need them.",
      stars: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "Physician",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      quote: "As a doctor, I appreciate when patients can share their complete medical history securely. MediVault makes this process seamless and compliant with privacy regulations.",
      stars: 5,
    },
    {
      name: "Emma Williams",
      role: "Healthcare Administrator",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      quote: "The platform's security features and ease of use make it our top recommendation for patients looking to digitize their medical records.",
      stars: 4,
    },
  ];

  return (
    <section className="py-16 px-6 bg-medivault-gray">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medivault-darkGray mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Thousands of individuals and healthcare professionals trust MediVault for medical records management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-medivault-darkGray">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < testimonial.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 italic">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
