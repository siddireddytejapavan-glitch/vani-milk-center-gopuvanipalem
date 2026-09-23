'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'te' | 'en' | 'hi';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  // TELUGU - Native language of Gopuvanipalem, Krishna / NTR District, Andhra Pradesh
  te: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.products': 'ఉత్పత్తులు & ధరలు',
    'nav.bulk': 'శుభకార్యాల ఆర్డర్లు',
    'nav.about': 'మా డెయిరీ గురించి',
    'nav.contact': 'చిరునామా & సంప్రదించండి',
    'nav.admin': 'అడ్మిన్ లాగిన్',
    'nav.cart': 'బుట్ట (కార్ట్)',
    'nav.whatsapp': 'వాట్సాప్‌లో ఆర్డర్',
    'nav.openHours': 'రోజూ: ఉదయం 5:00 - రాత్రి 10:00',
    'nav.callUs': 'ఫోన్: 7995597719',

    // Hero Section
    'hero.badge': '100% స్వచ్ఛమైన & తాజా పాలు',
    'hero.openBadge': '⏰ తెరిచి ఉంది: ఉదయం 5:00 - రాత్రి 10:00',
    'hero.title1': 'మీ కుటుంబం & శుభకార్యాలకు ',
    'hero.titleHighlight': 'స్వచ్ఛమైన తాజా పాలు & పాల ఉత్పత్తులు',
    'hero.desc': 'గోపువానిపాలెం మరియు చుట్టుపక్కల ప్రాంతాలకు రోజువారీ తాజా పాలు, స్వచ్ఛమైన గడ్డ పెరుగు, నెయ్యి, పనీర్ మరియు శుభకార్యాలకు ప్రత్యేక బకెట్ పెరుగు లభించును.',
    'hero.bullet1': 'రోజువారీ తాజా పాలు',
    'hero.bullet2': 'స్వచ్ఛమైన గడ్డ పెరుగు',
    'hero.bullet3': 'ఫంక్షన్లకు పెరుగు బకెట్లు',
    'hero.shopBtn': 'ఉత్పత్తులు చూడండి',
    'hero.whatsappBtn': 'వాట్సాప్‌లో ఆర్డర్ చేయండి',
    'hero.actualShop': '📍 మన వాణీ మిల్క్ సెంటర్ షాప్',
    'hero.pureBadge': '100% స్వచ్ఛం',
    'hero.bucketNote': 'శుభకార్యాలకు పెరుగు బకెట్లు (5kg, 10kg, 20kg)',

    // Product Section
    'products.title': 'మా తాజా ఉత్పత్తులు',
    'products.subtitle': 'నాణ్యమైన తాజా ఆవు & గేదె పాలు, పెరుగు మరియు పాల ఉత్పత్తులు',
    'products.all': 'అన్నీ',
    'products.packSize': 'పరిమాణం ఎంచుకోండి:',
    'products.inStock': 'స్టాక్ ఉంది',
    'products.outOfStock': 'ప్రస్తుతం అందుబాటులో లేదు',
    'products.addToCart': 'కార్ట్‌కు జోడించండి',
    'products.added': 'కార్ట్‌లో చేర్చబడింది!',
    'products.quality': 'ఉత్తమ నాణ్యత',
    'products.price': 'ధర',

    // Cart & Checkout
    'cart.title': 'మీ ఆర్డర్ కార్ట్',
    'cart.empty': 'మీ కార్ట్ ఖాళీగా ఉంది',
    'cart.emptyDesc': 'తాజా పాలు మరియు పెరుగును ఎంచుకోవడానికి ఉత్పత్తుల పేజీని చూడండి.',
    'cart.subtotal': 'మొత్తం వెల',
    'cart.delivery': 'హోమ్ డెలివరీ',
    'cart.free': 'ఉచితం',
    'cart.total': 'మొత్తం చెల్లించవలసినది',
    'cart.checkoutBtn': 'వాట్సాప్‌లో ఆర్డర్ నిర్ధారించండి',
    'cart.continue': 'మరిన్ని ఉత్పత్తులు కొనండి',
    'cart.customerInfo': 'కస్టమర్ వివరాలు',
    'cart.fullName': 'మీ పేరు',
    'cart.phone': 'ఫోన్ నంబర్',
    'cart.address': 'డెలివరీ చిరునామా / లొకేషన్',
    'cart.detectGps': 'నా ప్రస్తుత GPS లొకేషన్ గుర్తించు',
    'cart.gpsDetecting': 'GPS లొకేషన్ గుర్తిస్తోంది...',
    'cart.gpsSuccess': 'GPS లొకేషన్ విజయవంతంగా గుర్తించబడింది!',
    'cart.deliveryRouteInfo': 'డెలివరీ బాయ్ ఈ లొకేషన్ ఆధారంగా నేరుగా మీ ఇంటికి చేరుకుంటారు.',
    'cart.payOnDelivery': 'ఆర్డర్ అందిన తర్వాత నగదు లేదా UPI ద్వారా చెల్లించవచ్చు',

    // Bulk & Functions
    'bulk.title': 'శుభకార్యాలు & ఫంక్షన్లకు ఆర్డర్లు',
    'bulk.desc': 'వివాహాలు, గృహప్రవేశాలు మరియు అన్ని శుభకార్యాలకు పెద్ద మొత్తంలో పాలు, పెరుగు బకెట్లు (5L, 10L, 20L), నెయ్యి మరియు పనీర్ ఆర్డర్లు స్వీకరించబడును.',
    'bulk.orderNow': 'ఫంక్షన్ ఆర్డర్ ఇవ్వండి',

    // Contact & Location
    'contact.title': 'షాప్ చిరునామా & సంప్రదించండి',
    'contact.subtitle': 'గోపువానిపాలెంలో మా దుకాణాన్ని నేరుగా సందర్శించండి లేదా ఫోన్/వాట్సాప్ ద్వారా సంప్రదించండి',
    'contact.liveLocation': 'షాప్ లైవ్ లొకేషన్',
    'contact.plusCode': 'Google Plus Code: 659J+CX2',
    'contact.copyCode': 'కోడ్ కాపీ చేయండి',
    'contact.copied': 'కాపీ చేయబడింది!',
    'contact.openMaps': 'గూగుల్ మ్యాప్స్‌లో చూడండి',
    'contact.timings': 'షాప్ పనివేళలు',
    'contact.morning': 'ఉదయం: 5:00 AM - 12:30 PM',
    'contact.evening': 'సాయంత్రం: 4:30 PM - 10:00 PM',
    'contact.ownerContact': 'షాప్ యజమాని సంప్రదింపు సంఖ్య',
    'contact.ownerName': 'సిద్దిరెడ్డి లక్ష్మణ్ కుమార్',

    // Delivery Boy Portal
    'delivery.portalTitle': 'డెలివరీ బాయ్ పోర్టల్',
    'delivery.markDelivered': 'డెలివరీ పూర్తయింది & యజమానికి తెలపండి',
    'delivery.submitting': 'నమోదు అవుతోంది...',
    'delivery.deliveredSuccess': 'డెలివరీ విజయవంతంగా నమోదైంది!',
    'delivery.notifyOwnerWhatsapp': 'యజమానికి వాట్సాప్‌లో నిర్ధారణ పంపండి',
    'delivery.customerPhone': 'కస్టమర్‌కు కాల్ చేయండి',
    'delivery.mapRoute': 'మ్యాప్ రూట్ నావిగేషన్',

    // Footer
    'footer.rights': 'సర్వహక్కులు రక్షించబడ్డాయి.',
    'footer.tagline': 'స్వచ్ఛమైన పాల ఉత్పత్తులకు మీ నమ్మకమైన కేంద్రం - గోపువానిపాలెం.',
  },

  // HINDI - Commonly understood across India and local businesses
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.products': 'उत्पाद और दरें',
    'nav.bulk': 'शादी व समारोह ऑर्डर',
    'nav.about': 'डेयरी के बारे में',
    'nav.contact': 'पता और संपर्क',
    'nav.admin': 'एडमिन लॉगिन',
    'nav.cart': 'कार्ट',
    'nav.whatsapp': 'व्हाट्सएप ऑर्डर',
    'nav.openHours': 'प्रतिदिन: सुबह 5:00 - रात 10:00',
    'nav.callUs': 'कॉल: 7995597719',

    // Hero Section
    'hero.badge': '100% शुद्ध और ताजा डेयरी',
    'hero.openBadge': '⏰ खुला है: सुबह 5:00 - रात 10:00',
    'hero.title1': 'आपके परिवार व समारोहों के लिए ',
    'hero.titleHighlight': 'शुद्ध ताजा दूध और डेयरी उत्पाद',
    'hero.desc': 'गोपुवानीपालेम और आसपास के क्षेत्रों के लिए रोजाना ताजा दूध, गाढ़ा दही, शुद्ध घी, पनीर और शादी-समारोहों के लिए विशेष दही बकेट उपलब्ध है।',
    'hero.bullet1': 'दैनिक ताजा दूध',
    'hero.bullet2': 'गाढ़ा मटका दही',
    'hero.bullet3': 'फंक्शन हेतु दही बकेट',
    'hero.shopBtn': 'उत्पाद देखें',
    'hero.whatsappBtn': 'व्हाट्सएप पर ऑर्डर करें',
    'hero.actualShop': '📍 हमारी असली दुकान (गोपुवानीपालेम)',
    'hero.pureBadge': '100% शुद्ध',
    'hero.bucketNote': 'समारोहों के लिए दही बकेट (5kg, 10kg, 20kg)',

    // Product Section
    'products.title': 'हमारे ताजा उत्पाद',
    'products.subtitle': 'उत्कृष्ट गुणवत्ता का दूध, दही, पनीर, मक्खन और शुद्ध घी',
    'products.all': 'सभी',
    'products.packSize': 'पैक साइज चुनें:',
    'products.inStock': 'उपलब्ध है',
    'products.outOfStock': 'स्टॉक समाप्त',
    'products.addToCart': 'कार्ट में जोड़ें',
    'products.added': 'कार्ट में जोड़ा गया!',
    'products.quality': 'सर्वोत्तम गुणवत्ता',
    'products.price': 'मूल्य',

    // Cart & Checkout
    'cart.title': 'आपकी शॉपिंग कार्ट',
    'cart.empty': 'आपकी कार्ट खाली है',
    'cart.emptyDesc': 'ताजा दूध और दही चुनने के लिए हमारे उत्पाद देखें।',
    'cart.subtotal': 'उप-कुल',
    'cart.delivery': 'होम डिलीवरी',
    'cart.free': 'मुफ्त',
    'cart.total': 'कुल राशि',
    'cart.checkoutBtn': 'व्हाट्सएप पर ऑर्डर की पुष्टि करें',
    'cart.continue': 'और उत्पाद देखें',
    'cart.customerInfo': 'ग्राहक विवरण',
    'cart.fullName': 'पूरा नाम',
    'cart.phone': 'फोन नंबर',
    'cart.address': 'डिलीवरी का पता / स्थान',
    'cart.detectGps': 'मेरा लाइव GPS लोकेशन खोजें',
    'cart.gpsDetecting': 'GPS लोकेशन खोजी जा रही है...',
    'cart.gpsSuccess': 'GPS लोकेशन सफलतापूर्वक मिल गई!',
    'cart.deliveryRouteInfo': 'डिलीवरी बॉय सीधे इस लोकेशन पर आपके घर पहुंचेंगे।',
    'cart.payOnDelivery': 'डिलीवरी मिलने पर नकद या UPI द्वारा भुगतान करें',

    // Bulk & Functions
    'bulk.title': 'शादी और समारोहों के लिए थोक ऑर्डर',
    'bulk.desc': 'विवाह, गृह प्रवेश और विशेष आयोजनों के लिए बड़ी मात्रा में दूध, दही के बकेट (5kg, 10kg, 20kg), घी और पनीर का ऑर्डर दें।',
    'bulk.orderNow': 'थोक ऑर्डर करें',

    // Contact & Location
    'contact.title': 'दुकान का पता व संपर्क',
    'contact.subtitle': 'गोपुवानीपालेम में हमारी दुकान पर आएं या सीधे फोन/व्हाट्सएप पर संपर्क करें',
    'contact.liveLocation': 'दुकान का लाइव लोकेशन',
    'contact.plusCode': 'Google Plus Code: 659J+CX2',
    'contact.copyCode': 'कोड कॉपी करें',
    'contact.copied': 'कॉपी हो गया!',
    'contact.openMaps': 'गूगल मैप्स पर खोलें',
    'contact.timings': 'दुकान का समय',
    'contact.morning': 'सुबह: 5:00 AM - 12:30 PM',
    'contact.evening': 'शाम: 4:30 PM - 10:00 PM',
    'contact.ownerContact': 'दुकानदार का संपर्क',
    'contact.ownerName': 'सिद्धिरेड्डी लक्ष्मण कुमार',

    // Delivery Boy Portal
    'delivery.portalTitle': 'डिलीवरी बॉय पोर्टल',
    'delivery.markDelivered': 'डिलीवर हो गया और मालिक को सूचित करें',
    'delivery.submitting': 'सबमिट हो रहा है...',
    'delivery.deliveredSuccess': 'डिलीवरी सफलतापूर्वक दर्ज हुई!',
    'delivery.notifyOwnerWhatsapp': 'मालिक को व्हाट्सएप पर मैसेज भेजें',
    'delivery.customerPhone': 'ग्राहक को कॉल करें',
    'delivery.mapRoute': 'मैप रूट नेविगेशन',

    // Footer
    'footer.rights': 'सर्वाधिकार सुरक्षित।',
    'footer.tagline': 'गोपुवानीपालेम में शुद्ध डेयरी उत्पादों का विश्वसनीय केंद्र।',
  },

  // ENGLISH
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products & Prices',
    'nav.bulk': 'Function / Bulk Orders',
    'nav.about': 'About Our Dairy',
    'nav.contact': 'Contact & Location',
    'nav.admin': 'Admin Login',
    'nav.cart': 'Cart',
    'nav.whatsapp': 'WhatsApp Order',
    'nav.openHours': 'Daily: 5:00 AM - 10:00 PM',
    'nav.callUs': 'Call: 7995597719',

    // Hero Section
    'hero.badge': '100% Pure & Farm Fresh Dairy',
    'hero.openBadge': '⏰ Open: 5:00 AM – 10:00 PM',
    'hero.title1': 'Fresh Milk & Dairy Products for ',
    'hero.titleHighlight': 'Your Family & Functions',
    'hero.desc': 'Fresh, high-quality dairy products available for daily needs, family functions, marriages and special events in Gopuvanipalem and nearby villages.',
    'hero.bullet1': 'Daily Fresh Milk',
    'hero.bullet2': 'Thick Set Curd',
    'hero.bullet3': 'Bulk Function Buckets',
    'hero.shopBtn': 'Shop Products',
    'hero.whatsappBtn': 'Order on WhatsApp',
    'hero.actualShop': '📍 Our Actual Shop (Gopuvanipalem)',
    'hero.pureBadge': '100% Pure',
    'hero.bucketNote': 'Curd Buckets for Functions (5kg, 10kg, 20kg)',

    // Product Section
    'products.title': 'Our Fresh Products',
    'products.subtitle': 'Pure cow & buffalo milk, thick curd, paneer, and farm-fresh dairy items',
    'products.all': 'All Products',
    'products.packSize': 'Select Pack Size:',
    'products.inStock': 'In Stock',
    'products.outOfStock': 'Currently Unavailable',
    'products.addToCart': 'Add to Cart',
    'products.added': 'Added to Cart!',
    'products.quality': 'Premium Quality',
    'products.price': 'Price',

    // Cart & Checkout
    'cart.title': 'Your Shopping Cart',
    'cart.empty': 'Your cart is currently empty',
    'cart.emptyDesc': 'Explore our fresh dairy collection to add milk, curd, and more.',
    'cart.subtotal': 'Subtotal',
    'cart.delivery': 'Home Delivery',
    'cart.free': 'FREE',
    'cart.total': 'Total Payable',
    'cart.checkoutBtn': 'Confirm Order on WhatsApp',
    'cart.continue': 'Continue Shopping',
    'cart.customerInfo': 'Customer Information',
    'cart.fullName': 'Full Name',
    'cart.phone': 'Phone Number',
    'cart.address': 'Delivery Address / Landmarks',
    'cart.detectGps': 'Detect My Live GPS Location',
    'cart.gpsDetecting': 'Detecting Live GPS...',
    'cart.gpsSuccess': 'Live GPS Location Detected!',
    'cart.deliveryRouteInfo': 'Delivery rider will follow this live navigation route to your home.',
    'cart.payOnDelivery': 'Pay on Delivery with Cash or UPI QR',

    // Bulk & Functions
    'bulk.title': 'Marriage & Bulk Function Orders',
    'bulk.desc': 'We specialize in large-volume dairy supplies for weddings, housewarmings, temple feasts and functions. Special curd buckets (5L, 10L, 20L) available.',
    'bulk.orderNow': 'Order for Function',

    // Contact & Location
    'contact.title': 'Visit & Contact Our Shop',
    'contact.subtitle': 'Come visit us directly in Gopuvanipalem or connect with us on phone / WhatsApp',
    'contact.liveLocation': 'Shop Live Location',
    'contact.plusCode': 'Google Plus Code: 659J+CX2',
    'contact.copyCode': 'Copy Plus Code',
    'contact.copied': 'Copied to Clipboard!',
    'contact.openMaps': 'Open in Google Maps',
    'contact.timings': 'Opening Hours',
    'contact.morning': 'Morning: 5:00 AM - 12:30 PM',
    'contact.evening': 'Evening: 4:30 PM - 10:00 PM',
    'contact.ownerContact': 'Shop Owner Contact',
    'contact.ownerName': 'Siddireddy Lakshman Kumar',

    // Delivery Boy Portal
    'delivery.portalTitle': 'Delivery Boy Portal',
    'delivery.markDelivered': 'Mark Delivered & Notify Owner on WhatsApp',
    'delivery.submitting': 'Submitting Delivery...',
    'delivery.deliveredSuccess': 'Delivery Submitted in Platform!',
    'delivery.notifyOwnerWhatsapp': 'Send Confirmation to Owner on WhatsApp',
    'delivery.customerPhone': 'Call Customer',
    'delivery.mapRoute': 'Google Maps Route',

    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.tagline': 'Your trusted local dairy partner in Gopuvanipalem, Andhra Pradesh.',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'te',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>('te');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vani_milk_lang') as Language;
      if (saved && (saved === 'te' || saved === 'en' || saved === 'hi')) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('vani_milk_lang', lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
