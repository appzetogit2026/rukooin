import axios from 'axios';
const key = 'AIzaSyBD9XADWUsuj0M3LWr3d9NjUEEsvDPU_eU';

async function testGeocoding() {
  const lat = 22.727937155016356;
  const lng = 75.88418110735832;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
  console.log('--- Testing Geocoding API ---');
  try {
    const { data } = await axios.get(url);
    console.log('Status:', data.status);
    if (data.error_message) console.log('Error:', data.error_message);
  } catch (e) {
    console.error('Failed:', e.message);
  }
}

async function testPlaces() {
  const query = 'Hospital';
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`;
  console.log('\n--- Testing Places API ---');
  try {
    const { data } = await axios.get(url);
    console.log('Status:', data.status);
    if (data.error_message) console.log('Error:', data.error_message);
  } catch (e) {
    console.error('Failed:', e.message);
  }
}

await testGeocoding();
await testPlaces();
