export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Delivery Information</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">Delivery Timeline</h2>
            <p>All orders are delivered within 5-6 business days from the date of order confirmation. Delivery times may vary based on your location.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Charges</h2>
            <p>We offer free shipping on all orders across India. No minimum order value required.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Delivery Areas</h2>
            <p>We currently deliver to all major cities and towns across India. Please ensure your complete address with pincode is provided during checkout.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Order Tracking</h2>
            <p>Once your order is shipped, you will receive a confirmation email with tracking details. You can also track your order from your account dashboard.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Delivery Partners</h2>
            <p>We work with trusted courier partners to ensure safe and timely delivery of your orders.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p>For any delivery-related queries, please contact our customer support at support@happyfeet.com or call +91 98765 43210.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
