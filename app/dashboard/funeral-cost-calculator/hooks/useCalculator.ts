import { useState, useEffect, useCallback } from 'react';

export interface FuneralHomeServices {
  basicServiceFee?: number;
  transportationOfRemains?: number;
  embalming?: { enabled: boolean; cost?: number };
  bodyPreparation?: { enabled: boolean; cost?: number };
  facilityUsageVisitation?: number;
  facilityUsageCeremony?: number;
}

export interface BurialCosts {
  casketType?: string;
  casketCost?: number;
  vaultOrLiner?: string;
  vaultOrLinerCost?: number;
  gravesiteCost?: number;
  openingClosingFee?: number;
  headstoneCost?: number;
  engravingCost?: number;
}

export interface CremationCosts {
  cremationFee?: number;
  urnType?: string;
  urnCost?: number;
  keepsakeUrnsJewelry?: { enabled: boolean; cost?: number };
  scatteringPermitFees?: number;
}

export interface ServiceAddons {
  flowers?: number;
  printedMaterials?: number;
  obituaryPublicationFee?: number;
  memorialVideoPhotoMontage?: number;
  musicianSingerCost?: number;
  officiantHonorarium?: number;
}

export interface VenueAndCatering {
  ceremonyVenueFee?: number;
  receptionVenueFee?: number;
  catering?: number;
}

export interface Transportation {
  limousines?: number;
  familyVehicleTransport?: number;
  mileageFees?: number;
}

export interface LegalAndAdmin {
  deathCertificatesQuantity?: number;
  deathCertificatesCostPerCopy?: number;
  requiredPermits?: number;
  notaryCourierFees?: number;
}

export interface CalculatorData {
  burialOrCremation?: 'burial' | 'cremation';
  funeralHomeServices: FuneralHomeServices;
  burialCosts: BurialCosts;
  cremationCosts: CremationCosts;
  serviceAddons: ServiceAddons;
  venueAndCatering: VenueAndCatering;
  transportation: Transportation;
  legalAndAdmin: LegalAndAdmin;
  notes?: string;
}

export function useCalculator() {
  const [data, setData] = useState<CalculatorData>({
    funeralHomeServices: {},
    burialCosts: {},
    cremationCosts: {},
    serviceAddons: {},
    venueAndCatering: {},
    transportation: {},
    legalAndAdmin: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const calculateTotal = useCallback((): number => {
    let total = 0;

    // Funeral Home Services
    if (data.funeralHomeServices.basicServiceFee) total += data.funeralHomeServices.basicServiceFee;
    if (data.funeralHomeServices.transportationOfRemains) total += data.funeralHomeServices.transportationOfRemains;
    if (data.funeralHomeServices.embalming?.enabled && data.funeralHomeServices.embalming?.cost) {
      total += data.funeralHomeServices.embalming.cost;
    }
    if (data.funeralHomeServices.bodyPreparation?.enabled && data.funeralHomeServices.bodyPreparation?.cost) {
      total += data.funeralHomeServices.bodyPreparation.cost;
    }
    if (data.funeralHomeServices.facilityUsageVisitation) total += data.funeralHomeServices.facilityUsageVisitation;
    if (data.funeralHomeServices.facilityUsageCeremony) total += data.funeralHomeServices.facilityUsageCeremony;

    // Burial or Cremation Costs
    if (data.burialOrCremation === 'burial') {
      if (data.burialCosts.casketCost) total += data.burialCosts.casketCost;
      if (data.burialCosts.vaultOrLinerCost) total += data.burialCosts.vaultOrLinerCost;
      if (data.burialCosts.gravesiteCost) total += data.burialCosts.gravesiteCost;
      if (data.burialCosts.openingClosingFee) total += data.burialCosts.openingClosingFee;
      if (data.burialCosts.headstoneCost) total += data.burialCosts.headstoneCost;
      if (data.burialCosts.engravingCost) total += data.burialCosts.engravingCost;
    } else if (data.burialOrCremation === 'cremation') {
      if (data.cremationCosts.cremationFee) total += data.cremationCosts.cremationFee;
      if (data.cremationCosts.urnCost) total += data.cremationCosts.urnCost;
      if (data.cremationCosts.keepsakeUrnsJewelry?.enabled && data.cremationCosts.keepsakeUrnsJewelry?.cost) {
        total += data.cremationCosts.keepsakeUrnsJewelry.cost;
      }
      if (data.cremationCosts.scatteringPermitFees) total += data.cremationCosts.scatteringPermitFees;
    }

    // Service Add-ons
    if (data.serviceAddons.flowers) total += data.serviceAddons.flowers;
    if (data.serviceAddons.printedMaterials) total += data.serviceAddons.printedMaterials;
    if (data.serviceAddons.obituaryPublicationFee) total += data.serviceAddons.obituaryPublicationFee;
    if (data.serviceAddons.memorialVideoPhotoMontage) total += data.serviceAddons.memorialVideoPhotoMontage;
    if (data.serviceAddons.musicianSingerCost) total += data.serviceAddons.musicianSingerCost;
    if (data.serviceAddons.officiantHonorarium) total += data.serviceAddons.officiantHonorarium;

    // Venue & Catering
    if (data.venueAndCatering.ceremonyVenueFee) total += data.venueAndCatering.ceremonyVenueFee;
    if (data.venueAndCatering.receptionVenueFee) total += data.venueAndCatering.receptionVenueFee;
    if (data.venueAndCatering.catering) total += data.venueAndCatering.catering;

    // Transportation
    if (data.transportation.limousines) total += data.transportation.limousines;
    if (data.transportation.familyVehicleTransport) total += data.transportation.familyVehicleTransport;
    if (data.transportation.mileageFees) total += data.transportation.mileageFees;

    // Legal & Admin
    if (data.legalAndAdmin.deathCertificatesQuantity && data.legalAndAdmin.deathCertificatesCostPerCopy) {
      total += data.legalAndAdmin.deathCertificatesQuantity * data.legalAndAdmin.deathCertificatesCostPerCopy;
    }
    if (data.legalAndAdmin.requiredPermits) total += data.legalAndAdmin.requiredPermits;
    if (data.legalAndAdmin.notaryCourierFees) total += data.legalAndAdmin.notaryCourierFees;

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }, [data]);

  const loadCalculation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/funeral/cost-calculator');
      if (!response.ok) throw new Error('Failed to load');

      const result = await response.json();
      if (result.calculation) {
        setData({
          burialOrCremation: result.calculation.burial_or_cremation || undefined,
          funeralHomeServices: result.calculation.funeral_home_services || {},
          burialCosts: result.calculation.burial_costs || {},
          cremationCosts: result.calculation.cremation_costs || {},
          serviceAddons: result.calculation.service_addons || {},
          venueAndCatering: result.calculation.venue_and_catering || {},
          transportation: result.calculation.transportation || {},
          legalAndAdmin: result.calculation.legal_and_admin || {},
          notes: result.calculation.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to load calculation:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = async () => {
    try {
      setSaving(true);
      const totalCost = calculateTotal();
      
      const response = await fetch('/api/funeral/cost-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          burialOrCremation: data.burialOrCremation,
          funeralHomeServices: data.funeralHomeServices,
          burialCosts: data.burialCosts,
          cremationCosts: data.cremationCosts,
          serviceAddons: data.serviceAddons,
          venueAndCatering: data.venueAndCatering,
          transportation: data.transportation,
          legalAndAdmin: data.legalAndAdmin,
          totalCost,
          notes: data.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      return true;
    } catch (error) {
      console.error('Failed to save calculation:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCalculation();
  }, []);

  return {
    data,
    setData,
    loading,
    saving,
    calculateTotal,
    saveCalculation,
    loadCalculation,
  };
}





