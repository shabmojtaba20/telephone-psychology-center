// Legacy calendar bridge disabled.
// The V2 booking flow in booking-v2.js now owns consultant selection, date rendering,
// slot loading, and booking interactions. Running the legacy bridge alongside V2
// caused duplicate consultant-change handling and misleading calendar error messages.
(() => {
  const legacy = document.getElementById('bookingForm');
  if (legacy) legacy.style.display = 'none';
})();
