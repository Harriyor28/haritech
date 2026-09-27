import React from 'react';
import ServicesSection from '../../components/ServicesSection';
import WhyChooseSection from '../../components/WhyChooseSection';

const Services: React.FC = () => {
  return (
    <div className="pt-16">
      <ServicesSection />
      <WhyChooseSection />
    </div>
  );
};

export default Services;
