import { PageHeader } from "@/components/about/page-header";
import { ContentSection } from "@/components/about/content-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    value: "shipping",
    question: "What are your shipping options and timeframes?",
    answer:
      "We offer free standard shipping (3-5 business days) on orders over ₦500,000 within Lagos. Express shipping (1-2 business days) is available for ₦5,000. Nationwide delivery available. All orders are fully insured.",
  },
  {
    value: "returns",
    question: "What is your return and exchange policy?",
    answer:
      "We offer a 30-day return policy for unworn items in original condition. Custom and engraved pieces are final sale. Returns are free with our prepaid return label.",
  },
  {
    value: "warranty",
    question: "What warranty do you offer on your jewelry?",
    answer:
      "All Haven jewelry comes with a lifetime warranty against manufacturing defects. This includes free repairs for normal wear and tear, stone tightening, and professional cleaning.",
  },
  {
    value: "sizing",
    question: "Can I resize my jewelry after purchase?",
    answer:
      "Yes, we offer free ring resizing within 60 days of purchase (up to 2 sizes). Additional resizing is available for a service fee. Some designs cannot be resized due to their construction.",
  },
  {
    value: "care",
    question: "How should I care for my Haven jewelry?",
    answer:
      "Store pieces separately in soft pouches, avoid contact with chemicals and cosmetics, and clean gently with a soft cloth. We recommend professional cleaning every 6-12 months.",
  },
  {
    value: "authentication",
    question: "How can I verify the authenticity of my jewelry?",
    answer:
      "Every Haven piece comes with a certificate of authenticity and is hallmarked. You can verify authenticity on our website using your unique piece number or contact our customer care team.",
  },
];

export default function CustomerCarePage() {
  return (
    <>
      <PageHeader
        title="Customer Care"
        subtitle="We're here to help you with all your jewelry needs"
      />

      <ContentSection title="Contact Information">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-light text-foreground">Phone</h3>
            <p className="text-muted-foreground">+234 803 123 4567</p>
            <p className="text-sm text-muted-foreground">
              Mon-Fri: 9AM-6PM WAT
              <br />
              Sat: 10AM-4PM WAT
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-light text-foreground">Email</h3>
            <p className="text-muted-foreground">care@havenjewelry.ng</p>
            <p className="text-sm text-muted-foreground">
              Response within 24 hours
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-light text-foreground">Live Chat</h3>
            <Button variant="outline" className="rounded-none">
              Start Chat
            </Button>
            <p className="text-sm text-muted-foreground">
              Available during business hours
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Frequently Asked Questions">
        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq) => (
            <AccordionItem
              key={faq.value}
              value={faq.value}
              className="border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ContentSection>

      <ContentSection title="Contact Form">
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-light text-foreground">
                First Name
              </label>
              <Input
                className="rounded-none"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-light text-foreground">
                Last Name
              </label>
              <Input
                className="rounded-none"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground">Email</label>
            <Input
              type="email"
              className="rounded-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground">
              Order Number (Optional)
            </label>
            <Input
              className="rounded-none"
              placeholder="Enter your order number if applicable"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-foreground">
              How can we help you?
            </label>
            <Textarea
              className="rounded-none min-h-[120px]"
              placeholder="Please describe your inquiry in detail"
            />
          </div>

          <Button type="submit" className="w-full rounded-none">
            Send Message
          </Button>
        </form>
      </ContentSection>
    </>
  );
}
