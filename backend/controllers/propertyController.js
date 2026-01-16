import mongoose from 'mongoose';
import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import PropertyDocument from '../models/PropertyDocument.js';
import { PROPERTY_DOCUMENTS } from '../config/propertyDocumentRules.js';

export const createProperty = async (req, res) => {
  try {
    const { propertyName, propertyType, description, shortDescription, coverImage, amenities, address, location, nearbyPlaces, checkInTime, checkOutTime, cancellationPolicy, houseRules, documents, pgType, hostLivesOnProperty, familyFriendly, resortType, activities } = req.body;
    if (!propertyName || !propertyType || !coverImage) return res.status(400).json({ message: 'Missing required fields' });
    const lowerType = propertyType.toLowerCase();
    const requiredDocs = PROPERTY_DOCUMENTS[lowerType] || [];
    const nearbyPlacesArray = Array.isArray(nearbyPlaces) ? nearbyPlaces : [];
    const docsArray = Array.isArray(documents) ? documents : [];
    const doc = new Property({
      propertyName,
      propertyType: lowerType,
      description,
      shortDescription,
      partnerId: req.user._id,
      address,
      location,
      nearbyPlaces: nearbyPlacesArray,
      amenities,
      coverImage,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      houseRules,
      pgType: lowerType === 'pg' ? pgType : undefined,
      hostLivesOnProperty: lowerType === 'homestay' ? hostLivesOnProperty : undefined,
      familyFriendly: lowerType === 'homestay' ? familyFriendly : undefined,
      resortType: lowerType === 'resort' ? resortType : undefined,
      activities: lowerType === 'resort' ? activities : undefined
    });
    // Pricing is now handled in RoomType for ALL types
    await doc.save();
    // Inline documents upsert on create
    if (docsArray.length) {
      await PropertyDocument.findOneAndUpdate(
        { propertyId: doc._id },
        {
          propertyType: lowerType,
          documents: docsArray.map(d => ({
            name: d.name || d.type,
            fileUrl: d.fileUrl,
            isRequired: requiredDocs.includes(d.name || d.type),
          })),
          verificationStatus: 'pending',
          adminRemark: undefined,
          verifiedAt: undefined
        },
        { new: true, upsert: true }
      );
      // Move property to pending for admin verification
      doc.status = 'pending';
      doc.isLive = false;
      await doc.save();
    }
    res.status(201).json({ success: true, property: doc });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (String(property.partnerId) !== String(req.user._id) && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const updatableFields = [
      'propertyName',
      'description',
      'shortDescription',
      'address',
      'location',
      'amenities',
      'coverImage',
      'checkInTime',
      'checkOutTime',
      'cancellationPolicy',
      'houseRules',
      'pgType',
      'hostLivesOnProperty',
      'familyFriendly',
      'resortType',
      'activities',
      'isLive'
    ];

    updatableFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        property[field] = payload[field];
      }
    });

    await property.save();

    res.json({ success: true, property });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const addRoomType = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { name, inventoryType, roomCategory, maxAdults, maxChildren, bedsPerRoom, totalInventory, pricePerNight, extraAdultPrice, extraChildPrice, images, amenities } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (!pricePerNight) return res.status(400).json({ message: 'pricePerNight required' });

    // For Villa, inventoryType must be 'entire'
    if (property.propertyType === 'villa' && inventoryType !== 'entire') {
      return res.status(400).json({ message: 'Villa must have inventoryType="entire"' });
    }

    if (property.propertyType === 'hotel' && inventoryType !== 'room') {
      return res.status(400).json({ message: 'Hotel must have inventoryType="room"' });
    }

    if (property.propertyType === 'resort' && inventoryType !== 'room') {
      return res.status(400).json({ message: 'Resort must have inventoryType="room"' });
    }

    // For Hostel, inventoryType must be 'bed'
    if (property.propertyType === 'hostel' && inventoryType !== 'bed') {
      return res.status(400).json({ message: 'Hostel must have inventoryType="bed"' });
    }

    // For PG, inventoryType must be 'bed'
    if (property.propertyType === 'pg' && inventoryType !== 'bed') {
      return res.status(400).json({ message: 'PG must have inventoryType="bed"' });
    }

    // For Homestay, inventoryType can be 'room' or 'entire'
    if (property.propertyType === 'homestay' && !['room', 'entire'].includes(inventoryType)) {
      return res.status(400).json({ message: 'Homestay must have inventoryType="room" or "entire"' });
    }

    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === 'string'
        ? images.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const rt = await RoomType.create({
      propertyId,
      name,
      inventoryType,
      roomCategory,
      maxAdults,
      maxChildren,
      bedsPerRoom,
      totalInventory,
      pricePerNight,
      extraAdultPrice,
      extraChildPrice,
      images: normalizedImages,
      amenities
    });
    res.status(201).json({ success: true, roomType: rt });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateRoomType = async (req, res) => {
  try {
    const { propertyId, roomTypeId } = req.params;
    const payload = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (String(property.partnerId) !== String(req.user._id) && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const roomType = await RoomType.findOne({ _id: roomTypeId, propertyId });
    if (!roomType) return res.status(404).json({ message: 'Room type not found' });

    const updatableFields = [
      'name',
      'inventoryType',
      'roomCategory',
      'maxAdults',
      'maxChildren',
      'bedsPerRoom',
      'totalInventory',
      'pricePerNight',
      'extraAdultPrice',
      'extraChildPrice',
      'images',
      'amenities',
      'isActive'
    ];

    updatableFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        roomType[field] = payload[field];
      }
    });

    if (Object.prototype.hasOwnProperty.call(payload, 'images')) {
      if (Array.isArray(payload.images)) {
        roomType.images = payload.images.filter(Boolean);
      } else if (typeof payload.images === 'string') {
        roomType.images = payload.images.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        roomType.images = [];
      }
    }

    if (payload.inventoryType) {
      if (property.propertyType === 'villa' && roomType.inventoryType !== 'entire') {
        return res.status(400).json({ message: 'Villa must have inventoryType="entire"' });
      }
      if (property.propertyType === 'hotel' && roomType.inventoryType !== 'room') {
        return res.status(400).json({ message: 'Hotel must have inventoryType="room"' });
      }
      if (property.propertyType === 'resort' && roomType.inventoryType !== 'room') {
        return res.status(400).json({ message: 'Resort must have inventoryType="room"' });
      }
      if (property.propertyType === 'hostel' && roomType.inventoryType !== 'bed') {
        return res.status(400).json({ message: 'Hostel must have inventoryType="bed"' });
      }
      if (property.propertyType === 'pg' && roomType.inventoryType !== 'bed') {
        return res.status(400).json({ message: 'PG must have inventoryType="bed"' });
      }
      if (property.propertyType === 'homestay' && !['room', 'entire'].includes(roomType.inventoryType)) {
        return res.status(400).json({ message: 'Homestay must have inventoryType="room" or "entire"' });
      }
    }

    await roomType.save();

    res.json({ success: true, roomType });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteRoomType = async (req, res) => {
  try {
    const { propertyId, roomTypeId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (String(property.partnerId) !== String(req.user._id) && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const roomType = await RoomType.findOneAndDelete({ _id: roomTypeId, propertyId });
    if (!roomType) return res.status(404).json({ message: 'Room type not found' });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const upsertDocuments = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const required = PROPERTY_DOCUMENTS[property.propertyType] || [];
    const payloadDocs = Array.isArray(req.body.documents) ? req.body.documents : [];
    const doc = await PropertyDocument.findOneAndUpdate(
      { propertyId },
      {
        propertyType: property.propertyType,
        documents: payloadDocs.map(d => ({
          type: d.type,
          name: d.name || d.type,
          fileUrl: d.fileUrl,
          isRequired: required.includes(d.name || d.type)
        })),
        verificationStatus: 'pending',
        adminRemark: undefined,
        verifiedAt: undefined
      },
      { new: true, upsert: true }
    );
    property.status = 'pending';
    property.isLive = false;
    await property.save();
    res.json({ success: true, property, propertyDocument: doc });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getPublicProperties = async (req, res) => {
  try {
    const query = { status: 'approved', isLive: true };
    if (req.query.type) {
      query.propertyType = String(req.query.type).toLowerCase();
    }
    const list = await Property.find(query).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getMyProperties = async (req, res) => {
  try {
    const query = { partnerId: req.user._id };
    if (req.query.type) {
      query.propertyType = String(req.query.type).toLowerCase();
    }
    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getPropertyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const roomTypes = await RoomType.find({ propertyId: id, isActive: true });
    const documents = await PropertyDocument.findOne({ propertyId: id });
    res.json({ property, roomTypes, documents });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
