'use client';

import { CalculatorData } from '../hooks/useCalculator';
import { FileText, DollarSign } from 'lucide-react';

interface StepSummaryProps {
  data: CalculatorData;
  setData: (data: CalculatorData) => void;
  calculateTotal: () => number;
}

export default function StepSummary({ data, setData, calculateTotal }: StepSummaryProps) {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateCategoryTotal = (category: any): number => {
    let total = 0;
    Object.values(category).forEach((value: any) => {
      if (typeof value === 'number') {
        total += value;
      } else if (value && typeof value === 'object' && value.enabled && value.cost) {
        total += value.cost;
      }
    });
    return total;
  };

  const funeralHomeTotal = calculateCategoryTotal(data.funeralHomeServices);
  const burialTotal = data.burialOrCremation === 'burial' ? calculateCategoryTotal(data.burialCosts) : 0;
  const cremationTotal = data.burialOrCremation === 'cremation' ? calculateCategoryTotal(data.cremationCosts) : 0;
  const addonsTotal = calculateCategoryTotal(data.serviceAddons);
  const venueTotal = calculateCategoryTotal(data.venueAndCatering);
  const transportationTotal = calculateCategoryTotal(data.transportation);
  const legalTotal = calculateCategoryTotal(data.legalAndAdmin);
  
  // Add death certificates calculation
  const deathCertificatesTotal = (data.legalAndAdmin.deathCertificatesQuantity || 0) * (data.legalAndAdmin.deathCertificatesCostPerCopy || 0);
  const adjustedLegalTotal = legalTotal - ((data.legalAndAdmin.deathCertificatesQuantity || 0) * (data.legalAndAdmin.deathCertificatesCostPerCopy || 0)) + deathCertificatesTotal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2A29] mb-2">Cost Summary</h2>
        <p className="text-[#2C2A29] opacity-70">Review your estimated funeral costs</p>
      </div>

      <div className="space-y-4">
        {/* Funeral Home Services */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#2C2A29]">Funeral Home Services</h3>
            <span className="font-semibold text-[#2C2A29]">${formatCurrency(funeralHomeTotal)}</span>
          </div>
          <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
            {data.funeralHomeServices.basicServiceFee && (
              <div className="flex justify-between">
                <span>Basic Service Fee</span>
                <span>${formatCurrency(data.funeralHomeServices.basicServiceFee)}</span>
              </div>
            )}
            {data.funeralHomeServices.transportationOfRemains && (
              <div className="flex justify-between">
                <span>Transportation</span>
                <span>${formatCurrency(data.funeralHomeServices.transportationOfRemains)}</span>
              </div>
            )}
            {data.funeralHomeServices.embalming?.enabled && data.funeralHomeServices.embalming?.cost && (
              <div className="flex justify-between">
                <span>Embalming</span>
                <span>${formatCurrency(data.funeralHomeServices.embalming.cost)}</span>
              </div>
            )}
            {data.funeralHomeServices.bodyPreparation?.enabled && data.funeralHomeServices.bodyPreparation?.cost && (
              <div className="flex justify-between">
                <span>Body Preparation</span>
                <span>${formatCurrency(data.funeralHomeServices.bodyPreparation.cost)}</span>
              </div>
            )}
            {data.funeralHomeServices.facilityUsageVisitation && (
              <div className="flex justify-between">
                <span>Visitation Facility</span>
                <span>${formatCurrency(data.funeralHomeServices.facilityUsageVisitation)}</span>
              </div>
            )}
            {data.funeralHomeServices.facilityUsageCeremony && (
              <div className="flex justify-between">
                <span>Ceremony Facility</span>
                <span>${formatCurrency(data.funeralHomeServices.facilityUsageCeremony)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Burial or Cremation */}
        {data.burialOrCremation === 'burial' && burialTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#2C2A29]">Burial Costs</h3>
              <span className="font-semibold text-[#2C2A29]">${formatCurrency(burialTotal)}</span>
            </div>
            <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
              {data.burialCosts.casketCost && (
                <div className="flex justify-between">
                  <span>Casket</span>
                  <span>${formatCurrency(data.burialCosts.casketCost)}</span>
                </div>
              )}
              {data.burialCosts.vaultOrLinerCost && (
                <div className="flex justify-between">
                  <span>Vault/Liner</span>
                  <span>${formatCurrency(data.burialCosts.vaultOrLinerCost)}</span>
                </div>
              )}
              {data.burialCosts.gravesiteCost && (
                <div className="flex justify-between">
                  <span>Gravesite</span>
                  <span>${formatCurrency(data.burialCosts.gravesiteCost)}</span>
                </div>
              )}
              {data.burialCosts.openingClosingFee && (
                <div className="flex justify-between">
                  <span>Opening & Closing</span>
                  <span>${formatCurrency(data.burialCosts.openingClosingFee)}</span>
                </div>
              )}
              {data.burialCosts.headstoneCost && (
                <div className="flex justify-between">
                  <span>Headstone</span>
                  <span>${formatCurrency(data.burialCosts.headstoneCost)}</span>
                </div>
              )}
              {data.burialCosts.engravingCost && (
                <div className="flex justify-between">
                  <span>Engraving</span>
                  <span>${formatCurrency(data.burialCosts.engravingCost)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {data.burialOrCremation === 'cremation' && cremationTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#2C2A29]">Cremation Costs</h3>
              <span className="font-semibold text-[#2C2A29]">${formatCurrency(cremationTotal)}</span>
            </div>
            <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
              {data.cremationCosts.cremationFee && (
                <div className="flex justify-between">
                  <span>Cremation Fee</span>
                  <span>${formatCurrency(data.cremationCosts.cremationFee)}</span>
                </div>
              )}
              {data.cremationCosts.urnCost && (
                <div className="flex justify-between">
                  <span>Urn</span>
                  <span>${formatCurrency(data.cremationCosts.urnCost)}</span>
                </div>
              )}
              {data.cremationCosts.keepsakeUrnsJewelry?.enabled && data.cremationCosts.keepsakeUrnsJewelry?.cost && (
                <div className="flex justify-between">
                  <span>Keepsake Urns/Jewelry</span>
                  <span>${formatCurrency(data.cremationCosts.keepsakeUrnsJewelry.cost)}</span>
                </div>
              )}
              {data.cremationCosts.scatteringPermitFees && (
                <div className="flex justify-between">
                  <span>Scattering Permit</span>
                  <span>${formatCurrency(data.cremationCosts.scatteringPermitFees)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Add-ons */}
        {addonsTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#2C2A29]">Service Add-ons</h3>
              <span className="font-semibold text-[#2C2A29]">${formatCurrency(addonsTotal)}</span>
            </div>
            <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
              {data.serviceAddons.flowers && (
                <div className="flex justify-between">
                  <span>Flowers</span>
                  <span>${formatCurrency(data.serviceAddons.flowers)}</span>
                </div>
              )}
              {data.serviceAddons.printedMaterials && (
                <div className="flex justify-between">
                  <span>Printed Materials</span>
                  <span>${formatCurrency(data.serviceAddons.printedMaterials)}</span>
                </div>
              )}
              {data.serviceAddons.obituaryPublicationFee && (
                <div className="flex justify-between">
                  <span>Obituary Publication</span>
                  <span>${formatCurrency(data.serviceAddons.obituaryPublicationFee)}</span>
                </div>
              )}
              {data.serviceAddons.memorialVideoPhotoMontage && (
                <div className="flex justify-between">
                  <span>Memorial Video</span>
                  <span>${formatCurrency(data.serviceAddons.memorialVideoPhotoMontage)}</span>
                </div>
              )}
              {data.serviceAddons.musicianSingerCost && (
                <div className="flex justify-between">
                  <span>Musician/Singer</span>
                  <span>${formatCurrency(data.serviceAddons.musicianSingerCost)}</span>
                </div>
              )}
              {data.serviceAddons.officiantHonorarium && (
                <div className="flex justify-between">
                  <span>Officiant Honorarium</span>
                  <span>${formatCurrency(data.serviceAddons.officiantHonorarium)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Venue & Catering */}
        {venueTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#2C2A29]">Venue & Catering</h3>
              <span className="font-semibold text-[#2C2A29]">${formatCurrency(venueTotal)}</span>
            </div>
            <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
              {data.venueAndCatering.ceremonyVenueFee && (
                <div className="flex justify-between">
                  <span>Ceremony Venue</span>
                  <span>${formatCurrency(data.venueAndCatering.ceremonyVenueFee)}</span>
                </div>
              )}
              {data.venueAndCatering.receptionVenueFee && (
                <div className="flex justify-between">
                  <span>Reception Venue</span>
                  <span>${formatCurrency(data.venueAndCatering.receptionVenueFee)}</span>
                </div>
              )}
              {data.venueAndCatering.catering && (
                <div className="flex justify-between">
                  <span>Catering</span>
                  <span>${formatCurrency(data.venueAndCatering.catering)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transportation */}
        {transportationTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#2C2A29]">Transportation</h3>
              <span className="font-semibold text-[#2C2A29]">${formatCurrency(transportationTotal)}</span>
            </div>
            <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
              {data.transportation.limousines && (
                <div className="flex justify-between">
                  <span>Limousines</span>
                  <span>${formatCurrency(data.transportation.limousines)}</span>
                </div>
              )}
              {data.transportation.familyVehicleTransport && (
                <div className="flex justify-between">
                  <span>Family Vehicle</span>
                  <span>${formatCurrency(data.transportation.familyVehicleTransport)}</span>
                </div>
              )}
              {data.transportation.mileageFees && (
                <div className="flex justify-between">
                  <span>Mileage Fees</span>
                  <span>${formatCurrency(data.transportation.mileageFees)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legal & Admin */}
        {adjustedLegalTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#2C2A29]">Legal & Administrative</h3>
              <span className="font-semibold text-[#2C2A29]">${formatCurrency(adjustedLegalTotal)}</span>
            </div>
            <div className="text-sm text-[#2C2A29] opacity-70 space-y-1">
              {deathCertificatesTotal > 0 && (
                <div className="flex justify-between">
                  <span>Death Certificates ({data.legalAndAdmin.deathCertificatesQuantity} × ${formatCurrency(data.legalAndAdmin.deathCertificatesCostPerCopy || 0)})</span>
                  <span>${formatCurrency(deathCertificatesTotal)}</span>
                </div>
              )}
              {data.legalAndAdmin.requiredPermits && (
                <div className="flex justify-between">
                  <span>Required Permits</span>
                  <span>${formatCurrency(data.legalAndAdmin.requiredPermits)}</span>
                </div>
              )}
              {data.legalAndAdmin.notaryCourierFees && (
                <div className="flex justify-between">
                  <span>Notary/Courier</span>
                  <span>${formatCurrency(data.legalAndAdmin.notaryCourierFees)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Total Estimated Cost</h3>
            </div>
            <span className="text-3xl font-bold">${formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Notes
          </label>
          <textarea
            value={data.notes || ''}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            placeholder="Add any notes or additional information about this calculation..."
          />
        </div>
      </div>
    </div>
  );
}

