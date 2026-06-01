export type FaqCategoryIcon = 'orders' | 'payment' | 'returns' | 'product' | 'account';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  icon: FaqCategoryIcon;
  questions: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'orders-shipping',
    title: 'Orders & Shipping',
    icon: 'orders',
    questions: [
      {
        id: 'os-1',
        question: 'How do I place an order?',
        answer:
          'Browse our collection, add items to your cart, and proceed to checkout. Complete your shipping details, choose Cash on Delivery or Bank Transfer, review your order, and confirm. You will receive an order number on the confirmation page and by email.',
      },
      {
        id: 'os-2',
        question: 'What are the shipping charges?',
        answer:
          'Standard shipping is $9.99 for orders under $100. Orders of $100 or more qualify for complimentary shipping. Additional fees may apply for gift wrap or Cash on Delivery (COD). Final shipping and fees are shown at checkout before you place your order.',
      },
      {
        id: 'os-3',
        question: 'How long does delivery take?',
        answer:
          'Domestic orders typically arrive within 5–7 business days after dispatch. Custom or made-to-order pieces may require 2–3 weeks of production before shipping. Your estimated delivery date appears on your order confirmation and tracking page.',
      },
      {
        id: 'os-4',
        question: 'Do you ship internationally?',
        answer:
          'We currently ship across Pakistan with full checkout support. International shipping is available on request for select destinations—contact our concierge team with your country and cart details for a custom quote.',
      },
      {
        id: 'os-5',
        question: 'Can I track my order?',
        answer:
          'Yes. Visit our Track Order page and enter your order number (e.g. TTH-2026-0001) plus the email used at checkout. You will see live status updates from order placed through delivery.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    icon: 'payment',
    questions: [
      {
        id: 'pay-1',
        question: 'What payment methods do you accept?',
        answer:
          'We accept Cash on Delivery (COD) and Bank Transfer. Choose your preferred method during checkout. Bank transfer customers can upload a receipt on our website or send it via WhatsApp.',
      },
      {
        id: 'pay-2',
        question: 'How does COD work?',
        answer:
          'Select Cash on Delivery at checkout. A small COD service fee applies. Pay the courier in cash when your package arrives. Please keep exact change ready when possible to speed up delivery.',
      },
      {
        id: 'pay-3',
        question: 'How do I pay via bank transfer?',
        answer:
          'Choose Bank Transfer at checkout. Our HBL account details are displayed on the payment step. Transfer the order total, then upload your receipt (JPG, PNG, or PDF) or send it via WhatsApp. Orders are processed after payment verification within 24–48 business hours.',
      },
      {
        id: 'pay-4',
        question: 'Is my payment information secure?',
        answer:
          'We do not store card data on our servers. Bank transfers are verified manually against uploaded receipts. Your contact and order details are encrypted in transit and stored only as needed to fulfil your order.',
      },
      {
        id: 'pay-5',
        question: 'Do you accept partial payments?',
        answer:
          'For standard orders, full payment is required before dispatch (bank transfer) or upon delivery (COD). For high-value custom commissions, we may arrange a deposit—please contact us with your project details.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    icon: 'returns',
    questions: [
      {
        id: 'ret-1',
        question: 'What is your return policy?',
        answer:
          'Unworn items in original packaging may be returned within 14 days of delivery for a refund or exchange. Custom, engraved, and sale items marked final sale are not eligible unless there is a craftsmanship defect.',
      },
      {
        id: 'ret-2',
        question: 'How do I return an item?',
        answer:
          'Email concierge@thetwistedthreads.com with your order number and reason for return. We will provide a return authorisation and shipping instructions. Items must be securely packaged to avoid damage in transit.',
      },
      {
        id: 'ret-3',
        question: 'When will I get my refund?',
        answer:
          'Refunds are processed within 5–7 business days after we receive and inspect your return. Bank transfer refunds are sent to the original account; COD orders may receive bank transfer refunds—our team will confirm details with you.',
      },
      {
        id: 'ret-4',
        question: 'Can I exchange a product?',
        answer:
          'Yes, subject to stock availability. Note your preferred replacement on the return request. If the new item differs in price, we will contact you to arrange payment or refund of the difference.',
      },
    ],
  },
  {
    id: 'product',
    title: 'Product Information',
    icon: 'product',
    questions: [
      {
        id: 'prod-1',
        question: 'Are your products handmade?',
        answer:
          'Every piece in our collection is handcrafted or hand-finished in our atelier. Slight variations in texture and finish are natural signatures of artisan work—not defects.',
      },
      {
        id: 'prod-2',
        question: 'What materials do you use?',
        answer:
          'We work with recycled precious metals, ethically sourced gemstones, silk threads, and natural fibres. Each product page lists specific materials. We avoid nickel-heavy alloys in our skin-contact pieces.',
      },
      {
        id: 'prod-3',
        question: 'How do I care for my jewelry?',
        answer:
          'Store pieces in a dry pouch, away from direct sunlight and perfume. Clean gently with a soft cloth; avoid harsh chemicals and ultrasonic cleaners unless noted. Remove jewelry before swimming or exercising.',
      },
      {
        id: 'prod-4',
        question: 'Do you offer customization?',
        answer:
          'Yes. We accept bespoke commissions for rings, necklaces, and textile-jewelry hybrids. Use the Custom Order option on our contact page or WhatsApp us with reference images, sizing, and your timeline.',
      },
      {
        id: 'prod-5',
        question: 'Are your products hypoallergenic?',
        answer:
          'Most earrings and chains use hypoallergenic hooks and nickel-conscious alloys. If you have specific sensitivities, contact us before ordering—we can advise on materials or suggest alternatives.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Privacy',
    icon: 'account',
    questions: [
      {
        id: 'acc-1',
        question: 'Do I need an account to order?',
        answer:
          'No account is required. Add items to your cart and check out as a guest using your email and shipping details. Creating an account (coming soon) will let you view order history faster.',
      },
      {
        id: 'acc-2',
        question: 'How is my data protected?',
        answer:
          'We collect only information needed to process orders and support you. Data is not sold to third parties. Checkout details are stored securely in your browser session and our order logs. See our Privacy Policy for full details.',
      },
      {
        id: 'acc-3',
        question: 'Can I save my favorite items?',
        answer:
          'Use the wishlist heart icon on product pages to save favourites locally on your device. Saved items persist until you clear browser data. Account-based wishlists will be available in a future update.',
      },
    ],
  },
];
