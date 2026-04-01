const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'i18n.ts');
let content = fs.readFileSync(filePath, 'utf8');

const arStrings = `
      // Additional Translations
      "chat.welcomeMessage": "أهلاً بك! أنا مساعدك الصحي الذكي الخاص ببرنامج \\"راصد\\". يمكنك سؤالي عن قواعد البيانات، الأعراض، الأمراض، وحالات البلاغات ضمن النظام.",
      "chat.botNoAnswer": "عذراً، لم أتمكن من العثور على إجابة محددة الآن.",
      "chat.serverError": "عذراً، حدث خطأ أثناء الاتصال بالخادم.",
      "chat.quickQuestions.q1": "ما هي أعراض الكوليرا؟",
      "chat.quickQuestions.q2": "ما هي الجداول المتاحة في قاعدة البيانات؟",
      "chat.quickQuestions.q3": "أحدث البلاغات",
      "chat.quickQuestions.q4": "احصائيات الأمراض",
      "chat.smartAssistant": "المساعد الذكي",
      "chat.typeMessage": "اكتب رسالتك هنا...",
      "chat.loading": "جاري...",
      "chat.send": "إرسال",

      "contact.subtitle": "يسعدنا تواصلكم معنا. نحن هنا لمساعدتكم في أي استفسار.",
      "contact.callDirectly": "اتصل بنا مباشرة",
      "contact.sendEmail": "ارسل لنا بريداً إلكترونياً",
      "contact.whatsappText": "تواصل عبر واتساب",
      "contact.whatsappTitle": "راصد واتساب",

      "forgot.fillRequired": "يرجى تعبئة جميع الحقول المطلوبة",
      "forgot.passwordsNotMatch": "كلمات المرور غير متطابقة",
      "forgot.passwordLength": "يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل",
      "forgot.phoneNotRegistered": "رقم الهاتف غير مسجل في النظام",
      "forgot.errorSendingOtp": "حدث خطأ أثناء إرسال رمز التحقق، يرجى المحاولة لاحقاً",
      "forgot.serverError": "حدث خطأ في الاتصال بالخادم",
      "forgot.title": "نسيت كلمة المرور؟",
      "forgot.subtitle": "أدخل رقم هاتفك لتغيير كلمة المرور الخاصة بك. ستتمكن من تسجيل الدخول بكلمة المرور الجديدة فوراً.",
      "forgot.phoneLabel": "رقم الهاتف",
      "forgot.newPasswordLabel": "كلمة المرور الجديدة",
      "forgot.newPasswordPlaceholder": "ستة أحرف أو أكثر",
      "forgot.confirmPasswordLabel": "تأكيد كلمة المرور الجديدة",
      "forgot.confirmPasswordPlaceholder": "أعد كتابة كلمة المرور",
      "forgot.updating": "جاري التحقق...",
      "forgot.updateBtn": "تحديث كلمة المرور",

      "newsDetails.title": "تفاصيل الخبر",
      "newsDetails.urgent": "عاجل",
      "newsDetails.date": "١٢ أكتوبر ٢٠٢٣",
      "newsDetails.city": "صنعاء",
      "newsDetails.headline": "حملة تطعيم وطنية شاملة ضد الكوليرا تنطلق في العاصمة صنعاء",
      "newsDetails.p1": "أعلنت وزارة الصحة العامة والسكان اليوم عن انطلاق حملة تطعيم وطنية شاملة تستهدف مكافحة تفشي وباء الكوليرا في العاصمة صنعاء وعدد من المحافظات المجاورة. تأتي هذه الخطوة استجابةً للزيادة الملحوظة في عدد الحالات المسجلة خلال الأسابيع الماضية.",
      "newsDetails.p2": "وأوضح المتحدث الرسمي باسم الوزارة أن الحملة ستستمر لمدة عشرة أيام، وتستهدف جميع الفئات العمرية المعرضة للخطر، مع التركيز بشكل خاص على الأطفال دون سن الخامسة وكبار السن. وقد تم تجهيز أكثر من ٥٠٠ مركز صحي وفرق ميدانية متنقلة للوصول إلى المناطق النائية.",
      "newsDetails.p3": "ودعت الوزارة جميع المواطنين إلى التعاون مع الفرق الطبية والتوجه إلى أقرب مركز صحي لأخذ اللقاح، مؤكدة أن اللقاحات آمنة ومعتمدة من منظمة الصحة العالمية. كما شددت على أهمية الالتزام بالإجراءات الوقائية، مثل غسل اليدين بانتظام وشرب المياه النظيفة.",
      "newsDetails.p4": "تأتي هذه الجهود بدعم من منظمات دولية ومحلية لضمان توفير الإمدادات الطبية اللازمة واحتواء الوباء قبل انتشاره بشكل أوسع.",
      "newsDetails.share": "مشاركة الخبر",

      "otp.enter6Digits": "يرجى إدخال الرمز المكون من 6 أرقام",
      "otp.invalidOtp": "رمز التحقق غير صحيح، حاول مرة أخرى",
      "otp.errorUpdatingPassword": "حدث خطأ أثناء تحديث كلمة المرور.",
      "otp.errorCreatingAccount": "حدث خطأ أثناء إنشاء الحساب، قد يكون رقم الهاتف مستخدماً بالفعل.",
      "otp.serverConnectionFailed": "فشل الاتصال بالخادم، يرجى المحاولة لاحقاً",
      "otp.errorResending": "حدث خطأ أثناء إعادة الإرسال.",
      "otp.title": "رمز التحقق",
      "otp.subtitle": "تم إرسال رمز التحقق إلى رقم هاتفك",
      "otp.didNotReceive": "لم يصلك الرمز؟",
      "otp.resend": "إعادة الإرسال",
      "otp.confirmBtn": "تأكيد"
`;

const enStrings = `
      // Additional Translations
      "chat.welcomeMessage": "Welcome! I am your smart health assistant for 'Rasid'. You can ask me about databases, symptoms, diseases, and report statuses in the system.",
      "chat.botNoAnswer": "Sorry, I couldn't find a specific answer right now.",
      "chat.serverError": "Sorry, an error occurred while connecting to the server.",
      "chat.quickQuestions.q1": "What are cholera symptoms?",
      "chat.quickQuestions.q2": "What tables are available in the database?",
      "chat.quickQuestions.q3": "Latest Reports",
      "chat.quickQuestions.q4": "Disease Statistics",
      "chat.smartAssistant": "Smart Assistant",
      "chat.typeMessage": "Type your message here...",
      "chat.loading": "Processing...",
      "chat.send": "Send",

      "contact.subtitle": "We are happy to communicate with you. We are here to help you with any inquiry.",
      "contact.callDirectly": "Call us directly",
      "contact.sendEmail": "Send us an email",
      "contact.whatsappText": "Contact via WhatsApp",
      "contact.whatsappTitle": "Rasid WhatsApp",

      "forgot.fillRequired": "Please fill all required fields",
      "forgot.passwordsNotMatch": "Passwords do not match",
      "forgot.passwordLength": "Password must be at least 6 characters or numbers",
      "forgot.phoneNotRegistered": "Phone number is not registered in the system",
      "forgot.errorSendingOtp": "An error occurred while sending the verification code. Please try again later.",
      "forgot.serverError": "Server connection error",
      "forgot.title": "Forgot Password?",
      "forgot.subtitle": "Enter your phone number to change your password. You will be able to log in with your new password immediately.",
      "forgot.phoneLabel": "Phone Number",
      "forgot.newPasswordLabel": "New Password",
      "forgot.newPasswordPlaceholder": "Six characters or more",
      "forgot.confirmPasswordLabel": "Confirm New Password",
      "forgot.confirmPasswordPlaceholder": "Re-enter the password",
      "forgot.updating": "Verifying...",
      "forgot.updateBtn": "Update Password",

      "newsDetails.title": "News Details",
      "newsDetails.urgent": "Urgent",
      "newsDetails.date": "12 October 2023",
      "newsDetails.city": "Sanaa",
      "newsDetails.headline": "Comprehensive national cholera vaccination campaign launched in the capital Sanaa",
      "newsDetails.p1": "The Ministry of Public Health and Population announced today the launch of a comprehensive national vaccination campaign aimed at combating the cholera outbreak in the capital, Sanaa, and a number of neighboring governorates. This step comes in response to the noticeable increase in the number of cases recorded during the past weeks.",
      "newsDetails.p2": "The official spokesman for the ministry explained that the campaign will last for ten days, targeting all age groups at risk, with a special focus on children under the age of five and the elderly. More than 500 health centers and mobile field teams have been equipped to reach remote areas.",
      "newsDetails.p3": "The ministry called on all citizens to cooperate with the medical teams and go to the nearest health center to take the vaccine, stressing that the vaccines are safe and approved by the World Health Organization. It also stressed the importance of adhering to preventive measures, such as washing hands regularly and drinking clean water.",
      "newsDetails.p4": "These efforts come with the support of international and local organizations to ensure the provision of necessary medical supplies and contain the epidemic before it spreads more widely.",
      "newsDetails.share": "Share News",

      "otp.enter6Digits": "Please enter the 6-digit code",
      "otp.invalidOtp": "Invalid verification code, try again",
      "otp.errorUpdatingPassword": "An error occurred while updating the password.",
      "otp.errorCreatingAccount": "An error occurred while creating the account, the phone number may already be in use.",
      "otp.serverConnectionFailed": "Failed to connect to the server, please try again later",
      "otp.errorResending": "An error occurred while resending.",
      "otp.title": "Verification Code",
      "otp.subtitle": "A verification code has been sent to your phone number",
      "otp.didNotReceive": "Didn't receive the code?",
      "otp.resend": "Resend",
      "otp.confirmBtn": "Confirm"
`;

content = content.replace(
  /"Already have an account\? ": "لديك حساب بالفعل\? "/g,
  '"Already have an account? ": "لديك حساب بالفعل\? ",\n' + arStrings
);

content = content.replace(
  /"Widespread rash": "Widespread rash"/g,
  '"Widespread rash": "Widespread rash",\n' + enStrings
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated i18n.ts');
