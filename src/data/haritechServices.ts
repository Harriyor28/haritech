export interface HaritechService {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
  has3D: boolean;
}

/**
 * The eight divisions confirmed by the owner, used as a short reference list.
 * Operational detail for each division lives on its own page.
 */
export const haritechServices: HaritechService[] = [
  {
    id: 'laptops',
    title: 'Laptop & Tech Accessories',
    description: 'Laptops, accessories and peripherals sourced to the specification and budget you give us, with advice on what a machine actually needs to do the work you have in mind.',
    icon: 'Laptop',
    features: ['Laptop sourcing guidance', 'Accessories & peripherals', 'Specification checks', 'Setup and advice'],
    color: 'from-cyan-500 to-blue-600',
    has3D: true
  },
  {
    id: 'cyber-cafe',
    title: 'Cyber Café & Online Registration Assistance',
    description: 'Computer and internet-based help for everyday tasks, including typing, scanning, printing and general guidance through online forms and registration requirements.',
    icon: 'Monitor',
    features: ['Computer & internet access', 'Document preparation', 'Form guidance', 'Printing and scanning'],
    color: 'from-purple-500 to-violet-600',
    has3D: false
  },
  {
    id: 'printing',
    title: 'Printing & Branding',
    description: 'Printing of business documents and promotional items, plus branding advice, subject to the equipment and suppliers available at the time of your enquiry.',
    icon: 'Printer',
    features: ['Business documents', 'Promotional materials', 'Branded items', 'Design advice'],
    color: 'from-pink-500 to-rose-600',
    has3D: false
  },
  {
    id: 'importation',
    title: 'Importation Consultation',
    description: 'Guidance on product sourcing, supplier communication, shipping options and landed-cost planning before you commit money to an order.',
    icon: 'Ship',
    features: ['Sourcing guidance', 'Supplier communication', 'Landed-cost planning', 'Shipping options'],
    color: 'from-blue-500 to-indigo-600',
    has3D: false
  },
  {
    id: 'consultation',
    title: 'Business Consultation',
    description: 'Practical support with business planning, operations and digital presence for entrepreneurs and small businesses.',
    icon: 'Briefcase',
    features: ['Business planning', 'Operational guidance', 'Digital presence', 'Business development'],
    color: 'from-emerald-500 to-green-600',
    has3D: false
  },
  {
    id: 'solar',
    title: 'Solar Energy',
    description: 'Enquiries about solar requirements: understanding your load, planning a system, checking equipment options and coordinating installation.',
    icon: 'Sun',
    features: ['Energy needs assessment', 'System planning', 'Equipment sourcing', 'Installation coordination'],
    color: 'from-yellow-500 to-amber-600',
    has3D: false
  },
  {
    id: 'project-management',
    title: 'Project Management & Property Monitoring',
    description: 'Planning, scheduling, budgeting support, coordination and progress reporting for projects, including monitoring visits and condition reports for property owners.',
    icon: 'ClipboardList',
    features: ['Planning & scheduling', 'Budget support', 'Coordination', 'Monitoring & reporting'],
    color: 'from-teal-500 to-cyan-600',
    has3D: true
  },
  {
    id: 'epoxy',
    title: 'Epoxy & Interior Décor',
    description: '3D epoxy finishes and interior décor for floors, walls and selected surfaces, with consultation on design preferences and surface preparation.',
    icon: 'Paintbrush',
    features: ['3D epoxy finishes', 'Interior décor', 'Surface assessment', 'Design consultation'],
    color: 'from-amber-500 to-orange-600',
    has3D: true
  }
];
