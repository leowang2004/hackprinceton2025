interface MerchantSelectionProps {
  onMerchantSelect: (merchant: 'amazon' | 'wayfair') => void;
}

export function MerchantSelection({ onMerchantSelect }: MerchantSelectionProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-700 text-white px-8 py-4">
        <h1 className="text-xl">WingsPay Demo</h1>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-8">
          <h2 className="text-3xl mb-3">Select a Checkout Experience</h2>
          <p className="text-gray-600 text-lg">
            Choose a merchant to simulate a high-value purchase with WingsPay underwriting.
          </p>
        </div>

        {/* Merchant Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Amazon Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl mb-2">
              <span className="text-orange-500">Amazon</span> Electronics
            </h3>
            <p className="text-gray-600 mb-6">
              Buy everyday tech items and try WingsPay on moderate basket sizes.
            </p>
            <button
              onClick={() => onMerchantSelect('amazon')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black py-3.5 rounded-md transition-colors"
            >
              Go to Amazon Checkout
            </button>
          </div>

          {/* Wayfair Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl mb-2">
              <span className="text-purple-600">Wayfair</span> Premium Furniture
            </h3>
            <p className="text-gray-600 mb-6">
              Purchase a high-end couch ($500-$1000 range) and see adaptive WingsPay terms.
            </p>
            <button
              onClick={() => onMerchantSelect('wayfair')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-md transition-colors"
            >
              Go to Wayfair Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
