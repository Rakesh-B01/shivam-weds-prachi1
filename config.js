/* =====================================================================
   ✏️  EDIT EVERYTHING HERE — names, dates, venue, photos, functions.
   Everything on the website is built from this one file.
   (Only the WhatsApp/Open-Graph preview tags live in index.html <head>,
    because WhatsApp can't read JavaScript — see README.md.)
   ===================================================================== */
window.WEDDING_CONFIG = {
  couple: {
    groom: 'Shivam',
    bride: 'Prachi',
    hashtag: '#ShivamWedsPrachi',
  },

  hero: {
    tagline: "We're getting married!",
    subTagline: 'Shubh Vivah',
    image: ['assets/illustrations/hero.jpg', 'assets/characters/hero.svg'], // first file that exists is used
    kicker: 'With joyful hearts, we invite you',
    invite: 'Together with our families, we invite you to celebrate our wedding',
  },

  // ---------- Family invitation (from the printed card) ----------
  family: {
    ganesh: '॥ श्री गणेशाय नमः ॥',
    shloka: ['विघ्न हरण मंगल करण, श्री गणपति महाराज।', 'प्रथम निमंत्रण आपको, पूरण कीजै काज॥'],
    hosts: 'Mrs. Kiran Arora & Mr. Anil Kumar Arora',
    request: 'Solicit your gracious presence on the auspicious occasion of the',
    occasion: 'Wedding Ceremony',
    relation: 'of their beloved son',
    groomLine: 'Grand S/o Late Smt. Ramdevi & Late Sh. Bhagwan Dass Arora',
    brideLine: 'D/o Mrs. Mamta Patney & Mr. Ramesh Patney',
    compliments: ['Arora Family', 'Bhardwaj Family', 'Patney Family'],
    residence: 'Balaji Enclave, Gali No. 14, F-53, IInd Floor, Govindpuram, Ghaziabad (U.P.) - 201013',
    couplet: ['Khushi Ki Raat Hogi, Jashan Zara Datke Hoga', 'Hamare Chacha/Mama Ki Shadi Ka Andaz Zara Hatke Hoga…'],
    coupletFrom: 'Shaurya & Dhairya, Atharv, Dhritil, Yuvik',
  },

  // Main wedding moment — used by the scratch card + countdown.
  // Use ISO format with Indian time offset (+05:30).
  wedding: {
    dateTime: '2026-11-21T18:00:00+05:30',
    dateLabel: 'Saturday, 21st November 2026',
    revealMessage: 'See you there! 💍',
  },

  // ---------- Our Love Story (polaroid gallery) ----------
  // Illustrated scenes of the couple (assets/photos/photo1–6.svg, drawn by scripts/make-art.mjs).
  // To swap in your own illustrations, use portrait 4:5 images (e.g. 600x750 PNG/WebP/SVG) and update the paths.
  story: [
    { photo: ['assets/illustrations/story1.jpg', 'assets/photos/photo1.svg'], title: 'How we met', text: 'A chance meeting that changed everything ✨' },
    { photo: ['assets/illustrations/story2.jpg', 'assets/photos/photo2.svg'], title: 'First date', text: 'Chai, laughter and hours that felt like minutes' },
    { photo: ['assets/illustrations/story3.jpg', 'assets/photos/photo3.svg'], title: 'Adventures together', text: 'Every journey is better with you' },
    { photo: ['assets/illustrations/story4.jpg', 'assets/photos/photo4.svg'], title: 'The proposal', text: 'She said yes! 💍' },
    { photo: ['assets/illustrations/story5.jpg', 'assets/photos/photo5.svg'], title: 'Families meet', text: 'Two families, one big happy parivaar' },
    { photo: ['assets/illustrations/story6.jpg', 'assets/photos/photo6.svg'], title: 'Forever begins', text: 'And now, the best chapter of all ❤' },
  ],

  // ---------- The Celebrations ----------
  // theme: one of 'haldi' | 'mehendi' | 'sangeet' | 'wedding' | 'reception' (colour scheme of the card)
  // date: YYYY-MM-DD, start/end: 24h HH:MM (IST) — used for "Add to Calendar"
  // schedule (optional): several timings on the same day, shown on the back of the card
  // mapQuery (optional): what the card's Location button searches in Google Maps (defaults to venue + address)
  // dressCode / dressSwatches (optional): leave out to hide the dress-code row
  // painted (optional): true if the image is a full painted scene saved as .svg, so it fills the card
  // stickers: names from js/stickers.js
  events: [
    {
      id: 'ladies-sangeet', name: 'Ladies Sangeet', theme: 'sangeet',
      image: ['assets/characters/sangeet-w.svg', 'assets/characters/sangeet.svg'],
      painted: true, // sangeet-w.svg is a full painted scene, so it fills the card like a photo
      date: '2026-11-20', start: '20:00', end: '23:30',
      venue: 'At Our Residence',
      address: 'Balaji Enclave, Gali No. 14, F-53, IInd Floor, Govindpuram, Ghaziabad (U.P.) - 201013',
      mapQuery: 'Balaji Enclave, Govindpuram, Ghaziabad, Uttar Pradesh 201013',
      description: 'An evening of songs, dholak and dancing with the family 💃',
      stickers: ['note', 'dhol', 'disco', 'mic'],
    },
    {
      id: 'wedding', name: 'Wedding', subtitle: 'Sehra Bandi · Ghurchari · Barat', theme: 'wedding',
      image: ['assets/characters/wedding-w.svg', 'assets/illustrations/hero.jpg'],
      painted: true, // wedding-w.svg is a full painted scene, so it fills the card like a photo
      date: '2026-11-21', start: '18:00', end: '23:59',
      schedule: [['Sehra Bandi', '06:00 PM'], ['Ghurchari', '07:00 PM'], ['Departure of Barat', '08:00 PM']],
      venue: 'Hotel West View',
      address: 'Near Opulent Mall, G.T. Road, Ghaziabad (U.P.) - 201001',
      mapQuery: 'Hotel West View, Near Opulent Mall, GT Road, Ghaziabad, Uttar Pradesh 201001',
      description: 'The big day — join us as the barat sets off!',
      stickers: ['mandap', 'fire', 'kalash', 'varmala', 'rings'],
    },
  ],

  // ---------- Venue (the wedding venue) ----------
  venue: {
    name: 'Hotel West View',
    address: 'Near Opulent Mall, G.T. Road, Ghaziabad (U.P.) - 201001',
    // What Google Maps should search for (venue name + city works best, or "lat,lng")
    mapQuery: 'Hotel West View, Near Opulent Mall, GT Road, Ghaziabad, Uttar Pradesh 201001',
    landmark: 'Landmark: Near Opulent Mall, G.T. Road',
    parking: '',
  },

  // ---------- RSVP (form removed from the site; kept for the /admin page) ----------
  rsvp: {
    deadline: '',
    maxGuests: 6,
    thankYouImage: ['assets/illustrations/thankyou.jpg', 'assets/characters/thankyou.svg'],
    thankYouMessage: "Thank you! We can't wait to celebrate with you ❤",
    declineMessage: 'Thank you for letting us know — we’ll miss you, and we’re grateful for your blessings ❤',
  },

  // ---------- Footer / R.S.V.P. contacts ----------
  contacts: [
    { name: 'Mr. Anil Kumar Arora', phone: '+91 99902 94839' },
    { name: 'Mr. Lalit Kumar Arora', phone: '+91 99903 34344' },
    { name: 'Mr. Shubham Arora', phone: '+91 80766 91903' },
    { name: 'Mr. Neeraj Arora', phone: '+91 98916 59592' },
    { name: 'Mr. Rakesh Bhardwaj', phone: '+91 75038 95375' },
    { name: 'Mr. Prince Patney', phone: '+91 96504 32937' },
  ],
  contactsNote: 'L.K. Electronics',

  // ---------- Credit at the very bottom of the footer ----------
  // logo: the first file that exists is used — drop the real channel logo in as swar-prarthana-logo.png
  credit: {
    presentedBy: 'Swar Prarthana',
    url: 'https://www.youtube.com/channel/UCJPQcUbJcz1l6rLRtL_XMKA',
    email: 'rakeshbhaardwaj@gmail.com',
    logo: ['assets/brand/swar-prarthana-logo.png', 'assets/brand/swar-prarthana-logo.svg'],
  },

  // ---------- Background music (on by default) ----------
  // Put an MP3 in assets/music/ and set src, e.g. 'assets/music/our-song.mp3'.
  // Leave empty to use a soft built-in instrumental melody.
  // autoplay: true starts the music by itself. Browsers only allow sound after the guest's first
  // tap/click, so it begins then if the browser blocks it on load. Set to false for music off by default.
  // The "-light" copy is the same song re-encoded at 64 kbps: 1.45 MB instead of 5.8 MB, so it loads fast on mobile data.
  // Alternative: 'assets/music/punjabi-bhangra-instrumental.mp3' (original bhangra loop, 0.63 MB, from scripts/make-bhangra.mjs)
  music: { src: 'assets/music/alex-morgan-wedding-instrumental-light.mp3', autoplay: true },

  // ---------- Database (Supabase / Lovable Cloud) ----------
  // Only used by the /admin page now that the RSVP form is removed.
  supabase: {
    url: '',
    anonKey: '',
  },

  // Only used in demo mode (no Supabase). With Supabase, the admin password is set in supabase/schema.sql.
  demoAdminPassword: 'shaadi2026',
};
