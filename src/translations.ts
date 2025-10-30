// Language translations
export type Language = 'en' | 'cs';

export const translations = {
  en: {
    // Greeting & Menu
    welcome: (businessName: string) => `Welcome to ${businessName}!`,
    selectService: "Please select a service from our menu:",
    replyWithService: "To book your appointment, please reply with the exact name of the service you'd like.",
    
    // Service Selection
    availableServices: "Here are the available services:",
    replyWithExactName: "Please reply with the exact name of the service you'd like to book.",
    serviceNotFound: "I couldn't find that service. Please select from our list:",
    
    // Date Selection
    whatDate: "What date would you like to book your appointment? (e.g., tomorrow, next Friday, 7th October, or any date)",
    dateNotUnderstood: "Sorry, I couldn't understand that date. Please try again with any date format you prefer (e.g., tomorrow, next Tuesday, October 7th, 7.10., etc.)",
    noSlotsAvailable: (date: string) => `Sorry — there are no available slots for ${date}.`,
    slotsAvailableFor: (service: string, date: string, tz: string, offset: string) => 
      `For ${service} on ${date} we have slots available for (times shown in ${tz}, UTC${offset}):`,
    replyWithTime: "Reply with the time range you want, or type 'more' to show more available slots.",
    
    // Slot Selection
    moreSlots: "More available slots for this date:",
    noMoreSlots: "No more available slots for this date.",
    availableSlotsFor: (date: string, tz: string, offset: string) => 
      `Available slots for ${date} (times shown in ${tz} ${offset}):`,
    timeNotAvailable: "I don't see that time available. Please pick a time range from the list above, or type 'more' to show more slots.",
    timeRangeNotAvailable: "I don't see that time range available. Please pick a time range from the list above, or type 'more' to show more slots.",
    slotNumberNotFound: "I don't see that slot number. Please pick a time from the list above, or type 'more' to show more slots.",
    
    // Contact Details
    youPicked: (time: string, service: string) => 
      `You picked: ${time} for ${service}. Please reply with your full name and email address to confirm the booking. (e.g. John Doe, john@example.com)`,
    provideNameEmail: "Please reply with your full name and email address, separated by a comma. (e.g. John Doe, john@example.com)",
    
    // Confirmation
    confirmBooking: (name: string, email: string) => 
      `Thank you, ${name}! Please confirm you want to book this slot for ${email} by replying 'yes'.`,
    replyYesToConfirm: "Please reply 'yes' to confirm your booking, or 'no' to cancel.",
    
    // Booking Success
    bookingSuccessPrompt: (service: string, time: string, name: string, email: string, businessName: string) =>
      `Confirm to the user that their booking is successful.\nService: ${service}\nTime: ${time}\nName: ${name}\nEmail: ${email}\nMake it sound warm and welcoming. Sign off with "Best regards, ${businessName} Team"`,
    
    // Errors
    bookingError: "Sorry, there was an error creating your booking. Please try again or contact us directly.",
    didntUnderstand: "Tell the user you didn't understand and that they can type 'hi' to start again.",
    
    // System Prompts
    systemPromptFriendly: "You are a friendly assistant.",
    systemPromptBarbershop: "You are a friendly barbershop assistant.",
    systemPromptGeneral: "You are an assistant.",
  },
  
  cs: {
    // Pozdrav & Menu
    welcome: (businessName: string) => `Vítejte v ${businessName}!`,
    selectService: "Prosím vyberte si službu z našeho menu:",
    replyWithService: "Pro rezervaci termínu odpovězte přesným názvem služby, kterou si přejete.",
    
    // Výběr služby
    availableServices: "Zde jsou dostupné služby:",
    replyWithExactName: "Prosím odpovězte přesným názvem služby, kterou si přejete rezervovat.",
    serviceNotFound: "Nemohl jsem najít tuto službu. Prosím vyberte ze seznamu:",
    
    // Výběr data
    whatDate: "Jaké datum byste chtěli rezervovat? (např. zítra, příští pátek, 7. října, 30.10., nebo jakékoliv datum)",
    dateNotUnderstood: "Omlouváme se, datum jsem nepochopil. Zkuste to prosím znovu s libovolným formátem data (např. zítra, příští úterý, 7. října, 30.10., atd.)",
    noSlotsAvailable: (date: string) => `Omlouváme se — pro ${date} nejsou žádné volné termíny.`,
    slotsAvailableFor: (service: string, date: string, tz: string, offset: string) => 
      `Pro ${service} dne ${date} máme volné termíny (časy zobrazeny v ${tz}, UTC${offset}):`,
    replyWithTime: "Odpovězte časem, který chcete, nebo napište 'více' pro zobrazení dalších volných termínů.",
    
    // Výběr termínu
    moreSlots: "Další dostupné termíny pro toto datum:",
    noMoreSlots: "Žádné další volné termíny pro toto datum.",
    availableSlotsFor: (date: string, tz: string, offset: string) => 
      `Dostupné termíny pro ${date} (časy zobrazeny v ${tz} ${offset}):`,
    timeNotAvailable: "Tento čas není k dispozici. Prosím vyberte časové rozmezí ze seznamu výše, nebo napište 'více' pro zobrazení dalších termínů.",
    timeRangeNotAvailable: "Toto časové rozmezí není k dispozici. Prosím vyberte časové rozmezí ze seznamu výše, nebo napište 'více' pro zobrazení dalších termínů.",
    slotNumberNotFound: "Toto číslo termínu nevidím. Prosím vyberte čas ze seznamu výše, nebo napište 'více' pro zobrazení dalších termínů.",
    
    // Kontaktní údaje
    youPicked: (time: string, service: string) => 
      `Vybrali jste si: ${time} pro ${service}. Prosím odpovězte vaším celým jménem a emailovou adresou pro potvrzení rezervace. (např. Jan Novák, jan@example.com)`,
    provideNameEmail: "Prosím odpovězte vaším celým jménem a emailovou adresou, odděleným čárkou. (např. Jan Novák, jan@example.com)",
    
    // Potvrzení
    confirmBooking: (name: string, email: string) => 
      `Děkujeme, ${name}! Prosím potvrďte, že chcete rezervovat tento termín pro ${email} odpovědí 'ano'.`,
    replyYesToConfirm: "Prosím odpovězte 'ano' pro potvrzení vaší rezervace, nebo 'ne' pro zrušení.",
    
    // Úspěšná rezervace
    bookingSuccessPrompt: (service: string, time: string, name: string, email: string, businessName: string) =>
      `Potvrďte uživateli, že jeho rezervace byla úspěšná.\nSlužba: ${service}\nČas: ${time}\nJméno: ${name}\nEmail: ${email}\nNechte to znít přátelsky a příjemně. Podepište se "S pozdravem, tým ${businessName}"`,
    
    // Chyby
    bookingError: "Omlouváme se, při vytváření vaší rezervace došlo k chybě. Prosím zkuste to znovu nebo nás kontaktujte přímo.",
    didntUnderstand: "Řekněte uživateli, že jste nerozuměli a že může napsat 'ahoj' pro začátek znovu.",
    
    // Systémové příkazy
    systemPromptFriendly: "Jsi přátelský asistent.",
    systemPromptBarbershop: "Jsi přátelský asistent holičství.",
    systemPromptGeneral: "Jsi asistent.",
  }
};

// Get current language from environment or default to Czech
export const LANGUAGE: Language = (process.env.LANGUAGE as Language) || 'cs';

// Helper function to get translation
export const t = translations[LANGUAGE];

