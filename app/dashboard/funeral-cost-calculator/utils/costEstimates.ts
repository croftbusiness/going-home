// Average cost estimates based on industry data
export const AVERAGE_COSTS = {
  funeralHomeServices: {
    basicServiceFee: 2100,
    transportationOfRemains: 350,
    embalming: 750,
    bodyPreparation: 250,
    facilityUsageVisitation: 450,
    facilityUsageCeremony: 500,
  },
  burial: {
    casket: {
      standard: 2500,
      premium: 5000,
      luxury: 10000,
    },
    vault: {
      liner: 1000,
      concrete: 1500,
      metal: 3000,
    },
    gravesite: 2000,
    openingClosing: 1500,
    headstone: {
      basic: 1000,
      standard: 2500,
      premium: 5000,
    },
    engraving: 500,
  },
  cremation: {
    cremationFee: 2500,
    urn: {
      standard: 200,
      premium: 500,
      biodegradable: 300,
      custom: 1000,
    },
    keepsakeUrns: 150,
    scatteringPermit: 100,
  },
  serviceAddons: {
    flowers: {
      minimal: 200,
      moderate: 500,
      extensive: 1500,
    },
    printedMaterials: 150,
    obituaryPublication: 200,
    memorialVideo: 500,
    musician: 300,
    officiant: 200,
  },
  venueAndCatering: {
    ceremonyVenue: {
      none: 0,
      basic: 500,
      premium: 2000,
    },
    receptionVenue: {
      none: 0,
      basic: 800,
      premium: 3000,
    },
    catering: {
      none: 0,
      light: 500,
      moderate: 1500,
      extensive: 4000,
    },
  },
  transportation: {
    limousines: {
      none: 0,
      one: 300,
      multiple: 800,
    },
    familyVehicle: 200,
    mileageFees: 150,
  },
  legalAndAdmin: {
    deathCertificates: {
      quantity: 5,
      costPerCopy: 25,
    },
    requiredPermits: 100,
    notaryCourier: 150,
  },
};

export interface QuestionnaireAnswers {
  burialOrCremation: 'burial' | 'cremation';
  serviceStyle: 'simple' | 'traditional' | 'elaborate';
  casketUrnPreference: 'basic' | 'standard' | 'premium';
  flowers: 'none' | 'minimal' | 'moderate' | 'extensive';
  ceremonyVenue: 'none' | 'basic' | 'premium';
  receptionVenue: 'none' | 'basic' | 'premium';
  catering: 'none' | 'light' | 'moderate' | 'extensive';
  transportation: 'none' | 'basic' | 'premium';
  memorialVideo: boolean;
  musician: boolean;
  keepsakeUrns: boolean;
}

export function estimateCostsFromQuestionnaire(answers: QuestionnaireAnswers) {
  const costs: any = {
    funeralHomeServices: {
      basicServiceFee: AVERAGE_COSTS.funeralHomeServices.basicServiceFee,
      transportationOfRemains: AVERAGE_COSTS.funeralHomeServices.transportationOfRemains,
      facilityUsageVisitation: AVERAGE_COSTS.funeralHomeServices.facilityUsageVisitation,
      facilityUsageCeremony: AVERAGE_COSTS.funeralHomeServices.facilityUsageCeremony,
    },
    burialCosts: {} as any,
    cremationCosts: {} as any,
    serviceAddons: {} as any,
    venueAndCatering: {} as any,
    transportation: {} as any,
    legalAndAdmin: {
      deathCertificatesQuantity: AVERAGE_COSTS.legalAndAdmin.deathCertificates.quantity,
      deathCertificatesCostPerCopy: AVERAGE_COSTS.legalAndAdmin.deathCertificates.costPerCopy,
      requiredPermits: AVERAGE_COSTS.legalAndAdmin.requiredPermits,
      notaryCourierFees: AVERAGE_COSTS.legalAndAdmin.notaryCourier,
    },
  };

  // Add embalming based on service style
  if (answers.serviceStyle !== 'simple') {
    costs.funeralHomeServices.embalming = {
      enabled: true,
      cost: AVERAGE_COSTS.funeralHomeServices.embalming,
    };
  }

  // Burial or Cremation costs
  if (answers.burialOrCremation === 'burial') {
    const casketKey = answers.casketUrnPreference === 'basic' ? 'standard' : 
                     answers.casketUrnPreference === 'standard' ? 'premium' : 'luxury';
    costs.burialCosts = {
      casketCost: AVERAGE_COSTS.burial.casket[casketKey],
      vaultOrLinerCost: answers.casketUrnPreference === 'premium' 
        ? AVERAGE_COSTS.burial.vault.metal 
        : AVERAGE_COSTS.burial.vault.concrete,
      gravesiteCost: AVERAGE_COSTS.burial.gravesite,
      openingClosingFee: AVERAGE_COSTS.burial.openingClosing,
      headstoneCost: answers.casketUrnPreference === 'basic' 
        ? AVERAGE_COSTS.burial.headstone.basic 
        : answers.casketUrnPreference === 'standard' 
        ? AVERAGE_COSTS.burial.headstone.standard 
        : AVERAGE_COSTS.burial.headstone.premium,
      engravingCost: AVERAGE_COSTS.burial.engraving,
    };
  } else {
    const urnKey = answers.casketUrnPreference === 'basic' ? 'standard' : 
                  answers.casketUrnPreference === 'standard' ? 'premium' : 'custom';
    costs.cremationCosts = {
      cremationFee: AVERAGE_COSTS.cremation.cremationFee,
      urnCost: AVERAGE_COSTS.cremation.urn[urnKey],
      scatteringPermitFees: AVERAGE_COSTS.cremation.scatteringPermit,
    };
    if (answers.keepsakeUrns) {
      costs.cremationCosts.keepsakeUrnsJewelry = {
        enabled: true,
        cost: AVERAGE_COSTS.cremation.keepsakeUrns,
      };
    }
  }

  // Service Add-ons
  costs.serviceAddons = {
    flowers: answers.flowers === 'none' ? 0 : (AVERAGE_COSTS.serviceAddons.flowers[answers.flowers] || 0),
    printedMaterials: AVERAGE_COSTS.serviceAddons.printedMaterials,
    obituaryPublicationFee: AVERAGE_COSTS.serviceAddons.obituaryPublication,
  };

  if (answers.memorialVideo) {
    costs.serviceAddons.memorialVideoPhotoMontage = AVERAGE_COSTS.serviceAddons.memorialVideo;
  }

  if (answers.musician) {
    costs.serviceAddons.musicianSingerCost = AVERAGE_COSTS.serviceAddons.musician;
  }

  if (answers.serviceStyle !== 'simple') {
    costs.serviceAddons.officiantHonorarium = AVERAGE_COSTS.serviceAddons.officiant;
  }

  // Venue & Catering
  costs.venueAndCatering = {
    ceremonyVenueFee: answers.ceremonyVenue === 'none' ? 0 : (AVERAGE_COSTS.venueAndCatering.ceremonyVenue[answers.ceremonyVenue] || 0),
    receptionVenueFee: answers.receptionVenue === 'none' ? 0 : (AVERAGE_COSTS.venueAndCatering.receptionVenue[answers.receptionVenue] || 0),
    catering: answers.catering === 'none' ? 0 : (AVERAGE_COSTS.venueAndCatering.catering[answers.catering] || 0),
  };

  // Transportation
  if (answers.transportation === 'none') {
    costs.transportation = {
      mileageFees: AVERAGE_COSTS.transportation.mileageFees,
    };
  } else if (answers.transportation === 'basic') {
    costs.transportation = {
      familyVehicleTransport: AVERAGE_COSTS.transportation.familyVehicle,
      mileageFees: AVERAGE_COSTS.transportation.mileageFees,
    };
  } else {
    costs.transportation = {
      limousines: AVERAGE_COSTS.transportation.limousines.multiple,
      mileageFees: AVERAGE_COSTS.transportation.mileageFees,
    };
  }

  return costs;
}

