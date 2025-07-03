import React, { useState } from 'react';
import { 
  Truck, 
  Award, 
  Shield, 
  Clock, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Star,
  Package,
  MapPin,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { QuoteWithPricing } from '../types';
import { formatCurrency } from '../utils/pricingCalculator';
import { QuotePricingCard } from './QuotePricingCard';

interface CarrierCardProps {
  carrierName: string;
  carrierInfo: {
    scac?: string;
    mcNumber?: string;
    dotNumber?: string;
  };
  quotes: QuoteWithPricing[];
  onPriceUpdate: (quoteId: number, newPrice: number) => void;
  shipmentInfo: {
    fromZip: string;
    toZip: string;
    weight: number;
    pallets: number;
    pickupDate: string;
  };
}

interface CarrierCardsProps {
  quotes: QuoteWithPricing[];
  onPriceUpdate: (quoteId: number, newPrice: number) => void;
  shipmentInfo: {
    fromZip: string;
    toZip: string;
    weight: number;
    pallets: number;
    pickupDate: string;
  };
}

const CarrierCard: React.FC<CarrierCardProps> = ({ 
  carrierName, 
  carrierInfo,
  quotes, 
  onPriceUpdate, 
  shipmentInfo 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  
  // Sort quotes by customer price (best first)
  const sortedQuotes = [...quotes].sort((a, b) => a.customerPrice - b.customerPrice);
  const currentQuote = sortedQuotes[selectedServiceIndex];
  
  // Calculate carrier statistics
  const avgPrice = quotes.reduce((sum, q) => sum + q.customerPrice, 0) / quotes.length;
  const avgProfit = quotes.reduce((sum, q) => sum + q.profit, 0) / quotes.length;
  const avgTransitDays = quotes
    .filter(q => q.transitDays)
    .reduce((sum, q) => sum + (q.transitDays || 0), 0) / quotes.filter(q => q.transitDays).length;
  
  const getServiceLevelIcon = (serviceCode?: string) => {
    if (!serviceCode) return Clock;
    
    if (serviceCode.includes('GUARANTEED') || serviceCode.includes('GTD')) return Shield;
    if (serviceCode.includes('EXPEDITED') || serviceCode.includes('PRIORITY') || serviceCode.includes('URGENT')) return Zap;
    if (serviceCode.includes('ECONOMY') || serviceCode.includes('DEFERRED')) return Clock;
    return Truck;
  };
  
  const getServiceLevelColor = (serviceCode?: string) => {
    if (!serviceCode) return 'text-gray-500';
    
    if (serviceCode.includes('GUARANTEED') || serviceCode.includes('GTD')) return 'text-green-600';
    if (serviceCode.includes('EXPEDITED') || serviceCode.includes('PRIORITY') || serviceCode.includes('URGENT')) return 'text-orange-600';
    if (serviceCode.includes('ECONOMY') || serviceCode.includes('DEFERRED')) return 'text-purple-600';
    return 'text-blue-600';
  };

  const handlePreviousService = () => {
    setSelectedServiceIndex(prev => prev > 0 ? prev - 1 : sortedQuotes.length - 1);
  };

  const handleNextService = () => {
    setSelectedServiceIndex(prev => prev < sortedQuotes.length - 1 ? prev + 1 : 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200">
      {/* Carrier Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{carrierName}</h3>
              <div className="flex items-center space-x-4 mt-1">
                {carrierInfo.scac && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>SCAC: {carrierInfo.scac}</span>
                  </div>
                )}
                {carrierInfo.mcNumber && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>MC: {carrierInfo.mcNumber}</span>
                  </div>
                )}
                {carrierInfo.dotNumber && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>DOT: {carrierInfo.dotNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">
                {quotes.length} service level{quotes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Best: {formatCurrency(sortedQuotes[0].customerPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Service Level Navigator */}
      {quotes.length > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Service Level:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousService}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={quotes.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-2 min-w-0">
                  {React.createElement(getServiceLevelIcon(currentQuote.serviceLevel?.code), { 
                    className: `h-4 w-4 ${getServiceLevelColor(currentQuote.serviceLevel?.code)}` 
                  })}
                  <span className="font-medium text-gray-900 truncate">
                    {currentQuote.serviceLevel?.description || currentQuote.serviceLevel?.code || 'Standard'}
                  </span>
                </div>
                
                <button
                  onClick={handleNextService}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={quotes.length <= 1}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{selectedServiceIndex + 1} of {quotes.length}</span>
              {selectedServiceIndex === 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  BEST PRICE
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current Service Level Details */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(currentQuote.customerPrice)}</div>
            <div className="text-xs text-gray-500">Customer Price</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentQuote.profit)}</div>
            <div className="text-xs text-gray-500">Your Profit</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentQuote.transitDays ? `${currentQuote.transitDays}` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Transit Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(currentQuote.carrierTotalRate)}</div>
            <div className="text-xs text-gray-500">Carrier Rate</div>
          </div>
        </div>
      </div>

      {/* Service Level Comparison Overview */}
      {quotes.length > 1 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">All Service Levels</h4>
          <div className="grid grid-cols-1 gap-2">
            {sortedQuotes.map((quote, index) => {
              const ServiceIcon = getServiceLevelIcon(quote.serviceLevel?.code);
              const isSelected = index === selectedServiceIndex;
              const isLowestPrice = index === 0;
              
              return (
                <button
                  key={quote.quoteId}
                  onClick={() => setSelectedServiceIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ServiceIcon className={`h-4 w-4 ${getServiceLevelColor(quote.serviceLevel?.code)}`} />
                    <div>
                      <div className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                        {quote.serviceLevel?.description || quote.serviceLevel?.code || 'Standard'}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                        {quote.transitDays && `${quote.transitDays} days transit`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className={`font-bold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                        {formatCurrency(quote.customerPrice)}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                        Profit: {formatCurrency(quote.profit)}
                      </div>
                    </div>
                    {isLowestPrice && (
                      <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        BEST
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipment Details */}
      <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">
              {shipmentInfo.fromZip} → {shipmentInfo.toZip}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">
              {shipmentInfo.pallets} pallets
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">
              {shipmentInfo.weight.toLocaleString()} lbs
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">
              {shipmentInfo.pickupDate}
            </span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="px-6 py-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            {isExpanded ? 'Hide' : 'Show'} Detailed Quote Information
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Detailed Quote Information */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <QuotePricingCard
            quote={currentQuote}
            onPriceUpdate={onPriceUpdate}
            isExpanded={true}
          />
        </div>
      )}
    </div>
  );
};

export const CarrierCards: React.FC<CarrierCardsProps> = ({ 
  quotes, 
  onPriceUpdate, 
  shipmentInfo 
}) => {
  // Group quotes by carrier ID (use SCAC as primary identifier, fallback to carrier name)
  const carrierGroups = quotes.reduce((groups, quote) => {
    // Use SCAC as primary carrier ID, fallback to carrierCode, then carrier name
    const carrierId = quote.carrier.scac || quote.carrierCode || quote.carrier.name;
    const carrierName = quote.carrier.name;
    
    if (!groups[carrierId]) {
      groups[carrierId] = {
        name: carrierName,
        info: {
          scac: quote.carrier.scac || quote.carrierCode,
          mcNumber: quote.carrier.mcNumber,
          dotNumber: quote.carrier.dotNumber
        },
        quotes: []
      };
    }
    
    groups[carrierId].quotes.push(quote);
    return groups;
  }, {} as Record<string, {
    name: string;
    info: {
      scac?: string;
      mcNumber?: string;
      dotNumber?: string;
    };
    quotes: QuoteWithPricing[];
  }>);

  // Sort carriers by their best quote price
  const sortedCarriers = Object.entries(carrierGroups).sort(([, groupA], [, groupB]) => {
    const bestPriceA = Math.min(...groupA.quotes.map(q => q.customerPrice));
    const bestPriceB = Math.min(...groupB.quotes.map(q => q.customerPrice));
    return bestPriceA - bestPriceB;
  });

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotes Available</h3>
        <p className="text-gray-600">No carrier quotes found for this shipment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Carrier Service Level Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sortedCarriers.length} carrier{sortedCarriers.length !== 1 ? 's' : ''} • 
              {quotes.length} total service option{quotes.length !== 1 ? 's' : ''} • 
              Best price: {formatCurrency(Math.min(...quotes.map(q => q.customerPrice)))}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.min(...quotes.map(q => q.customerPrice)))}
            </div>
            <div className="text-sm text-gray-500">Lowest Quote</div>
          </div>
        </div>
      </div>

      {/* Carrier Cards */}
      <div className="space-y-6">
        {sortedCarriers.map(([carrierId, carrierGroup], index) => (
          <div key={carrierId} className="relative">
            {index === 0 && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                  BEST CARRIER
                </div>
              </div>
            )}
            <CarrierCard
              carrierName={carrierGroup.name}
              carrierInfo={carrierGroup.info}
              quotes={carrierGroup.quotes}
              onPriceUpdate={onPriceUpdate}
              shipmentInfo={shipmentInfo}
            />
          </div>
        ))}
      </div>
    </div>
  );
};