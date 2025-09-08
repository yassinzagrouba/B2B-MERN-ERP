import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <div className="relative bg-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          alt="E-commerce background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Shop the Latest Trends
        </h1>
        <p className="mt-6 text-xl text-white max-w-3xl">
          Discover our curated collection of premium products at unbeatable prices.
          Fast shipping, easy returns, and exceptional customer service.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/products">
            <Button variant="primary" className="text-base px-8 py-3">
              Shop Now
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="text-base px-8 py-3 bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
              New Arrivals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
