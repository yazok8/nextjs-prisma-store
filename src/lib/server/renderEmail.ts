import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Define the type for the email data
type RenderPurchaseReceiptProps = {
  order: {
    id: string;
    pricePaidInCents: number;
    createdAt: Date;
  };
  product: {
    id: string;
    name: string;
  };
  downloadVerificationId: string;
};

// Register Handlebars helpers once to avoid redundant registrations
Handlebars.registerHelper('formatAmount', function(amount: number) {
  return (amount / 100).toFixed(2);
});

Handlebars.registerHelper('formatDate', function(date: Date) {
  return new Date(date).toLocaleDateString();
});

// Pre-compile the template once and reuse it
const templatePath = path.join(process.cwd(), 'src', 'templates', 'purchaseReceipt.hbs');
const source = fs.readFileSync(templatePath, 'utf8');
const compiledTemplate = Handlebars.compile(source);

export function renderPurchaseReceiptEmail(props: RenderPurchaseReceiptProps): string {
  const data = {
    order: props.order,
    product: props.product,
    amountPaid: (props.order.pricePaidInCents / 100).toFixed(2),
    orderDate: props.order.createdAt.toDateString(),
    downloadVerificationId: props.downloadVerificationId,
  };
  
  return compiledTemplate(data);
}
