const testimonials = [
  {
    id: 1,
    content: "I'm amazed by the quality of products and the fast shipping. Definitely my go-to online store now!",
    author: "Sarah Johnson",
    role: "Verified Customer",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
  },
  {
    id: 2,
    content: "The customer service is outstanding. They helped me exchange a product without any hassle.",
    author: "Michael Brown",
    role: "Verified Customer",
    image: "https://randomuser.me/api/portraits/men/43.jpg",
  },
  {
    id: 3,
    content: "I've been shopping here for years and have never been disappointed. Highly recommend!",
    author: "Emily Davis",
    role: "Verified Customer",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Don't just take our word for it, read reviews from our happy customers
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.image}
                  alt={testimonial.author}
                />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 italic">{`"${testimonial.content}"`}</p>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
