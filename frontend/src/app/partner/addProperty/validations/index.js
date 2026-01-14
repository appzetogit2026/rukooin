export const validateStep = (stepKey, formData) => {
  const errors = [];

  switch (stepKey) {
    case 'basic':
      if (!formData.name) errors.push('Property Name is required');
      if (!formData.description) errors.push('Description is required');
      break;
    case 'location':
      if (!formData.address?.addressLine) errors.push('Street Address is required');
      if (!formData.address?.city) errors.push('City is required');
      if (!formData.location?.coordinates || formData.location.coordinates.length < 2) errors.push('Map Location is required');
      break;
    case 'rooms':
    case 'inventory': {
      const isVilla = formData.propertyCategory === 'Villa';
      if (isVilla) {
        if (!formData.pricing?.basePrice) errors.push('Base Price is required');
      } else if (!formData.inventory || formData.inventory.length === 0) {
        errors.push('At least one room/unit is required');
      }
      break;
    }
    case 'photos':
      if (!formData.images?.cover) errors.push('Cover Image is required');
      if (!formData.images?.gallery || formData.images.gallery.length < 3) errors.push('At least 3 Gallery Images are required');
      break;
    case 'policies':
      if (!formData.policies?.checkInTime && !formData.policies?.checkInPolicy) errors.push('Check-in details are required');
      break;
    // Add other step validations
    default:
      break;
  }

  return errors;
};
