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
    whatDate: "What date would you like to book your appointment? (e.g., tomorrow, next Friday, 30.10., 30 10, or any date)",
    dateNotUnderstood: "Sorry, I couldn't understand that date. Please try again with any date format you prefer (e.g., tomorrow, next Tuesday, 30.10., 30 10, etc.)",
    noSlotsAvailable: (date: string) => `Sorry — there are no available slots for ${date}.`,
    noSlotsPastDate: (date: string) => `Sorry — ${date} has already passed. Please choose a future date.`,
    noSlotsWeekend: (date: string) => `Sorry — we're closed on ${date}. We're only open on weekdays. Please choose a weekday.`,
    noSlotsAllPast: (date: string) => `Sorry — all slots for today have already passed. Please choose a later time or another day.`,
    noSlotsFullyBooked: (date: string) => `Sorry — all slots for ${date} are fully booked. Please choose another day.`,
    slotsAvailableFor: (service: string, date: string, tz: string, offset: string) => 
      `For ${service} on ${date} we have slots available for (times shown in ${tz}, UTC${offset}):`,
    replyWithTime: "Reply with the time you want, or type 'more' for more slots.",
    
    // Slot Selection
    moreSlots: "More available slots for this date:",
    noMoreSlots: "No more available slots for this date.",
    availableSlotsFor: (date: string, tz: string, offset: string) => 
      `Available slots for ${date} (times shown in ${tz} ${offset}):`,
    timeNotAvailable: "I don't see that time available. Please pick a time from the list above, describe when you'd like (e.g., 'morning', 'afternoon'), or type 'more' for more slots.",
    timeRangeNotAvailable: "I don't see that time range available. Please pick a time from the list above, describe when you'd like (e.g., 'around 2', 'early'), or type 'more' for more slots.",
    slotNumberNotFound: "I couldn't find a matching time slot. Please pick a time from the list above, describe when you'd like (e.g., 'morning', 'after 2'), or type 'more' for more slots.",
    
    // Contact Details
    youPicked: (time: string, service: string) => 
      `You picked: ${time} for ${service}.\n\nPlease reply with your full name and email address. (e.g. John Doe, john@example.com)\n\nNote: If you've booked before with this phone number, use the same email address.`,
    provideNameEmail: "Please reply with your full name and email address, separated by a comma. (e.g. John Doe, john@example.com)",
    invalidNameFormat: "Please provide your name without the @ symbol. Format: Full Name, email@example.com",
    invalidEmail: "That email address doesn't look valid. Please provide a valid email address. (e.g. John Doe, john@example.com)",
    confirmTimeChange: (currentTime: string) => 
      `You already selected ${currentTime}. Do you want to change your time? Reply 'yes' to change or 'no' to keep it.`,
    timeChangeConfirmed: "Okay, let's pick a new time.",
    confirmTimeChangePrompt: "Please reply 'yes' if you want to change your time, or 'no' to keep your current selection.",
    
    // Confirmation
    confirmBooking: (name: string, email: string) => 
      `Thank you, ${name}! Please confirm you want to book this slot for ${email} by replying 'yes'.`,
    replyYesToConfirm: "Please reply 'yes' to confirm your booking, or 'no' to cancel.",
    
    // Booking Success
    bookingSuccessPrompt: (service: string, time: string, name: string, email: string, businessName: string) =>
      `Confirm to the user that their booking is successful.\nService: ${service}\nTime: ${time}\nName: ${name}\nEmail: ${email}\nMake it sound warm and welcoming. Sign off with "Best regards, ${businessName} Team"`,
    bookingSuccessSimple: (service: string, time: string, businessName: string) =>
      `✅ Booking confirmed!\n\nService: ${service}\nTime: ${time}\n\nThank you for your booking! We look forward to seeing you.\n\nBest regards,\n${businessName} Team`,
    
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
    whatDate: "Jaké datum byste chtěli rezervovat? (např. zítra, příští pátek, 30.10., 30 10, nebo jakékoliv datum)",
    dateNotUnderstood: "Omlouváme se, datum jsem nepochopil. Zkuste to prosím znovu s libovolným formátem data (např. zítra, příští úterý, 30.10., 30 10, atd.)",
    noSlotsAvailable: (date: string) => `Omlouváme se — pro ${date} nejsou žádné volné termíny.`,
    noSlotsPastDate: (date: string) => `Omlouváme se — ${date} již prošlo. Prosím vyberte budoucí datum.`,
    noSlotsWeekend: (date: string) => `Omlouváme se — v ${date} máme zavřeno. Jsme otevřeni pouze ve všední dny. Prosím vyberte všední den.`,
    noSlotsAllPast: (date: string) => `Omlouváme se — všechny dnešní termíny již prošly. Prosím vyberte pozdější čas nebo jiný den.`,
    noSlotsFullyBooked: (date: string) => `Omlouváme se — všechny termíny pro ${date} jsou obsazené. Prosím vyberte jiný den.`,
    slotsAvailableFor: (service: string, date: string, tz: string, offset: string) => 
      `Pro ${service} dne ${date} máme volné termíny (časy zobrazeny v ${tz}, UTC${offset}):`,
    replyWithTime: "Odpovězte časem, který chcete, nebo napište 'více' pro další termíny.",
    
    // Výběr termínu
    moreSlots: "Další dostupné termíny pro toto datum:",
    noMoreSlots: "Žádné další volné termíny pro toto datum.",
    availableSlotsFor: (date: string, tz: string, offset: string) => 
      `Dostupné termíny pro ${date} (časy zobrazeny v ${tz} ${offset}):`,
    timeNotAvailable: "Tento čas není k dispozici. Prosím vyberte čas ze seznamu výše, popište kdy chcete (např. 'ráno', 'odpoledne'), nebo napište 'více' pro další termíny.",
    timeRangeNotAvailable: "Toto časové rozmezí není k dispozici. Prosím vyberte čas ze seznamu výše, popište kdy chcete (např. 'kolem 14', 'brzy'), nebo napište 'více' pro další termíny.",
    slotNumberNotFound: "Nemohl jsem najít odpovídající termín. Prosím vyberte čas ze seznamu výše, popište kdy chcete (např. 'ráno', 'po 14'), nebo napište 'více' pro další termíny.",
    
    // Kontaktní údaje
    youPicked: (time: string, service: string) => 
      `Vybrali jste si: ${time} pro ${service}.\n\nProsím odpovězte vaším celým jménem a emailovou adresou. (např. Jan Novák, jan@example.com)\n\nPoznámka: Pokud jste již dříve rezervovali s tímto telefonním číslem, použijte stejnou emailovou adresu.`,
    provideNameEmail: "Prosím odpovězte vaším celým jménem a emailovou adresou, odděleným čárkou. (např. Jan Novák, jan@example.com)",
    invalidNameFormat: "Prosím zadejte své jméno bez symbolu @. Formát: Celé jméno, email@example.com",
    invalidEmail: "Tato emailová adresa nevypadá platně. Prosím zadejte platnou emailovou adresu. (např. Jan Novák, jan@example.com)",
    confirmTimeChange: (currentTime: string) => 
      `Už jste vybrali ${currentTime}. Chcete změnit čas? Odpovězte 'ano' pro změnu nebo 'ne' pro zachování.`,
    timeChangeConfirmed: "Dobře, vybereme nový čas.",
    confirmTimeChangePrompt: "Prosím odpovězte 'ano' pokud chcete změnit čas, nebo 'ne' pro zachování aktuálního výběru.",
    
    // Potvrzení
    confirmBooking: (name: string, email: string) => 
      `Děkujeme, ${name}! Prosím potvrďte, že chcete rezervovat tento termín pro ${email} odpovědí 'ano'.`,
    replyYesToConfirm: "Prosím odpovězte 'ano' pro potvrzení vaší rezervace, nebo 'ne' pro zrušení.",
    
    // Úspěšná rezervace
    bookingSuccessPrompt: (service: string, time: string, name: string, email: string, businessName: string) =>
      `Potvrďte uživateli, že jeho rezervace byla úspěšná.\nSlužba: ${service}\nČas: ${time}\nJméno: ${name}\nEmail: ${email}\nNechte to znít přátelsky a příjemně. Podepište se "S pozdravem, tým ${businessName}"`,
    bookingSuccessSimple: (service: string, time: string, businessName: string) =>
      `✅ Rezervace potvrzena!\n\nSlužba: ${service}\nČas: ${time}\n\nDěkujeme za vaši rezervaci! Těšíme se na vás.\n\nS pozdravem,\ntým ${businessName}`,
    
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

