import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

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

export function renderPurchaseReceiptEmail(props: RenderPurchaseReceiptProps): string {
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'purchaseReceipt.hbs');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const data = {
      order: props.order,
      product: props.product,
      amountPaid: (props.order.pricePaidInCents / 100).toFixed(2),
      orderDate: props.order.createdAt.toDateString(),
      downloadVerificationId: props.downloadVerificationId,
    };
    return template(data);
  }