import mongoose from 'mongoose';
import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import PropertyDocument from '../models/PropertyDocument.js';
import { PROPERTY_DOCUMENTS } from '../config/propertyDocumentRules.js';

export const createProperty = async (req, res) => {
  try {
    const { propertyName, propertyType, description, shortDescription, coverImage, amenities, address, location, pricePerNight, extraAdultPrice, extraChildPrice, checkInTime, checkOutTime, cancellationPolicy, houseRules } = req.body;
    if (!propertyName || !propertyType || !coverImage) return res.status(400).json({ message: 'Missing required fields' });
    const lowerType = propertyType.toLowerCase();
    const doc = new Property({
      propertyName,
      propertyType: lowerType,
      description,
      shortDescription,
      partnerId: req.user._id,
      address,
      location,
      amenities,
      coverImage,
      pricePerNight: pricePerNight || undefined,
      extraAdultPrice: extraAdultPrice || undefined,
      extraChildPrice: extraChildPrice || undefined,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      houseRules
    });
    if (lowerType === 'villa' && !pricePerNight) return res.status(400).json({ message: 'pricePerNight required for villa' });
    await doc.save();
    res.status(201).json({ success: true, property: doc });
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
    const t = property.propertyType;
    if (['hotel', 'resort', 'hostel', 'pg'].includes(t) && !pricePerNight) return res.status(400).json({ message: 'pricePerNight required' });
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
      images,
      amenities
    });
    res.status(201).json({ success: true, roomType: rt });
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
        documents: payloadDocs.map(d => ({ name: d.name, fileUrl: d.fileUrl, isRequired: required.includes(d.name) })),
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
    const list = await Property.find({ status: 'approved', isLive: true }).sort({ createdAt: -1 });
    res.json(list);
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
