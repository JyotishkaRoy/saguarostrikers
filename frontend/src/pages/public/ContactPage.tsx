import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/public/contact', formData);
      if (response.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        toast.error(response.message || 'Failed to send message.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
          </div>
          <p className="text-lg text-gray-600">
            Have questions about our missions or want to get involved? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-stretch">
          {/* Contact Form */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="card h-full flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="form-label">
                        Email Address <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="form-label">
                        Subject <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="input"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="What is your message about?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="form-label">
                        Message <span className="text-danger-600">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        className="input"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us more about your inquiry..."
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                      >
                        <Send className="h-5 w-5 mr-2" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Contact Information */}
            <div className="card flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-xs mb-1">Email</p>
                    <a
                      href="mailto:info@saguarostrikers.org"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      info@saguarostrikers.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-xs mb-1">Phone</p>
                    <a
                      href="tel:+1234567890"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      (123) 456-7890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-xs mb-1">Location</p>
                    <p className="text-gray-600 text-sm">
                      Arizona, USA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-medium text-gray-900">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-medium text-gray-900">Closed</span>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="card flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Response Time</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We typically respond to all inquiries within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="card bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I join a mission?</h3>
                <p className="text-sm text-gray-600">
                  Visit our Missions page, select a mission, and click "Register Interest" or use the "Join a Mission" form.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Who can participate?</h3>
                <p className="text-sm text-gray-600">
                  We welcome students, educators, and rocketry enthusiasts of all skill levels. Parental consent is required for minors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What experience is needed?</h3>
                <p className="text-sm text-gray-600">
                  No prior experience required! We provide training and mentorship for all team members.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are there any fees?</h3>
                <p className="text-sm text-gray-600">
                  Contact us directly to discuss participation fees and fundraising opportunities for specific missions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
